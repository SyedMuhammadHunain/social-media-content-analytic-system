// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Data Aggregation Helpers

import type {
  LikeUnlikePoint,
  FollowerTrendPoint,
  EngagementPoint,
} from '../types/analytics.ts';

export function calcEngagementRate(comments: number, followers: number): string {
  if (followers <= 0) return '0.0%';
  const rate = (comments / followers) * 100;
  return `${rate.toFixed(1)}%`;
}

export function generateDynamicLikesSeries(baseLikes: number, baseUnlikes: number): LikeUnlikePoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const factor = 0.7 + i * 0.05;
    return {
      date: day,
      likes: Math.round(baseLikes * factor),
      unlikes: Math.round(baseUnlikes * (0.8 + (i % 3) * 0.1)),
    };
  });
}

export function generateDynamicFollowersSeries(currentFollowers: number): FollowerTrendPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = Math.max(10, currentFollowers - 30);
  return days.map((day, i) => {
    const netChange = (i + 1) * 4;
    return {
      date: day,
      followers: base + (i + 1) * 5,
      netChange,
    };
  });
}

export function generateDynamicEngagementSeries(baseComments: number): EngagementPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const comments = Math.max(1, Math.round(baseComments * (0.6 + i * 0.08)));
    return {
      date: day,
      comments,
      engagementScore: Math.round(comments * 12.5),
    };
  });
}

function matchPostUser(post: any, normUserId: string): boolean {
  const postUserId = post.author?.id || post.userId || '';
  const normPostUser = postUserId.toLowerCase().replace(/^(user_|usr_)/, '').trim();
  return normPostUser === normUserId;
}

export function aggregateFeedPosts(posts: any[], normUserId: string) {
  let authoredLikes = 0;
  let authoredComments = 0;
  let count = 0;

  for (const p of posts) {
    if (matchPostUser(p, normUserId)) {
      authoredLikes += p.likeCount || p.likesCount || 0;
      authoredComments += p.commentCount || 0;
      count++;
    }
  }

  return { authoredLikes, authoredComments, count };
}

export interface ComputeSummaryParams {
  prev: { totalFollowers: number; totalLikes: number; totalUnlikes: number; totalComments: number };
  isSeedCreator: boolean;
  followerIds: string[] | null;
  fallbackFollowers: number;
  feedCounts: { authoredLikes: number; authoredComments: number; count: number };
}

interface FollowersResolutionParams {
  isSeed: boolean;
  prevFollowers: number;
  followerIds: string[] | null;
  fallback: number;
}

function resolveFollowersCount(params: FollowersResolutionParams): number {
  const { isSeed, prevFollowers, followerIds, fallback } = params;
  if (!isSeed) {
    return followerIds ? followerIds.length : fallback;
  }
  if (followerIds && followerIds.length > 0) {
    return Math.max(prevFollowers, followerIds.length);
  }
  return prevFollowers;
}

interface MetricResolutionParams {
  isSeed: boolean;
  prevMetric: number;
  authoredMetric: number;
  feedCount: number;
}

function resolveMetricCount(params: MetricResolutionParams): number {
  const { isSeed, prevMetric, authoredMetric, feedCount } = params;
  if (!isSeed) {
    return feedCount > 0 ? authoredMetric : prevMetric;
  }
  return feedCount > 0 ? Math.max(prevMetric, authoredMetric) : prevMetric;
}

export function computeNextSummary(params: ComputeSummaryParams) {
  const { prev, isSeedCreator, followerIds, fallbackFollowers, feedCounts } = params;

  const totalFollowers = resolveFollowersCount({
    isSeed: isSeedCreator,
    prevFollowers: prev.totalFollowers,
    followerIds,
    fallback: fallbackFollowers,
  });

  const totalLikes = resolveMetricCount({
    isSeed: isSeedCreator,
    prevMetric: prev.totalLikes,
    authoredMetric: feedCounts.authoredLikes,
    feedCount: feedCounts.count,
  });

  const totalComments = resolveMetricCount({
    isSeed: isSeedCreator,
    prevMetric: prev.totalComments,
    authoredMetric: feedCounts.authoredComments,
    feedCount: feedCounts.count,
  });

  return {
    ...prev,
    totalFollowers,
    totalLikes,
    totalComments,
    engagementRate: calcEngagementRate(totalComments, totalFollowers),
  };
}
