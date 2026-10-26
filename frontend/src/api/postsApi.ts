// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Writer API

import { api } from './client.ts';

export interface BackendPost {
  id: string;
  userId: string;
  text?: string;
  mediaUrl?: string;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  deleted: boolean;
}

export interface CreatePostRequest {
  userId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | string;
  hashtags?: string[];
}

export interface UpdatePostRequest {
  userId: string;
  text?: string;
  hashtags?: string[];
}

export interface DeletePostResponse {
  postId: string;
  deleted: boolean;
}

export const postsApi = {
  createPost(request: CreatePostRequest): Promise<BackendPost> {
    return api.post<BackendPost>('/v1/posts', request);
  },

  getPost(postId: string): Promise<BackendPost> {
    const encodedId = encodeURIComponent(postId);
    return api.get<BackendPost>(`/v1/posts/${encodedId}`);
  },

  updatePost(postId: string, request: UpdatePostRequest): Promise<BackendPost> {
    const encodedId = encodeURIComponent(postId);
    return api.put<BackendPost>(`/v1/posts/${encodedId}`, request);
  },

  deletePost(postId: string, userId: string): Promise<DeletePostResponse> {
    const encodedPostId = encodeURIComponent(postId);
    const encodedUserId = encodeURIComponent(userId);
    return api.del<DeletePostResponse>(`/v1/posts/${encodedPostId}?userId=${encodedUserId}`);
  },
};
