// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dedicated Creator Analytics Dashboard (PDF Req 4.1.vii, viii, ix & 4.2)

'use client';

import { VStack, HStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/solid';
import { useAnalytics } from '../../context/useAnalytics';

// ============= TOOLTIPS =============

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <Card padding={2}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        {payload.map(entry => (
          <HStack key={entry.name} gap={2} vAlign="center">
            <Icon icon={StopIcon} size="xsm" style={{ color: entry.color }} />
            <Text type="supporting">
              {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value.toLocaleString()}</span>
            </Text>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
}

// ============= SPARKLINE =============

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

// ============= METRIC CARD =============

function CreatorMetricCard({
  testId,
  label,
  value,
  change,
  positive,
  icon,
  sparkline,
  sparklineColor,
}: {
  testId: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  sparkline: number[];
  sparklineColor?: string;
}) {
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

// ============= MAIN COMPONENT =============

export default function DashboardPage() {
  const {
    likeUnlikeData,
    followersData,
    engagementData,
    summary,
    timeRange,
    setTimeRange,
    refreshMetrics,
  } = useAnalytics();

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
            {/* Header & Controls */}
            <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  <Heading level={2}>Creator Analytics Dashboard</Heading>
                  <HStack
                    gap={1}
                    vAlign="center"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                      }}
                    />
                    <Text type="supporting" style={{ color: '#10B981', fontWeight: 600 }}>
                      Live Telemetry (&lt;2s sync)
                    </Text>
                  </HStack>
                </HStack>
                <Text type="body" color="secondary">
                  Real-time sentiment reaction distribution, audience growth velocity, and engagement tracking (PDF Sections 4.1.vii-ix &amp; 4.2).
                </Text>
              </VStack>

              <HStack gap={2} vAlign="center">
                {(['24h', '7d', '30d'] as const).map(range => (
                  <Button
                    key={range}
                    label={range.toUpperCase()}
                    variant={timeRange === range ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  />
                ))}
                <Button
                  data-testid="refresh-metrics-btn"
                  label="Refresh"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ArrowPathIcon} size="xsm" />}
                  onClick={refreshMetrics}
                />
              </HStack>
            </HStack>

            {/* Performance Metric Cards */}
            <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
              <CreatorMetricCard
                testId="metric-total-followers"
                label="Total Followers"
                value={summary.totalFollowers.toLocaleString()}
                change="+40 (0.3%)"
                positive={true}
                icon={<Icon icon={UserGroupIcon} size="sm" color="success" />}
                sparkline={followerSparkline}
                sparklineColor="#10B981"
              />
              <CreatorMetricCard
                testId="metric-total-likes"
                label="Total Likes"
                value={summary.totalLikes.toLocaleString()}
                change="+12.4% vs last cycle"
                positive={true}
                icon={<Icon icon={HeartIcon} size="sm" color="primary" />}
                sparkline={likesSparkline}
                sparklineColor="var(--color-data-categorical-blue, #0171E3)"
              />
              <CreatorMetricCard
                testId="metric-engagement-rate"
                label="Engagement Rate"
                value={summary.engagementRate}
                change="+1.8% index"
                positive={true}
                icon={<Icon icon={SparklesIcon} size="sm" color="accent" />}
                sparkline={commentsSparkline}
                sparklineColor="#8B5CF6"
              />
              <CreatorMetricCard
                testId="metric-total-comments"
                label="Total Comments"
                value={summary.totalComments.toLocaleString()}
                change="+8.2% conversation"
                positive={true}
                icon={<Icon icon={ChatBubbleLeftRightIcon} size="sm" />}
                sparkline={unlikesSparkline}
                sparklineColor="var(--color-data-categorical-orange, #EB6E00)"
              />
            </Grid>

            <Divider />

            {/* Dedicated Creator Analytical Graphs */}
            <Grid columns={{ minWidth: 460, repeat: 'fit' }} gap={6}>
              {/* Graph 1: Like / Unlike Comparative Bar Graph (PDF Section 4.1.vii & 4.2) */}
              <Card data-testid="like-unlike-graph" padding={4}>
                <VStack gap={4}>
                  <HStack hAlign="between" vAlign="center">
                    <VStack gap={1}>
                      <Heading level={4}>Likes vs. Unlikes (Post Sentiment)</Heading>
                      <Text type="supporting" color="secondary">
                        Comparative bar analysis of audience approval versus dissent over time (PDF Section 4.1.vii).
                      </Text>
                    </VStack>
                    <HStack gap={1} vAlign="center">
                      <Icon icon={CheckCircleIcon} size="xsm" color="success" />
                      <Text type="supporting" color="secondary">
                        {summary.totalLikes} Likes : {summary.totalUnlikes} Unlikes
                      </Text>
                    </HStack>
                  </HStack>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={likeUnlikeData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fill: 'var(--color-text-secondary, #4E606F)',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 12,
                          fill: 'var(--color-text-secondary, #4E606F)',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="likes"
                        name="Likes"
                        fill="var(--color-data-categorical-blue, #0171E3)"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="unlikes"
                        name="Unlikes"
                        fill="#E53935"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <HStack gap={6} vAlign="center">
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

              {/* Graph 2: Followers Growth Trend Line Graph (PDF Section 4.1.viii & 4.2) */}
              <Card data-testid="followers-trend-graph" padding={4}>
                <VStack gap={4}>
                  <HStack hAlign="between" vAlign="center">
                    <VStack gap={1}>
                      <Heading level={4}>Followers Growth Trend</Heading>
                      <Text type="supporting" color="secondary">
                        Audience gain and loss velocity across intervals (PDF Section 4.1.viii).
                      </Text>
                    </VStack>
                    <HStack gap={1} vAlign="center">
                      <Icon icon={ArrowUpIcon} size="xsm" color="success" />
                      <Text type="supporting" color="secondary">
                        Net +{followersData[followersData.length - 1]?.netChange || 0} today
                      </Text>
                    </HStack>
                  </HStack>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={followersData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fill: 'var(--color-text-secondary, #4E606F)',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{
                          fontSize: 12,
                          fill: 'var(--color-text-secondary, #4E606F)',
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={46}
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

                  <HStack gap={6} vAlign="center">
                    <HStack gap={2} vAlign="center">
                      <Icon icon={StopIcon} size="xsm" style={{ color: '#10B981' }} />
                      <Text type="supporting">Followers ({summary.totalFollowers.toLocaleString()} total)</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Card>
            </Grid>

            {/* Graph 3: Engagement & Comments Line Graph (PDF Section 4.1.ix & 4.2) */}
            <Card data-testid="engagement-graph" padding={4}>
              <VStack gap={4}>
                <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
                  <VStack gap={1}>
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

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={engagementData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 12,
                        fill: 'var(--color-text-secondary, #4E606F)',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{
                        fontSize: 12,
                        fill: 'var(--color-text-secondary, #4E606F)',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fontSize: 12,
                        fill: 'var(--color-text-secondary, #4E606F)',
                      }}
                      axisLine={false}
                      tickLine={false}
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

                <HStack gap={6} vAlign="center" wrap="wrap">
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
          </VStack>
        </LayoutContent>
      }
    />
  );
}
