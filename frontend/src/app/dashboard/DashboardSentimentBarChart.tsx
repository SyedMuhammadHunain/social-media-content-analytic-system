// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Likes vs Unlikes Post Sentiment Bar Chart (PDF Section 4.1.vii & 4.2)

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/solid';
import { ChartTooltip } from './ChartTooltip';
import type { LikeUnlikePoint, CreatorSummaryMetrics } from '../../types/analytics';

interface DashboardSentimentBarChartProps {
  likeUnlikeData: LikeUnlikePoint[];
  summary: CreatorSummaryMetrics;
}

export function DashboardSentimentBarChart({
  likeUnlikeData,
  summary,
}: DashboardSentimentBarChartProps) {
  return (
    <Card
      data-testid="like-unlike-graph"
      padding={4}
      style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}
    >
      <VStack gap={4}>
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
          <VStack gap={1} style={{ minWidth: 200, flex: 1 }}>
            <Heading level={4}>Likes vs. Unlikes (Post Sentiment)</Heading>
            <Text type="supporting" color="secondary">
              Comparative bar analysis of audience approval versus dissent over time (PDF Section 4.1.vii).
            </Text>
          </VStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={CheckCircleIcon} size="xsm" color="success" />
            <Text type="supporting" color="secondary" style={{ whiteSpace: 'nowrap' }}>
              {summary.totalLikes} Likes : {summary.totalUnlikes} Unlikes
            </Text>
          </HStack>
        </HStack>

        <div style={{ width: '100%', minWidth: 0, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={likeUnlikeData}
              margin={{ top: 10, right: 12, left: -14, bottom: 0 }}
              barGap={4}
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
                tick={{
                  fontSize: 11,
                  fill: 'var(--color-text-secondary, #4E606F)',
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="likes"
                name="Likes"
                fill="var(--color-data-categorical-blue, #0171E3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="unlikes"
                name="Unlikes"
                fill="#E53935"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: 'var(--color-data-categorical-blue, #0171E3)' }} />
            <Text type="supporting">Likes (Positive Feedback)</Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: '#E53935' }} />
            <Text type="supporting">Unlikes (Dissent)</Text>
          </HStack>
        </HStack>
      </VStack>
    </Card>
  );
}
