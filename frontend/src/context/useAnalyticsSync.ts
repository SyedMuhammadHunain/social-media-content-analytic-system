// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Sync Hook

import { useCallback, type MutableRefObject } from 'react';
import type { UserProfile } from '../types/social.ts';
import { normalizeBackendUserId } from '../mock/authSeedData.ts';
import { buildUserSeries, type UserAnalyticsState } from './analyticsSeedStore.ts';

export function useAnalyticsSync(
  userMetricsStore: MutableRefObject<Map<string, UserAnalyticsState>>,
  applySeries: (series: UserAnalyticsState) => void
) {
  const syncUserMetrics = useCallback((targetUserOrId: UserProfile | string) => {
    const userObj = typeof targetUserOrId === 'object' ? targetUserOrId : undefined;
    const targetId = typeof targetUserOrId === 'string' ? targetUserOrId : targetUserOrId.id;
    const normalized = normalizeBackendUserId(targetId);

    if (userMetricsStore.current.has(normalized)) {
      const cached = userMetricsStore.current.get(normalized)!;
      applySeries(cached);
    } else {
      const fresh = buildUserSeries(userObj, targetId);
      userMetricsStore.current.set(normalized, fresh);
      applySeries(fresh);
    }
  }, [userMetricsStore, applySeries]);

  return { syncUserMetrics };
}
