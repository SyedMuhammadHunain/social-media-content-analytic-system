// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Types (PDF Section 4.1.vii, viii, ix)

export interface LikeUnlikePoint {
  date: string;
  likes: number;
  unlikes: number;
}

export interface FollowerTrendPoint {
  date: string;
  followers: number;
  netChange: number;
}

export interface EngagementPoint {
  date: string;
  comments: number;
  engagementScore: number;
}

export interface CreatorSummaryMetrics {
  totalFollowers: number;
  totalLikes: number;
  totalUnlikes: number;
  totalComments: number;
  engagementRate: string;
}

export type TimeRange = '24h' | '7d' | '30d';

export interface AnalyticsContextType {
  likeUnlikeData: LikeUnlikePoint[];
  followersData: FollowerTrendPoint[];
  engagementData: EngagementPoint[];
  summary: CreatorSummaryMetrics;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  recordLikeToggle: (isLiked: boolean) => void;
  recordFollowToggle: (isFollowed: boolean) => void;
  recordComment: () => void;
  refreshMetrics?: () => Promise<void>;
  syncUserMetrics?: (userId: string) => void;
}
