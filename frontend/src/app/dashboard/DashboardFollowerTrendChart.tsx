// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Followers Growth Trend Line Chart (PDF Section 4.1.viii & 4.2)

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/solid';
import { ChartTooltip } from './ChartTooltip';
import type { FollowerTrendPoint, CreatorSummaryMetrics } from '../../types/analytics';

interface DashboardFollowerTrendChartProps {
  followersData: FollowerTrendPoint[];
  summary: CreatorSummaryMetrics;
}

export function DashboardFollowerTrendChart({
  followersData,
  summary,
}: DashboardFollowerTrendChartProps) {
  const latestNetChange = followersData[followersData.length - 1]?.netChange || 0;

  return (
    <Card
      data-testid="followers-trend-graph"
      padding={4}
      style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}
    >
      <VStack gap={4}>
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
          <VStack gap={1} style={{ minWidth: 200, flex: 1 }}>
            <Heading level={4}>Followers Growth Trend</Heading>
            <Text type="supporting" color="secondary">
              Audience gain and loss velocity across intervals (PDF Section 4.1.viii).
            </Text>
          </VStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={ArrowUpIcon} size="xsm" color="success" />
            <Text type="supporting" color="secondary" style={{ whiteSpace: 'nowrap' }}>
              Net +{latestNetChange} today
            </Text>
          </HStack>
        </HStack>

        <div style={{ width: '100%', minWidth: 0, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={followersData}
              margin={{ top: 10, right: 12, left: -6, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
              />
              <XAxis
                dataKey="date"
                interval="preserveStartEnd"
                tick={{
                  fontSize: 11,
                  fill: 'var(--color-text-secondary, #4E606F)',
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{
                  fontSize: 11,
                  fill: 'var(--color-text-secondary, #4E606F)',
                }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="followers"
                name="Followers"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: '#10B981' }} />
            <Text type="supporting">Followers ({summary.totalFollowers.toLocaleString()} total)</Text>
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
}
