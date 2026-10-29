// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Engagement & Comments Proportionality Chart (PDF Section 4.1.ix & 4.2)

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
import { StopIcon } from '@heroicons/react/24/solid';
import { ChartTooltip } from './ChartTooltip';
import type { EngagementPoint, CreatorSummaryMetrics } from '../../types/analytics';

interface DashboardEngagementChartProps {
  engagementData: EngagementPoint[];
  summary: CreatorSummaryMetrics;
}

export function DashboardEngagementChart({
  engagementData,
  summary,
}: DashboardEngagementChartProps) {
  return (
    <Card
      data-testid="engagement-graph"
      padding={4}
      style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}
    >
      <VStack gap={4}>
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
          <VStack gap={1} style={{ minWidth: 200, flex: 1 }}>
            <Heading level={4}>Creator Engagement &amp; Comments Proportionality</Heading>
            <Text type="supporting" color="secondary">
              Comments directly proportional to creator engagement score and discussion frequency (PDF Section 4.1.ix).
            </Text>
          </VStack>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Current Engagement Index:
            </Text>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 6,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#8B5CF6',
                fontWeight: 600,
                fontSize: 13,
              }}>
              {summary.engagementRate}
            </span>
          </HStack>
        </HStack>

        <div style={{ width: '100%', minWidth: 0, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={engagementData}
              margin={{ top: 10, right: 14, left: -14, bottom: 0 }}
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
                yAxisId="left"
                tick={{
                  fontSize: 11,
                  fill: 'var(--color-text-secondary, #4E606F)',
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{
                  fontSize: 11,
                  fill: 'var(--color-text-secondary, #4E606F)',
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="comments"
                name="Comments"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#8B5CF6' }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="engagementScore"
                name="Engagement Score"
                stroke="var(--color-data-categorical-blue, #0171E3)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: 'var(--color-data-categorical-blue, #0171E3)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: '#8B5CF6' }} />
            <Text type="supporting">Comments Volume</Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: 'var(--color-data-categorical-blue, #0171E3)' }} />
            <Text type="supporting">Engagement Score (Proportional Index)</Text>
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
}
