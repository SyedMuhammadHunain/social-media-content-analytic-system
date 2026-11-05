// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Creator Analytics Context Provider

'use client';

import { useContext } from 'react';
import type { ReactNode } from 'react';
import { AnalyticsContext } from './analytics-context-def.ts';
import { AuthContext } from './auth-context-def.ts';
import { useAnalyticsState } from './useAnalyticsState.ts';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const analytics = useAnalyticsState(auth?.currentUser);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export default AnalyticsProvider;
