// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Provider (PDF Section 4.1.vii-ix & 4.2)

'use client';

import { useState, useCallback, useContext, useEffect, useRef } from 'react';
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
import type { UserProfile } from '../types/social.ts';
import {
  INITIAL_LIKE_UNLIKE_DATA,
  INITIAL_FOLLOWERS_DATA,
  INITIAL_ENGAGEMENT_DATA,
} from '../mock/analyticsSeedData.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { socialApi } from '../api/socialApi.ts';
import { feedApi } from '../api/feedApi.ts';

function calcEngagementRate(comments: number, followers: number): string {
  if (followers <= 0) {
    return comments > 0 ? '100.0%' : '0.0%';
  }
  return `${((comments / Math.max(1, followers)) * 100).toFixed(1)}%`;
}

interface UserBaseline {
  summary: CreatorSummaryMetrics;
  likeMultiplier: number;
  followerMultiplier: number;
  commentMultiplier: number;
}

const KNOWN_BASELINES: Record<string, UserBaseline> = {
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

interface UserAnalyticsState {
  likes: LikeUnlikePoint[];
  followers: FollowerTrendPoint[];
  engagement: EngagementPoint[];
  summary: CreatorSummaryMetrics;
}

function buildUserSeries(user: UserProfile | null | undefined, fallbackId: string): UserAnalyticsState {
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

  // 2. Realistic isolated data for newly registered or custom users
  const rawFollowers = user?.followerCount ?? 0;
  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  if (rawFollowers <= 0) {
    const likes = dates.map((date) => ({ date, likes: 0, unlikes: 0 }));
    const followers = dates.map((date) => ({ date, followers: 0, netChange: 0 }));
    const engagement = dates.map((date) => ({ date, comments: 0, engagementScore: 0 }));
    const summary: CreatorSummaryMetrics = {
      totalFollowers: 0,
      totalLikes: 0,
      totalUnlikes: 0,
      totalComments: 0,
      engagementRate: '0.0%',
    };
    return { likes, followers, engagement, summary };
  }

  // Scaled for custom user with followers
  const ratio = rawFollowers / 14200;
  const likes = INITIAL_LIKE_UNLIKE_DATA.map((d) => ({
    ...d,
    likes: Math.max(0, Math.round(d.likes * ratio)),
    unlikes: Math.max(0, Math.round(d.unlikes * ratio)),
  }));
  const followers = INITIAL_FOLLOWERS_DATA.map((d) => ({
    ...d,
    followers: Math.max(0, Math.round(d.followers * ratio)),
    netChange: Math.round(d.netChange * ratio),
  }));
  const engagement = INITIAL_ENGAGEMENT_DATA.map((d) => ({
    ...d,
    comments: Math.max(0, Math.round(d.comments * ratio)),
    engagementScore: Math.max(0, Math.round(d.engagementScore * ratio)),
  }));
  const totalLikes = likes.reduce((acc, curr) => acc + curr.likes, 0);
  const totalUnlikes = likes.reduce((acc, curr) => acc + curr.unlikes, 0);
  const totalComments = engagement.reduce((acc, curr) => acc + curr.comments, 0);

  const summary: CreatorSummaryMetrics = {
    totalFollowers: rawFollowers,
    totalLikes,
    totalUnlikes,
    totalComments,
    engagementRate: calcEngagementRate(totalComments, rawFollowers),
  };

  return { likes, followers, engagement, summary };
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser;
  const activeUserId = currentUser?.id || 'user_hunain';
  const initialSeries = buildUserSeries(currentUser, activeUserId);

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [likeUnlikeData, setLikeUnlikeData] = useState<LikeUnlikePoint[]>(initialSeries.likes);
  const [followersData, setFollowersData] = useState<FollowerTrendPoint[]>(initialSeries.followers);
  const [engagementData, setEngagementData] = useState<EngagementPoint[]>(initialSeries.engagement);
  const [summary, setSummary] = useState<CreatorSummaryMetrics>(initialSeries.summary);

  // Per-user state storage ensuring realistic metrics strictly for respective users
  const userMetricsStore = useRef<Map<string, UserAnalyticsState>>(new Map());

  // Initialize active user in store
  useEffect(() => {
    const norm = normalizeBackendUserId(activeUserId);
    if (!userMetricsStore.current.has(norm)) {
      userMetricsStore.current.set(norm, initialSeries);
    }
  }, []);

  const syncUserMetrics = useCallback((targetUserOrId: UserProfile | string) => {
    const userObj = typeof targetUserOrId === 'object' ? targetUserOrId : undefined;
    const targetId = typeof targetUserOrId === 'string' ? targetUserOrId : targetUserOrId.id;
    const normalized = normalizeBackendUserId(targetId);

    if (userMetricsStore.current.has(normalized)) {
      const cached = userMetricsStore.current.get(normalized)!;
      setLikeUnlikeData(cached.likes);
      setFollowersData(cached.followers);
      setEngagementData(cached.engagement);
      setSummary(cached.summary);
    } else {
      const fresh = buildUserSeries(userObj, targetId);
      userMetricsStore.current.set(normalized, fresh);
      setLikeUnlikeData(fresh.likes);
      setFollowersData(fresh.followers);
      setEngagementData(fresh.engagement);
      setSummary(fresh.summary);
    }
  }, []);


  const recordLikeToggle = useCallback((isLiked: boolean) => {
    const norm = normalizeBackendUserId(activeUserId);

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
      const updated = {
        ...prev,
        totalLikes,
        totalUnlikes,
        engagementRate: calcEngagementRate(prev.totalComments, prev.totalFollowers),
      };

      const cached = userMetricsStore.current.get(norm);
      if (cached) {
        userMetricsStore.current.set(norm, { ...cached, summary: updated });
      }
      return updated;
    });
  }, [activeUserId]);

  const recordFollowToggle = useCallback((isFollowed: boolean) => {
    const norm = normalizeBackendUserId(activeUserId);
    const delta = isFollowed ? 1 : -1;

    setFollowersData((prev) => {
      const copy = [...prev];
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
    });

    setSummary((prev) => {
      const totalFollowers = Math.max(0, prev.totalFollowers + delta);
      const updated = {
        ...prev,
        totalFollowers,
        engagementRate: calcEngagementRate(prev.totalComments, totalFollowers),
      };

      const cached = userMetricsStore.current.get(norm);
      if (cached) {
        userMetricsStore.current.set(norm, { ...cached, summary: updated });
      }
      return updated;
    });
  }, [activeUserId]);

  const recordComment = useCallback(() => {
    const norm = normalizeBackendUserId(activeUserId);

    setEngagementData((prev) => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const today = copy[lastIndex];
      if (today) {
        const nextComments = today.comments + 1;
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
      const updated = {
        ...prev,
        totalComments: nextComments,
        engagementRate: calcEngagementRate(nextComments, prev.totalFollowers),
      };

      const cached = userMetricsStore.current.get(norm);
      if (cached) {
        userMetricsStore.current.set(norm, { ...cached, summary: updated });
      }
      return updated;
    });
  }, [activeUserId]);

  const refreshMetrics = useCallback(async (targetUserId?: string) => {
    const effectiveUserId = normalizeBackendUserId(targetUserId || activeUserId);

    try {
      const followerIds = await socialApi.getFollowers(effectiveUserId);
      const feed = await feedApi.getFeedForUser(effectiveUserId, 0, 50);

      let authoredLikes = 0;
      let authoredComments = 0;
      let authoredPostsCount = 0;

      if (feed && feed.posts) {
        for (const p of feed.posts) {
          if (p.authorId === effectiveUserId || p.authorId === activeUserId) {
            authoredLikes += p.likeCount || 0;
            authoredComments += p.commentCount || 0;
            authoredPostsCount++;
          }
        }
      }

      setSummary((prev) => {
        const isSeedCreator = !!KNOWN_BASELINES[effectiveUserId];

        let totalFollowers = prev.totalFollowers;
        if (!isSeedCreator) {
          totalFollowers = followerIds ? followerIds.length : (currentUser?.followerCount ?? prev.totalFollowers);
        } else if (followerIds && followerIds.length > 0) {
          totalFollowers = Math.max(prev.totalFollowers, followerIds.length);
        }

        let totalLikes = prev.totalLikes;
        let totalComments = prev.totalComments;
        if (!isSeedCreator) {
          totalLikes = authoredPostsCount > 0 ? authoredLikes : prev.totalLikes;
          totalComments = authoredPostsCount > 0 ? authoredComments : prev.totalComments;
        } else if (authoredPostsCount > 0) {
          totalLikes = Math.max(prev.totalLikes, authoredLikes);
          totalComments = Math.max(prev.totalComments, authoredComments);
        }

        const nextSummary = {
          ...prev,
          totalFollowers,
          totalLikes,
          totalComments,
          engagementRate: calcEngagementRate(totalComments, totalFollowers),
        };

        const cached = userMetricsStore.current.get(effectiveUserId);
        if (cached) {
          userMetricsStore.current.set(effectiveUserId, {
            ...cached,
            summary: nextSummary,
          });
        }

        return nextSummary;
      });
    } catch {
      // Gateway offline -> retain local/seed telemetry
    }
  }, [activeUserId, currentUser]);

  // Synchronize dashboard whenever logged-in user changes (PDF Req 4.1 & 4.2)
  useEffect(() => {
    if (currentUser) {
      syncUserMetrics(currentUser);
      refreshMetrics(currentUser.id);
    }
  }, [currentUser?.id, currentUser?.followerCount, syncUserMetrics, refreshMetrics]);

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

