// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post CRUD Actions Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, CreatePostInput, UpdatePostInput, UserProfile } from '../../types/social.ts';
import { postsApi } from '../../api/postsApi.ts';

interface UsePostCrudParams {
  user: UserProfile;
  backendUserId: string;
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

function buildOptimisticPost(input: CreatePostInput, user: UserProfile, tempId: string): Post {
  return {
    id: tempId,
    userId: user.id,
    author: user,
    type: input.type,
    text: input.text,
    description: input.description,
    mediaUrls: input.mediaUrl ? [input.mediaUrl] : undefined,
    hashtags: input.hashtags,
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    comments: [],
    createdAt: 'Just now',
  };
}

export function usePostCrud({ user, backendUserId, setPosts }: UsePostCrudParams) {
  const handleCreatePost = useCallback(async (input: CreatePostInput) => {
    const tempId = `post_${Date.now()}`;
    const newPost = buildOptimisticPost(input, user, tempId);

    setPosts((prev) => [newPost, ...prev]);

    try {
      const created = await postsApi.createPost({
        userId: backendUserId,
        text: input.text,
        mediaUrl: input.mediaUrl,
        mediaType: input.type,
        hashtags: input.hashtags,
      });

      if (created?.id) {
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: created.id } : p))
        );
      }
    } catch {
      // Offline fallback
    }
  }, [user, backendUserId, setPosts]);

  const handleEditPost = useCallback(async (postId: string, input: UpdatePostInput) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          text: input.text ?? p.text,
          description: input.description ?? p.description,
          mediaUrls: input.mediaUrls ?? p.mediaUrls,
          hashtags: input.hashtags ?? p.hashtags,
        };
      })
    );

    try {
      await postsApi.updatePost(postId, {
        userId: backendUserId,
        text: input.text,
        hashtags: input.hashtags,
      });
    } catch {
      // Offline fallback
    }
  }, [backendUserId, setPosts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await postsApi.deletePost(postId, backendUserId);
    } catch {
      // Offline fallback
    }
  }, [backendUserId, setPosts]);

  return {
    handleCreatePost,
    handleEditPost,
    handleDeletePost,
  };
}
