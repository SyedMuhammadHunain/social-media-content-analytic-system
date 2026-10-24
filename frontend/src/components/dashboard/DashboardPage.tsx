// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Creator Analytics Dashboard

'use client';

import { useState } from 'react';
import { VStack, HStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Grid } from '@astryxdesign/core/Grid';
import { Table, proportional } from '@astryxdesign/core/Table';
import type { TableColumn } from '@astryxdesign/core/Table';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';

import {
  ArrowPathIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/solid';

import type { TimeRange, TopPostMetric } from '../../types/analytics';
import { getCreatorAnalytics } from '../../mock/creatorMetrics';

const chartColors = {
  followers: '#1877F2',
  followersFill: '#E7F3FF',
  likes: '#10B981',
  unlikes: '#EF4444',
  comments: '#8B5CF6',
  engagements: '#3B82F6',
};

// ============= LEGEND & TOOLTIP =============

function ChartLegendItem({ color, label }: { color: string; label: string }) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={StopIcon} size="xsm" style={{ color }} />
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </HStack>
  );
}

// ============= KPI METRIC CARDS =============

function MetricTile({
  label,
  value,
  subtext,
  change,
  positive = true,
}: {
  label: string;
  value: string;
  subtext: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <HStack gap={3} vAlign="center">
          <Heading level={2}>{value}</Heading>
          <Badge
            variant={positive ? 'success' : 'error'}
            label={change}
            icon={<Icon icon={ArrowUpIcon} size="xsm" />}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {subtext}
        </Text>
      </VStack>
    </Card>
  );
}

// ============= POSTS TABLE COLUMNS =============

const postColumns: TableColumn<TopPostMetric>[] = [
  {
    key: 'title',
    header: 'Post Title',
    renderCell: item => item.title,
    width: proportional(45),
  },
  {
    key: 'type',
    header: 'Format',
    renderCell: item => (
      <Badge
        variant={item.type === 'Video' ? 'purple' : item.type === 'Image' ? 'teal' : 'neutral'}
        label={item.type}
      />
    ),
    width: proportional(15),
  },
  {
    key: 'likes',
    header: 'Likes',
    align: 'end',
    renderCell: item => item.likes.toLocaleString(),
    width: proportional(15),
  },
  {
    key: 'unlikes',
    header: 'Unlikes',
    align: 'end',
    renderCell: item => item.unlikes.toLocaleString(),
    width: proportional(10),
  },
  {
    key: 'comments',
    header: 'Comments',
    align: 'end',
    renderCell: item => item.comments.toLocaleString(),
    width: proportional(15),
  },
];

