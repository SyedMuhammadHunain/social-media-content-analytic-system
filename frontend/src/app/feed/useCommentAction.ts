// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Addition Action Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, UserProfile, Comment } from '../../types/social.ts';
import { socialApi } from '../../api/socialApi.ts';

interface UseCommentActionParams {
  user: UserProfile;
  backendUserId: string;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  recordComment: () => void;
}

export function useCommentAction({
  user,
  backendUserId,
  setPosts,
  recordComment,
}: UseCommentActionParams) {
  const handleAddComment = useCallback(async (postId: string, text: string, parentCommentId?: string) => {
    const tempCommentId = `c_${Date.now()}`;

    const newComment: Comment = {
      id: tempCommentId,
      postId,
      userId: user.id,
      author: user,
      text,
      parentCommentId,
      createdAt: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      })
    );
    recordComment();

    try {
      const saved = await socialApi.addComment({
        userId: backendUserId,
        postId,
        content: text,
        parentCommentId,
      });

      if (saved?.id) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) =>
                c.id === tempCommentId ? { ...c, id: saved.id, parentCommentId: saved.parentCommentId } : c
              ),
            };
          })
        );
      }
    } catch {
      // Offline fallback
    }
  }, [user, backendUserId, setPosts, recordComment]);

  return {
    handleAddComment,
  };
}
