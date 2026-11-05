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
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { socialApi } from '../api/socialApi.ts';
import { feedApi } from '../api/feedApi.ts';
import {
  calcEngagementRate,
  generateDynamicLikesSeries,
  generateDynamicFollowersSeries,
  generateDynamicEngagementSeries,
  aggregateFeedPosts,
  computeNextSummary,
} from './analyticsAggregation.ts';
import {
  KNOWN_BASELINES,
  buildUserSeries,
  type UserAnalyticsState,
} from './analyticsSeedStore.ts';

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

  const userMetricsStore = useRef<Map<string, UserAnalyticsState>>(new Map());

  useEffect(() => {
    const norm = normalizeBackendUserId(activeUserId);
    if (!userMetricsStore.current.has(norm)) {
      userMetricsStore.current.set(norm, initialSeries);
    }
  }, [activeUserId, initialSeries]);

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
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
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
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
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
        copy[lastIndex] = {
          ...today,
          comments: nextComments,
          engagementScore: nextComments * 5,
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
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
      return updated;
    });
  }, [activeUserId]);

  const refreshMetrics = useCallback(async (targetUserId?: string) => {
    const effectiveUserId = normalizeBackendUserId(targetUserId || activeUserId);
    try {
      const followerIds = await socialApi.getFollowers(effectiveUserId);
      const feed = await feedApi.getFeedForUser(effectiveUserId, 0, 50);
      const feedCounts = aggregateFeedPosts(feed?.posts, effectiveUserId, activeUserId);

      setSummary((prev) => {
        const isSeed = Boolean(KNOWN_BASELINES[effectiveUserId]);
        const fallbackFollowers = currentUser?.followerCount ?? prev.totalFollowers;
        const nextSummary = computeNextSummary(prev, isSeed, followerIds, fallbackFollowers, feedCounts);

        if (!isSeed) {
          const freshLikes = generateDynamicLikesSeries(nextSummary.totalLikes, prev.totalUnlikes);
          const freshFollowers = generateDynamicFollowersSeries(nextSummary.totalFollowers);
          const freshEngagement = generateDynamicEngagementSeries(nextSummary.totalComments);

          setLikeUnlikeData(freshLikes);
          setFollowersData(freshFollowers);
          setEngagementData(freshEngagement);

          userMetricsStore.current.set(effectiveUserId, {
            likes: freshLikes,
            followers: freshFollowers,
            engagement: freshEngagement,
            summary: nextSummary,
          });
        } else {
          const cached = userMetricsStore.current.get(effectiveUserId);
          if (cached) userMetricsStore.current.set(effectiveUserId, { ...cached, summary: nextSummary });
        }

        return nextSummary;
      });
    } catch {
      // Gateway offline -> retain local/seed telemetry
    }
  }, [activeUserId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      syncUserMetrics(currentUser);
      refreshMetrics(currentUser.id);
    }
  }, [currentUser, syncUserMetrics, refreshMetrics]);

  return (
    <AnalyticsContext.Provider
      value={{
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
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export default AnalyticsProvider;
