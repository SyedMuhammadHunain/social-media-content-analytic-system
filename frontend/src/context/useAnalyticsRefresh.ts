// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Refresh Hook

import { useCallback, type Dispatch, type SetStateAction, type MutableRefObject } from 'react';
import type { LikeUnlikePoint, FollowerTrendPoint, EngagementPoint, CreatorSummaryMetrics } from '../types/analytics.ts';
import type { UserProfile } from '../types/social.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { socialApi } from '../api/socialApi.ts';
import { feedApi } from '../api/feedApi.ts';
import {
  generateDynamicLikesSeries,
  generateDynamicFollowersSeries,
  generateDynamicEngagementSeries,
  aggregateFeedPosts,
  computeNextSummary,
} from './analyticsAggregation.ts';
import { KNOWN_BASELINES, type UserAnalyticsState } from './analyticsSeedStore.ts';

interface UseAnalyticsRefreshParams {
  activeUserId: string;
  currentUser?: UserProfile | null;
  userMetricsStore: MutableRefObject<Map<string, UserAnalyticsState>>;
  setLikeUnlikeData: Dispatch<SetStateAction<LikeUnlikePoint[]>>;
  setFollowersData: Dispatch<SetStateAction<FollowerTrendPoint[]>>;
  setEngagementData: Dispatch<SetStateAction<EngagementPoint[]>>;
  setSummary: Dispatch<SetStateAction<CreatorSummaryMetrics>>;
}

export function useAnalyticsRefresh(params: UseAnalyticsRefreshParams) {
  const {
    activeUserId,
    currentUser,
    userMetricsStore,
    setLikeUnlikeData,
    setFollowersData,
    setEngagementData,
    setSummary,
  } = params;

  const refreshMetrics = useCallback(async (targetUserId?: string) => {
    const effectiveUserId = normalizeBackendUserId(targetUserId || activeUserId);
    try {
      const followerIds = await socialApi.getFollowers(effectiveUserId);
      const feed = await feedApi.getFeedForUser(effectiveUserId, 0, 50);
      const feedCounts = aggregateFeedPosts(feed?.posts || [], effectiveUserId);

      setSummary((prev) => {
        const isSeed = Boolean(KNOWN_BASELINES[effectiveUserId]);
        const fallbackFollowers = currentUser?.followerCount ?? prev.totalFollowers;
        const nextSummary = computeNextSummary({
          prev,
          isSeedCreator: isSeed,
          followerIds,
          fallbackFollowers,
          feedCounts,
        });

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
  }, [activeUserId, currentUser, userMetricsStore, setLikeUnlikeData, setFollowersData, setEngagementData, setSummary]);

  return { refreshMetrics };
}
