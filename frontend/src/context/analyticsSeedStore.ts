// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Seed & Isolation Store

import type {
  LikeUnlikePoint,
  FollowerTrendPoint,
  EngagementPoint,
  CreatorSummaryMetrics,
} from '../types/analytics.ts';
import type { UserProfile } from '../types/social.ts';
import {
  INITIAL_LIKE_UNLIKE_DATA,
  INITIAL_FOLLOWERS_DATA,
  INITIAL_ENGAGEMENT_DATA,
} from '../mock/analyticsSeedData.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import {
  calcEngagementRate,
  generateDynamicLikesSeries,
  generateDynamicFollowersSeries,
  generateDynamicEngagementSeries,
} from './analyticsAggregation.ts';

export interface UserBaseline {
  summary: CreatorSummaryMetrics;
  likeMultiplier: number;
  followerMultiplier: number;
  commentMultiplier: number;
}

export interface UserAnalyticsState {
  likes: LikeUnlikePoint[];
  followers: FollowerTrendPoint[];
  engagement: EngagementPoint[];
  summary: CreatorSummaryMetrics;
}

export const KNOWN_BASELINES: Record<string, UserBaseline> = {
  user_hunain: {
    summary: {
      totalFollowers: 14200,
      totalLikes: 5100,
      totalUnlikes: 173,
      totalComments: 1145,
      engagementRate: '8.4%',
    },
    likeMultiplier: 1.0,
    followerMultiplier: 1.0,
    commentMultiplier: 1.0,
  },
  user_alice: {
    summary: {
      totalFollowers: 8900,
      totalLikes: 3420,
      totalUnlikes: 92,
      totalComments: 840,
      engagementRate: '9.8%',
    },
    likeMultiplier: 0.65,
    followerMultiplier: 0.63,
    commentMultiplier: 0.73,
  },
  user_bob: {
    summary: {
      totalFollowers: 23100,
      totalLikes: 9800,
      totalUnlikes: 310,
      totalComments: 2450,
      engagementRate: '11.2%',
    },
    likeMultiplier: 1.92,
    followerMultiplier: 1.63,
    commentMultiplier: 2.14,
  },
  user_charlie: {
    summary: {
      totalFollowers: 5400,
      totalLikes: 1950,
      totalUnlikes: 45,
      totalComments: 460,
      engagementRate: '8.9%',
    },
    likeMultiplier: 0.38,
    followerMultiplier: 0.38,
    commentMultiplier: 0.40,
  },
};

export function buildUserSeries(user: UserProfile | null | undefined, fallbackId: string): UserAnalyticsState {
  const effectiveId = user?.id || fallbackId;
  const normalizedId = normalizeBackendUserId(effectiveId);

  // 1. Established seed creator baselines
  if (KNOWN_BASELINES[normalizedId]) {
    const base = KNOWN_BASELINES[normalizedId];
    const likes = INITIAL_LIKE_UNLIKE_DATA.map((d) => ({
      ...d,
      likes: Math.round(d.likes * base.likeMultiplier),
      unlikes: Math.round(d.unlikes * base.likeMultiplier),
    }));
    const followers = INITIAL_FOLLOWERS_DATA.map((d) => ({
      ...d,
      followers: Math.round(d.followers * base.followerMultiplier),
      netChange: Math.round(d.netChange * base.followerMultiplier),
    }));
    const engagement = INITIAL_ENGAGEMENT_DATA.map((d) => ({
      ...d,
      comments: Math.round(d.comments * base.commentMultiplier),
      engagementScore: Math.round(d.engagementScore * base.commentMultiplier),
    }));
    return { likes, followers, engagement, summary: { ...base.summary } };
  }

  // 2. Realistic dynamic isolated data for newly registered or custom users
  const rawFollowers = user?.followerCount ?? 0;
  const rawLikes = 0;
  const rawUnlikes = 0;
  const rawComments = 0;

  const likes = generateDynamicLikesSeries(rawLikes, rawUnlikes);
  const followers = generateDynamicFollowersSeries(rawFollowers);
  const engagement = generateDynamicEngagementSeries(rawComments);

  const summary: CreatorSummaryMetrics = {
    totalFollowers: rawFollowers,
    totalLikes: rawLikes,
    totalUnlikes: rawUnlikes,
    totalComments: rawComments,
    engagementRate: calcEngagementRate(rawComments, rawFollowers),
  };

  return { likes, followers, engagement, summary };
}
