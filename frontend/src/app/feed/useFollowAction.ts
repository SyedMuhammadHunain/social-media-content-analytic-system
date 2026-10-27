// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Follow/Unfollow Graph Action Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, UserProfile, SuggestedCreator } from '../../types/social.ts';
import { socialApi } from '../../api/socialApi.ts';

interface UseFollowActionParams {
  backendUserId: string;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  suggestedCreators: SuggestedCreator[];
  setSuggestedCreators: Dispatch<SetStateAction<SuggestedCreator[]>>;
  setUser: Dispatch<SetStateAction<UserProfile>>;
  recordFollowToggle: (isFollowed: boolean) => void;
}

function resolveNextFollowState(creator?: SuggestedCreator, post?: Post): boolean {
  if (creator) return !creator.isFollowed;
  if (post) return !post.author.isFollowed;
  return true;
}

export function useFollowAction({
  backendUserId,
  posts,
  setPosts,
  suggestedCreators,
  setSuggestedCreators,
  setUser,
  recordFollowToggle,
}: UseFollowActionParams) {
  const handleToggleFollow = useCallback(async (userId: string) => {
    const creator = suggestedCreators.find((c) => c.id === userId);
    const post = posts.find((p) => p.author.id === userId);
    const nextIsFollowed = resolveNextFollowState(creator, post);

    setSuggestedCreators((prev) =>
      prev.map((c) => (c.id === userId ? { ...c, isFollowed: nextIsFollowed } : c))
    );

    setPosts((prev) =>
      prev.map((p) =>
        p.author.id === userId ? { ...p, author: { ...p.author, isFollowed: nextIsFollowed } } : p
      )
    );

    setUser((prev) => ({
      ...prev,
      followingCount: nextIsFollowed ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
    }));

    recordFollowToggle(nextIsFollowed);

    try {
      if (nextIsFollowed) {
        await socialApi.followUser(backendUserId, userId);
      } else {
        await socialApi.unfollowUser(backendUserId, userId);
      }
    } catch {
      // Offline fallback
    }
  }, [suggestedCreators, posts, backendUserId, setSuggestedCreators, setPosts, setUser, recordFollowToggle]);

  return {
    handleToggleFollow,
  };
}
