// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Social Engagement Interactions Hook

'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Post, UserProfile, SuggestedCreator } from '../../types/social.ts';
import { useLikeAction } from './useLikeAction.ts';
import { useFollowAction } from './useFollowAction.ts';
import { useCommentAction } from './useCommentAction.ts';

export interface UseSocialInteractionsParams {
  user: UserProfile;
  backendUserId: string;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  suggestedCreators: SuggestedCreator[];
  setSuggestedCreators: Dispatch<SetStateAction<SuggestedCreator[]>>;
  setUser: Dispatch<SetStateAction<UserProfile>>;
  recordLikeToggle: (isLiked: boolean) => void;
  recordFollowToggle: (isFollowed: boolean) => void;
  recordComment: () => void;
}

export function useSocialInteractions({
  user,
  backendUserId,
  posts,
  setPosts,
  suggestedCreators,
  setSuggestedCreators,
  setUser,
  recordLikeToggle,
  recordFollowToggle,
  recordComment,
}: UseSocialInteractionsParams) {
  const { handleToggleLike, handleToggleBookmark } = useLikeAction({
    user,
    backendUserId,
    posts,
    setPosts,
    recordLikeToggle,
  });

  const { handleToggleFollow } = useFollowAction({
    user,
    backendUserId,
    posts,
    setPosts,
    suggestedCreators,
    setSuggestedCreators,
    setUser,
    recordFollowToggle,
  });

  const { handleAddComment } = useCommentAction({
    user,
    backendUserId,
    posts,
    setPosts,
    recordComment,
  });

  return {
    handleToggleLike,
    handleToggleFollow,
    handleToggleBookmark,
    handleAddComment,
  };
}
