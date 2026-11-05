// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Follows API Submodule

import { api } from './client.ts';

export interface FollowRequest {
  followerId: string;
  followingId: string;
}

export interface FollowResponse {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
}

export const socialFollowsApi = {
  followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    return api.post<FollowResponse>('/v1/follow', { followerId, followingId });
  },

  unfollowUser(followerId: string, followingId: string, method: 'DELETE' | 'POST' = 'DELETE'): Promise<FollowResponse> {
    if (method === 'DELETE') {
      return api.del<FollowResponse>('/v1/unfollow', { followerId, followingId });
    }
    return api.post<FollowResponse>('/v1/unfollow', { followerId, followingId });
  },

  getFollowers(userId: string): Promise<string[]> {
    const encodedUserId = encodeURIComponent(userId);
    return api.get<string[]>(`/v1/follow/${encodedUserId}/followers`);
  },

  getFollowing(userId: string): Promise<string[]> {
    const encodedUserId = encodeURIComponent(userId);
    return api.get<string[]>(`/v1/follow/${encodedUserId}/following`);
  },

  async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
    const encodedFollowerId = encodeURIComponent(followerId);
    const encodedFollowingId = encodeURIComponent(followingId);
    const res = await api.get<{ isFollowing: boolean }>(
      `/v1/follow/status?followerId=${encodedFollowerId}&followingId=${encodedFollowingId}`
    );
    return res.isFollowing;
  },
};
