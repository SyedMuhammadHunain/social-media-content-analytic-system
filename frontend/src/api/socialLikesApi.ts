// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Likes API Submodule

import { api } from './client.ts';

export interface LikeRequest {
  userId: string;
  postId: string;
}

export interface LikeResponse {
  postId: string;
  liked: boolean;
  totalLikes: number;
}

export const socialLikesApi = {
  likePost(userId: string, postId: string): Promise<LikeResponse> {
    return api.post<LikeResponse>('/v1/like', { userId, postId });
  },

  unlikePost(userId: string, postId: string, method: 'DELETE' | 'POST' = 'DELETE'): Promise<LikeResponse> {
    if (method === 'DELETE') {
      return api.del<LikeResponse>('/v1/unlike', { userId, postId });
    }
    return api.post<LikeResponse>('/v1/unlike', { userId, postId });
  },

  getLikeStatus(postId: string, userId?: string): Promise<LikeResponse> {
    const encodedPostId = encodeURIComponent(postId);
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return api.get<LikeResponse>(`/v1/like/${encodedPostId}/status${query}`);
  },
};
