// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Like & Bookmark Actions Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post } from '../../types/social.ts';
import { socialApi } from '../../api/socialApi.ts';

interface UseLikeActionParams {
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
  backendUserId,
  posts,
  setPosts,
  recordLikeToggle,
}: UseLikeActionParams) {
  const handleToggleLike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const nextIsLiked = !post.isLiked;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, isLiked: nextIsLiked, likesCount: calcNewLikesCount(p.likesCount, nextIsLiked) };
      })
    );
    recordLikeToggle(nextIsLiked);

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
  }, [posts, backendUserId, setPosts, recordLikeToggle]);

  const handleToggleBookmark = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  }, [setPosts]);

  return {
    handleToggleLike,
    handleToggleBookmark,
  };
}
