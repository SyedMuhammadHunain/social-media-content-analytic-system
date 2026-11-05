// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics State Hook

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  TimeRange,
  LikeUnlikePoint,
  FollowerTrendPoint,
  EngagementPoint,
  CreatorSummaryMetrics,
} from '../types/analytics.ts';
import type { UserProfile } from '../types/social.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { buildUserSeries, type UserAnalyticsState } from './analyticsSeedStore.ts';
import { useAnalyticsMutations } from './useAnalyticsMutations.ts';
import { useAnalyticsRefresh } from './useAnalyticsRefresh.ts';
import { useAnalyticsSync } from './useAnalyticsSync.ts';

export function useAnalyticsState(currentUser?: UserProfile | null) {
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

  const applySeriesState = useCallback((series: UserAnalyticsState) => {
    setLikeUnlikeData(series.likes);
    setFollowersData(series.followers);
    setEngagementData(series.engagement);
    setSummary(series.summary);
  }, []);

  const { syncUserMetrics } = useAnalyticsSync(userMetricsStore, applySeriesState);

  const mutations = useAnalyticsMutations({
    activeUserId,
    userMetricsStore,
    setLikeUnlikeData,
    setFollowersData,
    setEngagementData,
    setSummary,
  });

  const { refreshMetrics } = useAnalyticsRefresh({
    activeUserId,
    currentUser,
    userMetricsStore,
    setLikeUnlikeData,
    setFollowersData,
    setEngagementData,
    setSummary,
  });

  useEffect(() => {
    if (currentUser) {
      syncUserMetrics(currentUser);
      refreshMetrics(currentUser.id);
    }
  }, [currentUser, syncUserMetrics, refreshMetrics]);

  return {
    likeUnlikeData,
    followersData,
    engagementData,
    summary,
    timeRange,
    setTimeRange,
    recordLikeToggle: mutations.recordLikeToggle,
    recordFollowToggle: mutations.recordFollowToggle,
    recordComment: mutations.recordComment,
    refreshMetrics,
    syncUserMetrics,
  };
}
