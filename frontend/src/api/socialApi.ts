// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Social Engagement API Aggregator

import { socialLikesApi, type LikeRequest, type LikeResponse } from './socialLikesApi.ts';
import { socialCommentsApi, type CommentRequest, type BackendComment } from './socialCommentsApi.ts';
import { socialFollowsApi, type FollowRequest, type FollowResponse } from './socialFollowsApi.ts';

export type {
  LikeRequest,
  LikeResponse,
  CommentRequest,
  BackendComment,
  FollowRequest,
  FollowResponse,
};

export const socialApi = {
  // Likes
  likePost: socialLikesApi.likePost,
  unlikePost: socialLikesApi.unlikePost,
  getLikeStatus: socialLikesApi.getLikeStatus,

  // Comments
  addComment: socialCommentsApi.addComment,
  getComments: socialCommentsApi.getComments,
  deleteComment: socialCommentsApi.deleteComment,

  // Follows
  followUser: socialFollowsApi.followUser,
  unfollowUser: socialFollowsApi.unfollowUser,
  getFollowers: socialFollowsApi.getFollowers,
  getFollowing: socialFollowsApi.getFollowing,
  checkFollowStatus: socialFollowsApi.checkFollowStatus,
};

export default socialApi;
