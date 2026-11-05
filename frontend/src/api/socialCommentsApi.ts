// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comments API Submodule

import { api } from './client.ts';

export interface CommentRequest {
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface BackendComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  deleted: boolean;
}

export const socialCommentsApi = {
  addComment(request: CommentRequest): Promise<BackendComment> {
    return api.post<BackendComment>('/v1/comment', request);
  },

  getComments(postId: string): Promise<BackendComment[]> {
    const encodedPostId = encodeURIComponent(postId);
    return api.get<BackendComment[]>(`/v1/comment/${encodedPostId}`);
  },

  deleteComment(commentId: string, userId: string): Promise<{ commentId: string; deleted: boolean }> {
    const encodedCommentId = encodeURIComponent(commentId);
    const encodedUserId = encodeURIComponent(userId);
    return api.del<{ commentId: string; deleted: boolean }>(
      `/v1/comment/${encodedCommentId}?userId=${encodedUserId}`
    );
  },
};
