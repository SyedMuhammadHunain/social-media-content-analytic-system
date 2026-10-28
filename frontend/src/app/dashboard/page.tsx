// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dedicated Creator Analytics Dashboard (PDF Req 4.1.vii, viii, ix & 4.2)

'use client';

import { useEffect } from 'react';
import { VStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import { useAnalytics } from '../../context/useAnalytics';
import { useAuth } from '../../context/useAuth';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardSentimentCharts } from './DashboardSentimentCharts';
import { DashboardEngagementChart } from './DashboardEngagementChart';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const {
    likeUnlikeData,
    followersData,
    engagementData,
    summary,
    timeRange,
    setTimeRange,
    refreshMetrics,
  } = useAnalytics();

  useEffect(() => {
    refreshMetrics?.();
    const interval = setInterval(() => {
      refreshMetrics?.();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const followerSparkline = followersData.map(d => d.followers);
  const likesSparkline = likeUnlikeData.map(d => d.likes);
  const commentsSparkline = engagementData.map(d => d.comments);
  const unlikesSparkline = likeUnlikeData.map(d => d.unlikes);

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <DashboardHeader
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              refreshMetrics={refreshMetrics}
              currentUser={currentUser}
            />

            <DashboardKpiCards
              summary={summary}
              followerSparkline={followerSparkline}
              likesSparkline={likesSparkline}
              commentsSparkline={commentsSparkline}
              unlikesSparkline={unlikesSparkline}
            />

            <Divider />

            <DashboardSentimentCharts
              likeUnlikeData={likeUnlikeData}
              followersData={followersData}
              summary={summary}
            />

            <DashboardEngagementChart
              engagementData={engagementData}
              summary={summary}
            />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
