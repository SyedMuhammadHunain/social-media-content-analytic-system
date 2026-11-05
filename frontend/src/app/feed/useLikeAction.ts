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

interface LikeApiRequest {
  isLiked: boolean;
  userId: string;
  postId: string;
}

function calcNewLikesCount(count: number, isLiked: boolean): number {
  if (isLiked) return count + 1;
  return Math.max(0, count - 1);
}

function dispatchLikeApi(req: LikeApiRequest) {
  if (req.isLiked) {
    return socialApi.likePost(req.userId, req.postId);
  }
  return socialApi.unlikePost(req.userId, req.postId);
}

function shouldNotifyAuthor(post: Post, user: UserProfile | undefined, backendUserId: string): boolean {
  if (post.author.id === backendUserId) return false;
  return post.author.id !== user?.id;
}

function resolvePostSnippet(post: Post): string {
  const rawText = post.text || post.description || '';
  if (!rawText) return 'your post';
  if (rawText.length > 40) return `${rawText.slice(0, 40)}...`;
  return rawText;
}

function notifyPostAuthorOfLike(post: Post, user: UserProfile | undefined, backendUserId: string) {
  const actorName = user?.name || 'A creator';
  const snippet = resolvePostSnippet(post);

  notificationsApi
    .triggerNotification({
      recipientUserId: post.author.id,
      actorUserId: backendUserId,
      actorName,
      actorAvatar: user?.avatarUrl,
      type: 'LIKE',
      targetPostId: post.id,
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

function applyOptimisticLike(
  postId: string,
  nextIsLiked: boolean,
  nextCount: number,
  setPosts: Dispatch<SetStateAction<Post[]>>
) {
  updateSharedPost(postId, (p) => ({
    ...p,
    isLiked: nextIsLiked,
    likesCount: nextCount,
  }));

  setPosts((prev) =>
    prev.map((p) => (p.id === postId ? { ...p, isLiked: nextIsLiked, likesCount: nextCount } : p))
  );
}

async function syncServerLikeCount(
  req: LikeApiRequest,
  setPosts: Dispatch<SetStateAction<Post[]>>
) {
  try {
    const res = await dispatchLikeApi(req);
    if (typeof res?.totalLikes === 'number') {
      setPosts((prev) =>
        prev.map((p) => (p.id === req.postId ? { ...p, likesCount: res.totalLikes } : p))
      );
    }
  } catch {
    // Offline fallback
  }
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
    const nextCount = calcNewLikesCount(post.likesCount, nextIsLiked);

    applyOptimisticLike(postId, nextIsLiked, nextCount, setPosts);
    recordLikeToggle(nextIsLiked);

    if (nextIsLiked && shouldNotifyAuthor(post, user, backendUserId)) {
      notifyPostAuthorOfLike(post, user, backendUserId);
    }

    await syncServerLikeCount({ isLiked: nextIsLiked, userId: backendUserId, postId }, setPosts);
  }, [posts, backendUserId, user, setPosts, recordLikeToggle]);

  const handleToggleBookmark = useCallback((postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const nextIsBookmarked = post ? !post.isBookmarked : true;

    updateSharedPost(postId, (p) => ({ ...p, isBookmarked: nextIsBookmarked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: nextIsBookmarked } : p))
    );
  }, [posts, setPosts]);

  return {
    handleToggleLike,
    handleToggleBookmark,
  };
}
