// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Actions & Mutations Orchestrator Hook

'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Post, UserProfile, SuggestedCreator } from '../../types/social.ts';
import { usePostCrud } from './usePostCrud.ts';
import { useSocialInteractions } from './useSocialInteractions.ts';

export interface UseFeedMutationsParams {
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

export function useFeedMutations(params: UseFeedMutationsParams) {
  const postCrud = usePostCrud({
    user: params.user,
    backendUserId: params.backendUserId,
    setPosts: params.setPosts,
  });

  const social = useSocialInteractions(params);

  return {
    ...postCrud,
    ...social,
  };
}
