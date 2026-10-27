// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Social Engagement API (Likes, Comments, Follows)

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

export interface FollowRequest {
  followerId: string;
  followingId: string;
}

export interface FollowResponse {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
}

export const socialApi = {
  // Likes
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

  // Comments
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

  // Follows
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
