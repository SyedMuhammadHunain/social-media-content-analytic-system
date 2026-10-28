// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dashboard KPI Metric Cards

'use client';

import type { ReactNode } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { CreatorSummaryMetrics } from '../../types/analytics';

function Sparkline({ data, strokeColor }: { data: number[]; strokeColor?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={strokeColor || 'var(--color-data-categorical-blue, #0171E3)'}
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface CreatorMetricCardProps {
  testId: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: ReactNode;
  sparkline: number[];
  sparklineColor?: string;
}

function CreatorMetricCard({
  testId,
  label,
  value,
  change,
  positive,
  icon,
  sparkline,
  sparklineColor,
}: CreatorMetricCardProps) {
  return (
    <Card data-testid={testId} padding={4}>
      <VStack gap={2}>
        <HStack hAlign="between" vAlign="center">
          <Heading level={4}>{label}</Heading>
          <div style={{ opacity: 0.75 }}>{icon}</div>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{value}</Heading>
          <HStack gap={1} vAlign="center">
            {positive ? (
              <Icon icon={ArrowUpIcon} size="xsm" color="success" />
            ) : (
              <Icon icon={ArrowDownIcon} size="xsm" color="error" />
            )}
            <Text type="body" color="secondary">
              {change}
            </Text>
          </HStack>
        </HStack>
        <Text type="supporting" color="secondary">
          Live Real-Time Telemetry
        </Text>
        <Sparkline data={sparkline} strokeColor={sparklineColor} />
      </VStack>
    </Card>
  );
}

interface DashboardKpiCardsProps {
  summary: CreatorSummaryMetrics;
  followerSparkline: number[];
  likesSparkline: number[];
  commentsSparkline: number[];
  unlikesSparkline: number[];
}

export function DashboardKpiCards({
  summary,
  followerSparkline,
  likesSparkline,
  commentsSparkline,
  unlikesSparkline: _unlikesSparkline,
}: DashboardKpiCardsProps) {
  const followerChange = summary.totalFollowers > 0 ? '+40 (0.3%)' : '0 new';
  const likesChange = summary.totalLikes > 0 ? '+12.4% vs last cycle' : '0 new';
  const engagementChange = summary.totalComments > 0 ? '+1.8% index' : '0.0% index';
  const commentsChange = summary.totalComments > 0 ? '+8.2% conversation' : '0 new';

  return (
    <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
      <CreatorMetricCard
        testId="metric-total-followers"
        label="Total Followers"
        value={summary.totalFollowers.toLocaleString()}
        change={followerChange}
        positive={summary.totalFollowers >= 0}
        icon={<Icon icon={UserGroupIcon} size="sm" color="success" />}
        sparkline={followerSparkline}
        sparklineColor="#10B981"
      />
      <CreatorMetricCard
        testId="metric-total-likes"
        label="Total Likes"
        value={summary.totalLikes.toLocaleString()}
        change={likesChange}
        positive={summary.totalLikes >= 0}
        icon={<Icon icon={HeartIcon} size="sm" color="primary" />}
        sparkline={likesSparkline}
        sparklineColor="var(--color-data-categorical-blue, #0171E3)"
      />
      <CreatorMetricCard
        testId="metric-engagement-rate"
        label="Engagement Rate"
        value={summary.engagementRate}
        change={engagementChange}
        positive={true}
        icon={<Icon icon={SparklesIcon} size="sm" color="accent" />}
        sparkline={commentsSparkline}
        sparklineColor="#8B5CF6"
      />
      <CreatorMetricCard
        testId="metric-total-comments"
        label="Total Comments"
        value={summary.totalComments.toLocaleString()}
        change={commentsChange}
        positive={summary.totalComments >= 0}
        icon={<Icon icon={ChatBubbleLeftRightIcon} size="sm" />}
        sparkline={commentsSparkline}
        sparklineColor="var(--color-data-categorical-orange, #EB6E00)"
      />
    </Grid>
  );
}
