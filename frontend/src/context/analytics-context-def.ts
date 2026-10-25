// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Context Definition

import { createContext } from 'react';
import type { AnalyticsContextType } from '../types/analytics';

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);
