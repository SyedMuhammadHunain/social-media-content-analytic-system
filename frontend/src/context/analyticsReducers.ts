// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics In-Memory Reducers

import type { LikeUnlikePoint, FollowerTrendPoint, EngagementPoint, CreatorSummaryMetrics } from '../types/analytics.ts';
import { calcEngagementRate } from './analyticsAggregation.ts';

export function updateLikesPoint(points: LikeUnlikePoint[], isLiked: boolean): LikeUnlikePoint[] {
  const copy = [...points];
  const lastIndex = copy.length - 1;
  const today = copy[lastIndex];
  if (today) {
    copy[lastIndex] = {
      ...today,
      likes: isLiked ? today.likes + 1 : Math.max(0, today.likes - 1),
      unlikes: !isLiked ? today.unlikes + 1 : Math.max(0, today.unlikes - 1),
    };
  }
  return copy;
}

export function updateFollowersPoint(points: FollowerTrendPoint[], delta: number): FollowerTrendPoint[] {
  const copy = [...points];
  const lastIndex = copy.length - 1;
  const today = copy[lastIndex];
  if (today) {
    copy[lastIndex] = {
      ...today,
      followers: Math.max(0, today.followers + delta),
      netChange: today.netChange + delta,
    };
  }
  return copy;
}

export function updateEngagementPoint(points: EngagementPoint[]): EngagementPoint[] {
  const copy = [...points];
  const lastIndex = copy.length - 1;
  const today = copy[lastIndex];
  if (today) {
    const nextComments = today.comments + 1;
    copy[lastIndex] = {
      ...today,
      comments: nextComments,
      engagementScore: nextComments * 5,
    };
  }
  return copy;
}

export function updateSummaryOnLike(prev: CreatorSummaryMetrics, isLiked: boolean): CreatorSummaryMetrics {
  const totalLikes = isLiked ? prev.totalLikes + 1 : Math.max(0, prev.totalLikes - 1);
  const totalUnlikes = !isLiked ? prev.totalUnlikes + 1 : Math.max(0, prev.totalUnlikes - 1);
  return {
    ...prev,
    totalLikes,
    totalUnlikes,
    engagementRate: calcEngagementRate(prev.totalComments, prev.totalFollowers),
  };
}

export function updateSummaryOnFollow(prev: CreatorSummaryMetrics, delta: number): CreatorSummaryMetrics {
  const totalFollowers = Math.max(0, prev.totalFollowers + delta);
  return {
    ...prev,
    totalFollowers,
    engagementRate: calcEngagementRate(prev.totalComments, totalFollowers),
  };
}

export function updateSummaryOnComment(prev: CreatorSummaryMetrics): CreatorSummaryMetrics {
  const nextComments = prev.totalComments + 1;
  return {
    ...prev,
    totalComments: nextComments,
    engagementRate: calcEngagementRate(nextComments, prev.totalFollowers),
  };
}