// ============= MAIN COMPONENT =============

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  const analytics = getCreatorAnalytics(timeRange);
  const { summary, followersHistory, likeUnlikeComparison, engagementHistory, topPosts } = analytics;

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* Top Bar: Title & Filter Controls */}
            <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
              <VStack gap={1}>
                <Heading level={2}>Creator Analytics Dashboard</Heading>
                <Text type="body" color="secondary">
                  Real-time visual feedback on audience growth, reactions, and post engagement
                </Text>
              </VStack>
              <HStack gap={2} vAlign="center">
                {(['24h', '7d', '30d'] as TimeRange[]).map(range => (
                  <Button
                    key={range}
                    label={range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                    variant={timeRange === range ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  />
                ))}
                <Button
                  label="Refresh"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ArrowPathIcon} size="sm" />}
                  onClick={() => setRefreshKey(k => k + 1)}
                />
              </HStack>
            </HStack>

            {/* Metric Summary Cards */}
            <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={4}>
              <MetricTile
                label="Followers Graph Summary (Req 4.1.viii)"
                value={summary.totalFollowers.toLocaleString()}
                change={summary.followerGrowth}
                subtext="Total audience size & net growth rate"
                positive={summary.followerGrowthPositive}
              />
              <MetricTile
                label="Like / Unlike Graph Summary (Req 4.1.vii)"
                value={summary.totalLikes.toLocaleString()}
                change={summary.likeRatio}
                subtext={`${summary.totalUnlikes.toLocaleString()} unlikes recorded`}
                positive={true}
              />
              <MetricTile
                label="Engagement Graph Summary (Req 4.1.ix)"
                value={summary.totalComments.toLocaleString()}
                change={summary.engagementRate}
                subtext={`${summary.totalEngagements.toLocaleString()} total interactions`}
                positive={true}
              />
            </Grid>

            <Divider />

            {/* 1. Followers Graph (Req 4.1.viii) */}
            <Card padding={4}>
              <VStack gap={4}>
                <HStack hAlign="between" vAlign="center">
                  <VStack gap={1}>
                    <Heading level={3}>Followers Graph</Heading>
                    <Text type="supporting" color="secondary">
                      Audience increasing / decreasing curve across selected timeframe
                    </Text>
                  </VStack>
                  <HStack gap={4} vAlign="center">
                    <ChartLegendItem color={chartColors.followers} label="Active Followers" />
                  </HStack>
                </HStack>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      key={`fol-${refreshKey}-${timeRange}`}
                      data={followersHistory}
                      margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 500', 'dataMax + 500']}
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="followers"
                        name="Followers"
                        stroke={chartColors.followers}
                        strokeWidth={2.5}
                        fill={chartColors.followersFill}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </VStack>
            </Card>

            <Divider />

            {/* Grid of Like/Unlike Graph and Engagement Graph */}
            <Grid columns={{ minWidth: 420, repeat: 'fit' }} gap={4}>
              {/* 2. Like / Unlike Graph (Req 4.1.vii) */}
              <Card padding={4}>
                <VStack gap={4}>
                  <HStack hAlign="between" vAlign="center">
                    <VStack gap={1}>
                      <Heading level={4}>Like / Unlike Graph</Heading>
                      <Text type="supporting" color="secondary">
                        Comparative reaction volume per post and day
                      </Text>
                    </VStack>
                    <HStack gap={3} vAlign="center">
                      <ChartLegendItem color={chartColors.likes} label="Likes" />
                      <ChartLegendItem color={chartColors.unlikes} label="Unlikes" />
                    </HStack>
                  </HStack>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        key={`likes-${refreshKey}-${timeRange}`}
                        data={likeUnlikeComparison}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                        />
                        <Tooltip />
                        <Bar dataKey="likes" name="Likes" fill={chartColors.likes} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="unlikes" name="Unlikes" fill={chartColors.unlikes} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </VStack>
              </Card>

              {/* 3. Engagement Graph (Req 4.1.ix) */}
              <Card padding={4}>
                <VStack gap={4}>
                  <HStack hAlign="between" vAlign="center">
                    <VStack gap={1}>
                      <Heading level={4}>Engagement Graph</Heading>
                      <Text type="supporting" color="secondary">
                        Comments directly proportional to audience engagements
                      </Text>
                    </VStack>
                    <HStack gap={3} vAlign="center">
                      <ChartLegendItem color={chartColors.comments} label="Comments" />
                      <ChartLegendItem color={chartColors.engagements} label="Total Activity" />
                    </HStack>
                  </HStack>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        key={`eng-${refreshKey}-${timeRange}`}
                        data={engagementHistory}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="engagements"
                          name="Total Engagements"
                          stroke={chartColors.engagements}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="comments"
                          name="Comments"
                          stroke={chartColors.comments}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </VStack>
              </Card>
            </Grid>

            <Divider />

            {/* Top Posts Performance Table */}
            <Card padding={4}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={4}>Top Creator Content Performance</Heading>
                  <Text type="supporting" color="secondary">
                    Breakdown of Text, Image, and Video posts published by creator
                  </Text>
                </VStack>
                <Table<TopPostMetric>
                  data={topPosts}
                  columns={postColumns}
                  idKey="id"
                  density="compact"
                  dividers="rows"
                  hasHover
                />
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
