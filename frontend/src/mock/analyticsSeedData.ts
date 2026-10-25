// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Seed Data (PDF Section 4.1.vii, viii, ix)

import type { LikeUnlikePoint, FollowerTrendPoint, EngagementPoint, CreatorSummaryMetrics } from '../types/analytics';

export const INITIAL_LIKE_UNLIKE_DATA: LikeUnlikePoint[] = [
  { date: 'Mon', likes: 420, unlikes: 18 },
  { date: 'Tue', likes: 580, unlikes: 24 },
  { date: 'Wed', likes: 510, unlikes: 15 },
  { date: 'Thu', likes: 690, unlikes: 31 },
  { date: 'Fri', likes: 840, unlikes: 22 },
  { date: 'Sat', likes: 920, unlikes: 28 },
  { date: 'Today', likes: 1140, unlikes: 35 },
];

export const INITIAL_FOLLOWERS_DATA: FollowerTrendPoint[] = [
  { date: 'Mon', followers: 13850, netChange: 45 },
  { date: 'Tue', followers: 13910, netChange: 60 },
  { date: 'Wed', followers: 13980, netChange: 70 },
  { date: 'Thu', likesChange: 85, followers: 14065, netChange: 85 } as any,
  { date: 'Fri', followers: 14110, netChange: 45 },
  { date: 'Sat', followers: 14160, netChange: 50 },
  { date: 'Today', followers: 14200, netChange: 40 },
].map(d => ({ date: d.date, followers: d.followers, netChange: d.netChange }));

export const INITIAL_ENGAGEMENT_DATA: EngagementPoint[] = [
  { date: 'Mon', comments: 95, engagementScore: 475 },
  { date: 'Tue', comments: 130, engagementScore: 650 },
  { date: 'Wed', comments: 110, engagementScore: 550 },
  { date: 'Thu', comments: 165, engagementScore: 825 },
  { date: 'Fri', comments: 190, engagementScore: 950 },
  { date: 'Sat', comments: 215, engagementScore: 1075 },
  { date: 'Today', comments: 240, engagementScore: 1200 },
];

export const INITIAL_SUMMARY_METRICS: CreatorSummaryMetrics = {
  totalFollowers: 14200,
  totalLikes: 5100,
  totalUnlikes: 173,
  totalComments: 1145,
  engagementRate: '8.4%',
};
