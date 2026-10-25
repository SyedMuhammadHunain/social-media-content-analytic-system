// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Provider (PDF Section 4.1.vii-ix & 4.2)

'use client';

import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AnalyticsContext } from './analytics-context-def';
import type { TimeRange, LikeUnlikePoint, FollowerTrendPoint, EngagementPoint, CreatorSummaryMetrics } from '../types/analytics';
import {
  INITIAL_LIKE_UNLIKE_DATA,
  INITIAL_FOLLOWERS_DATA,
  INITIAL_ENGAGEMENT_DATA,
  INITIAL_SUMMARY_METRICS,
} from '../mock/analyticsSeedData';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [likeUnlikeData, setLikeUnlikeData] = useState<LikeUnlikePoint[]>(INITIAL_LIKE_UNLIKE_DATA);
  const [followersData, setFollowersData] = useState<FollowerTrendPoint[]>(INITIAL_FOLLOWERS_DATA);
  const [engagementData, setEngagementData] = useState<EngagementPoint[]>(INITIAL_ENGAGEMENT_DATA);
  const [summary, setSummary] = useState<CreatorSummaryMetrics>(INITIAL_SUMMARY_METRICS);

  const recordLikeToggle = useCallback((isLiked: boolean) => {
    setLikeUnlikeData(prev => {
      const copy = [...prev];
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
    });

    setSummary(prev => ({
      ...prev,
      totalLikes: isLiked ? prev.totalLikes + 1 : Math.max(0, prev.totalLikes - 1),
      totalUnlikes: !isLiked ? prev.totalUnlikes + 1 : Math.max(0, prev.totalUnlikes - 1),
    }));
  }, []);

  const recordFollowToggle = useCallback((isFollowed: boolean) => {
    const delta = isFollowed ? 1 : -1;
    setFollowersData(prev => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const today = copy[lastIndex];
      if (today) {
        copy[lastIndex] = {
          ...today,
          followers: today.followers + delta,
          netChange: today.netChange + delta,
        };
      }
      return copy;
    });

    setSummary(prev => ({
      ...prev,
      totalFollowers: prev.totalFollowers + delta,
    }));
  }, []);

  const recordComment = useCallback(() => {
    setEngagementData(prev => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const today = copy[lastIndex];
      if (today) {
        const nextComments = today.comments + 1;
        // Comments directly proportional to engagements (PDF Req 4.1.ix)
        const nextScore = nextComments * 5;
        copy[lastIndex] = {
          ...today,
          comments: nextComments,
          engagementScore: nextScore,
        };
      }
      return copy;
    });

    setSummary(prev => {
      const nextComments = prev.totalComments + 1;
      const rate = ((nextComments / Math.max(1, prev.totalFollowers)) * 100).toFixed(1);
      return {
        ...prev,
        totalComments: nextComments,
        engagementRate: `${rate}%`,
      };
    });
  }, []);

  const value = {
    likeUnlikeData,
    followersData,
    engagementData,
    summary,
    timeRange,
    setTimeRange,
    recordLikeToggle,
    recordFollowToggle,
    recordComment,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export default AnalyticsProvider;
