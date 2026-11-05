// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Mutation Hook

import { useCallback, type Dispatch, type SetStateAction, type MutableRefObject } from 'react';
import type { LikeUnlikePoint, FollowerTrendPoint, EngagementPoint, CreatorSummaryMetrics } from '../types/analytics.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import type { UserAnalyticsState } from './analyticsSeedStore.ts';
import {
  updateLikesPoint,
  updateFollowersPoint,
  updateEngagementPoint,
  updateSummaryOnLike,
  updateSummaryOnFollow,
  updateSummaryOnComment,
} from './analyticsReducers.ts';

interface UseAnalyticsMutationsParams {
  activeUserId: string;
  userMetricsStore: MutableRefObject<Map<string, UserAnalyticsState>>;
  setLikeUnlikeData: Dispatch<SetStateAction<LikeUnlikePoint[]>>;
  setFollowersData: Dispatch<SetStateAction<FollowerTrendPoint[]>>;
  setEngagementData: Dispatch<SetStateAction<EngagementPoint[]>>;
  setSummary: Dispatch<SetStateAction<CreatorSummaryMetrics>>;
}

export function useAnalyticsMutations(params: UseAnalyticsMutationsParams) {
  const {
    activeUserId,
    userMetricsStore,
    setLikeUnlikeData,
    setFollowersData,
    setEngagementData,
    setSummary,
  } = params;

  const recordLikeToggle = useCallback((isLiked: boolean) => {
    const norm = normalizeBackendUserId(activeUserId);
    setLikeUnlikeData((prev) => updateLikesPoint(prev, isLiked));

    setSummary((prev) => {
      const updated = updateSummaryOnLike(prev, isLiked);
      const cached = userMetricsStore.current.get(norm);
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
      return updated;
    });
  }, [activeUserId, setLikeUnlikeData, setSummary, userMetricsStore]);

  const recordFollowToggle = useCallback((isFollowed: boolean) => {
    const norm = normalizeBackendUserId(activeUserId);
    const delta = isFollowed ? 1 : -1;

    setFollowersData((prev) => updateFollowersPoint(prev, delta));

    setSummary((prev) => {
      const updated = updateSummaryOnFollow(prev, delta);
      const cached = userMetricsStore.current.get(norm);
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
      return updated;
    });
  }, [activeUserId, setFollowersData, setSummary, userMetricsStore]);

  const recordComment = useCallback(() => {
    const norm = normalizeBackendUserId(activeUserId);
    setEngagementData((prev) => updateEngagementPoint(prev));

    setSummary((prev) => {
      const updated = updateSummaryOnComment(prev);
      const cached = userMetricsStore.current.get(norm);
      if (cached) userMetricsStore.current.set(norm, { ...cached, summary: updated });
      return updated;
    });
  }, [activeUserId, setEngagementData, setSummary, userMetricsStore]);

  return { recordLikeToggle, recordFollowToggle, recordComment };
}
