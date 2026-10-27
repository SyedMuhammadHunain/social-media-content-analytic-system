// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Sentiment & Followers Growth Charts (PDF Section 4.1.vii, viii & 4.2)

'use client';

import { Grid } from '@astryxdesign/core/Grid';
import { DashboardSentimentBarChart } from './DashboardSentimentBarChart';
import { DashboardFollowerTrendChart } from './DashboardFollowerTrendChart';
import type { LikeUnlikePoint, FollowerTrendPoint, CreatorSummaryMetrics } from '../../types/analytics';

interface DashboardSentimentChartsProps {
  likeUnlikeData: LikeUnlikePoint[];
  followersData: FollowerTrendPoint[];
  summary: CreatorSummaryMetrics;
}

export function DashboardSentimentCharts({
  likeUnlikeData,
  followersData,
  summary,
}: DashboardSentimentChartsProps) {
  return (
    <Grid columns={{ minWidth: 460, repeat: 'fit' }} gap={6}>
      <DashboardSentimentBarChart
        likeUnlikeData={likeUnlikeData}
        summary={summary}
      />
      <DashboardFollowerTrendChart
        followersData={followersData}
        summary={summary}
      />
    </Grid>
  );
}
