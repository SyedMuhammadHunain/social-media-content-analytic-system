// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Provider (PDF Section 4.1.vii-ix & 4.2)

'use client';

import { useState, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { AnalyticsContext } from './analytics-context-def.ts';
import { AuthContext } from './auth-context-def.ts';
import type {
  TimeRange,
  LikeUnlikePoint,
  FollowerTrendPoint,
  EngagementPoint,
  CreatorSummaryMetrics,
} from '../types/analytics.ts';
import {
  INITIAL_LIKE_UNLIKE_DATA,
  INITIAL_FOLLOWERS_DATA,
  INITIAL_ENGAGEMENT_DATA,
} from '../mock/analyticsSeedData.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { socialApi } from '../api/socialApi.ts';
import { feedApi } from '../api/feedApi.ts';

function calcEngagementRate(comments: number, followers: number): string {
  return `${((comments / Math.max(1, followers)) * 100).toFixed(1)}%`;
}

interface UserBaseline {
  summary: CreatorSummaryMetrics;
  likeMultiplier: number;
  followerMultiplier: number;
  commentMultiplier: number;
}

const USER_BASELINES: Record<string, UserBaseline> = {
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

function getScaledSeries(userId: string) {
  const normalizedId = normalizeBackendUserId(userId);
  const baseline = USER_BASELINES[normalizedId] || USER_BASELINES['user_hunain'];
  const likes = INITIAL_LIKE_UNLIKE_DATA.map((d) => ({
    ...d,
    likes: Math.round(d.likes * baseline.likeMultiplier),
    unlikes: Math.round(d.unlikes * baseline.likeMultiplier),
  }));
  const followers = INITIAL_FOLLOWERS_DATA.map((d) => ({
    ...d,
    followers: Math.round(d.followers * baseline.followerMultiplier),
    netChange: Math.round(d.netChange * baseline.followerMultiplier),
  }));
  const engagement = INITIAL_ENGAGEMENT_DATA.map((d) => ({
    ...d,
    comments: Math.round(d.comments * baseline.commentMultiplier),
    engagementScore: Math.round(d.engagementScore * baseline.commentMultiplier),
  }));
  return { likes, followers, engagement, summary: { ...baseline.summary } };
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const activeUserId = auth?.currentUser?.id || 'user_hunain';
  const initialSeries = getScaledSeries(activeUserId);

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [likeUnlikeData, setLikeUnlikeData] = useState<LikeUnlikePoint[]>(initialSeries.likes);
  const [followersData, setFollowersData] = useState<FollowerTrendPoint[]>(initialSeries.followers);
  const [engagementData, setEngagementData] = useState<EngagementPoint[]>(initialSeries.engagement);
  const [summary, setSummary] = useState<CreatorSummaryMetrics>(initialSeries.summary);

  const syncUserMetrics = useCallback((targetUserId: string) => {
    const scaled = getScaledSeries(targetUserId);
    setLikeUnlikeData(scaled.likes);
    setFollowersData(scaled.followers);
    setEngagementData(scaled.engagement);
    setSummary(scaled.summary);
  }, []);

  const recordLikeToggle = useCallback((isLiked: boolean) => {
    setLikeUnlikeData((prev) => {
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

    setSummary((prev) => {
      const totalLikes = isLiked ? prev.totalLikes + 1 : Math.max(0, prev.totalLikes - 1);
      const totalUnlikes = !isLiked ? prev.totalUnlikes + 1 : Math.max(0, prev.totalUnlikes - 1);
      return {
        ...prev,
        totalLikes,
        totalUnlikes,
        engagementRate: calcEngagementRate(prev.totalComments, prev.totalFollowers),
      };
    });
  }, []);

  const recordFollowToggle = useCallback((isFollowed: boolean) => {
    const delta = isFollowed ? 1 : -1;
    setFollowersData((prev) => {
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

    setSummary((prev) => {
      const totalFollowers = Math.max(0, prev.totalFollowers + delta);
      return {
        ...prev,
        totalFollowers,
        engagementRate: calcEngagementRate(prev.totalComments, totalFollowers),
      };
    });
  }, []);

  const recordComment = useCallback(() => {
    setEngagementData((prev) => {
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

    setSummary((prev) => {
      const nextComments = prev.totalComments + 1;
      return {
        ...prev,
        totalComments: nextComments,
        engagementRate: calcEngagementRate(nextComments, prev.totalFollowers),
      };
    });
  }, []);

  const refreshMetrics = useCallback(async () => {
    const effectiveUserId = normalizeBackendUserId(activeUserId);

    try {
      const followerIds = await socialApi.getFollowers(effectiveUserId);
      const feed = await feedApi.getFeedForUser(effectiveUserId, 0, 50);

      let feedLikes = 0;
      let feedComments = 0;
      if (feed && feed.posts) {
        for (const p of feed.posts) {
          feedLikes += p.likeCount || 0;
          feedComments += p.commentCount || 0;
        }
      }

      setSummary((prev) => {
        const totalFollowers =
          followerIds && followerIds.length > 0 ? followerIds.length : prev.totalFollowers;
        const totalLikes = feedLikes > 0 ? prev.totalLikes + feedLikes : prev.totalLikes;
        const totalComments = feedComments > 0 ? prev.totalComments + feedComments : prev.totalComments;
        return {
          ...prev,
          totalFollowers,
          totalLikes,
          totalComments,
          engagementRate: calcEngagementRate(totalComments, totalFollowers),
        };
      });
    } catch {
      // Gateway offline -> retain local/seed telemetry
    }
  }, [activeUserId]);

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
    refreshMetrics,
    syncUserMetrics,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export default AnalyticsProvider;
