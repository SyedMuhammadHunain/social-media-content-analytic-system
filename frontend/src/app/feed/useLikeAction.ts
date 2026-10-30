// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Like & Bookmark Actions Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, UserProfile } from '../../types/social.ts';
import { socialApi } from '../../api/socialApi.ts';
import { notificationsApi } from '../../api/notificationsApi.ts';
import { updateSharedPost } from '../../utils/sharedPostsStore.ts';

interface UseLikeActionParams {
  user?: UserProfile;
  backendUserId: string;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  recordLikeToggle: (isLiked: boolean) => void;
}

function calcNewLikesCount(count: number, isLiked: boolean): number {
  return isLiked ? count + 1 : Math.max(0, count - 1);
}

async function dispatchLikeApi(isLiked: boolean, userId: string, postId: string) {
  if (isLiked) {
    return socialApi.likePost(userId, postId);
  }
  return socialApi.unlikePost(userId, postId);
}

export function useLikeAction({
  user,
  backendUserId,
  posts,
  setPosts,
  recordLikeToggle,
}: UseLikeActionParams) {
  const handleToggleLike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const nextIsLiked = !post.isLiked;

    updateSharedPost(postId, (p) => ({
      ...p,
      isLiked: nextIsLiked,
      likesCount: calcNewLikesCount(p.likesCount, nextIsLiked),
    }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, isLiked: nextIsLiked, likesCount: calcNewLikesCount(p.likesCount, nextIsLiked) };
      })
    );
    recordLikeToggle(nextIsLiked);

    if (nextIsLiked && post.author.id !== backendUserId && post.author.id !== user?.id) {
      const actorName = user?.name || 'A creator';
      const rawText = post.text || post.description || '';
      const snippet = rawText ? (rawText.length > 40 ? `${rawText.slice(0, 40)}...` : rawText) : 'your post';
      notificationsApi
        .triggerNotification({
          recipientUserId: post.author.id,
          actorUserId: backendUserId,
          actorName,
          actorAvatar: user?.avatarUrl,
          type: 'LIKE',
          targetPostId: postId,
          message: `${actorName} liked your post: '${snippet}'`,
        })
        .catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('social:new-notification', {
            detail: {
              recipientUserId: post.author.id,
              actorName,
              type: 'LIKE',
            },
          })
        );
      }
    }

    try {
      const res = await dispatchLikeApi(nextIsLiked, backendUserId, postId);
      if (typeof res?.totalLikes === 'number') {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likesCount: res.totalLikes } : p))
        );
      }
    } catch {
      // Offline fallback
    }
  }, [posts, backendUserId, user, setPosts, recordLikeToggle]);

  const handleToggleBookmark = useCallback((postId: string) => {
    updateSharedPost(postId, (p) => ({ ...p, isBookmarked: !p.isBookmarked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  }, [setPosts]);

  return {
    handleToggleLike,
    handleToggleBookmark,
  };
}
