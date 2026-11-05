// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Aggregation & Math

import type { LikeUnlikePoint, FollowerTrendPoint, EngagementPoint } from '../types/analytics.ts';

export const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

export function calcEngagementRate(comments: number, followers: number): string {
  if (followers <= 0) return '0.0%';
  return `${((comments / Math.max(1, followers)) * 100).toFixed(1)}%`;
}

export function generateDynamicLikesSeries(totalLikes: number, totalUnlikes: number): LikeUnlikePoint[] {
  if (totalLikes <= 0 && totalUnlikes <= 0) {
    return CHART_DAYS.map((date) => ({ date, likes: 0, unlikes: 0 }));
  }

  if (totalLikes <= 7 && totalUnlikes <= 7) {
    return CHART_DAYS.map((date, idx) => {
      const isToday = idx === CHART_DAYS.length - 1;
      return {
        date,
        likes: isToday ? totalLikes : 0,
        unlikes: isToday ? totalUnlikes : 0,
      };
    });
  }

  const weights = [0.08, 0.11, 0.10, 0.14, 0.17, 0.18, 0.22];
  let accLikes = 0;
  let accUnlikes = 0;

  return CHART_DAYS.map((date, idx) => {
    if (idx === CHART_DAYS.length - 1) {
      return {
        date,
        likes: Math.max(0, totalLikes - accLikes),
        unlikes: Math.max(0, totalUnlikes - accUnlikes),
      };
    }
    const dayLikes = Math.round(totalLikes * weights[idx]);
    const dayUnlikes = Math.round(totalUnlikes * weights[idx]);
    accLikes += dayLikes;
    accUnlikes += dayUnlikes;
    return { date, likes: dayLikes, unlikes: dayUnlikes };
  });
}

export function generateDynamicFollowersSeries(totalFollowers: number): FollowerTrendPoint[] {
  if (totalFollowers <= 0) {
    return CHART_DAYS.map((date) => ({ date, followers: 0, netChange: 0 }));
  }

  if (totalFollowers <= 7) {
    return CHART_DAYS.map((date, idx) => {
      const isToday = idx === CHART_DAYS.length - 1;
      return {
        date,
        followers: totalFollowers,
        netChange: isToday ? Math.min(totalFollowers, 1) : 0,
      };
    });
  }

  const growthFactors = [0.965, 0.972, 0.978, 0.985, 0.991, 0.996, 1.0];
  let prevVal = Math.round(totalFollowers * growthFactors[0]);

  return CHART_DAYS.map((date, idx) => {
    const curVal = idx === CHART_DAYS.length - 1 ? totalFollowers : Math.round(totalFollowers * growthFactors[idx]);
    const netChange = Math.max(0, curVal - prevVal);
    prevVal = curVal;
    return { date, followers: curVal, netChange: idx === 0 ? Math.min(curVal, 2) : netChange };
  });
}

export function generateDynamicEngagementSeries(totalComments: number): EngagementPoint[] {
  if (totalComments <= 0) {
    return CHART_DAYS.map((date) => ({ date, comments: 0, engagementScore: 0 }));
  }

  if (totalComments <= 7) {
    return CHART_DAYS.map((date, idx) => {
      const isToday = idx === CHART_DAYS.length - 1;
      const count = isToday ? totalComments : 0;
      return {
        date,
        comments: count,
        engagementScore: count * 5,
      };
    });
  }

  const weights = [0.08, 0.11, 0.10, 0.14, 0.16, 0.18, 0.23];
  let acc = 0;

  return CHART_DAYS.map((date, idx) => {
    if (idx === CHART_DAYS.length - 1) {
      const rem = Math.max(0, totalComments - acc);
      return { date, comments: rem, engagementScore: rem * 5 };
    }
    const day = Math.round(totalComments * weights[idx]);
    acc += day;
    return { date, comments: day, engagementScore: day * 5 };
  });
}
