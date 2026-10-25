// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - useAnalytics Hook

'use client';

import { useContext } from 'react';
import { AnalyticsContext } from './analytics-context-def';
import type { AnalyticsContextType } from '../types/analytics';

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export default useAnalytics;
