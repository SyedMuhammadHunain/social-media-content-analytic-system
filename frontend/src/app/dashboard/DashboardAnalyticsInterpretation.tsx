// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Analytics Interpretation & Insights

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import type {
  CreatorSummaryMetrics,
  LikeUnlikePoint,
  FollowerTrendPoint,
  EngagementPoint,
} from '../../types/analytics';

interface DashboardAnalyticsInterpretationProps {
  summary: CreatorSummaryMetrics;
  likeUnlikeData: LikeUnlikePoint[];
  followersData: FollowerTrendPoint[];
  engagementData: EngagementPoint[];
}

export function DashboardAnalyticsInterpretation({
  summary,
  likeUnlikeData: _likeUnlikeData,
  followersData,
  engagementData,
}: DashboardAnalyticsInterpretationProps) {
  const totalReactions = summary.totalLikes + summary.totalUnlikes;
  const approvalPercentage =
    totalReactions > 0
      ? ((summary.totalLikes / totalReactions) * 100).toFixed(1)
      : '100.0';

  const netFollowerChange = followersData.reduce(
    (acc, curr) => acc + (curr.netChange || 0),
    0
  );

  const avgCommentsPerCycle =
    engagementData.length > 0
      ? (summary.totalComments / engagementData.length).toFixed(1)
      : '0';

  const isHealthyGrowth = netFollowerChange >= 0;

  return (
    <Card
      data-testid="analytics-interpretation-card"
      padding={5}
      style={{ width: '100%', minWidth: 0 }}
    >
      <VStack gap={4}>
        {/* Header */}
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
          <HStack gap={3} vAlign="center">
            <Icon icon="info" size="md" color="secondary" />
            <VStack gap={0}>
              <Heading level={3}>Analytics Interpretation &amp; Insights</Heading>
              <Text type="supporting" color="secondary">
                Key insights into content sentiment, audience growth, and community discussions.
              </Text>
            </VStack>
          </HStack>
        </HStack>

        <Divider />

        {/* 3 Metric Insight Pillars */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={4}>
          {/* Pillar 1: Sentiment */}
          <Card padding={4}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon="check" size="sm" color="secondary" />
                <Heading level={4}>Approval Ratio</Heading>
              </HStack>
              <Heading level={3}>
                {summary.totalLikes.toLocaleString()} Likes / {summary.totalUnlikes.toLocaleString()} Unlikes
              </Heading>
              <Text type="supporting" color="secondary">
                {approvalPercentage}% audience approval rating across all content.
              </Text>
            </VStack>
          </Card>

          {/* Pillar 2: Follower Growth */}
          <Card padding={4}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon="arrowUp" size="sm" color="secondary" />
                <Heading level={4}>Audience Velocity</Heading>
              </HStack>
              <Heading level={3}>
                {summary.totalFollowers.toLocaleString()} Followers
              </Heading>
              <Text type="supporting" color="secondary">
                {isHealthyGrowth
                  ? `Net gain of +${netFollowerChange} followers across tracked intervals.`
                  : `Audience contracted by ${Math.abs(netFollowerChange)} followers.`}
              </Text>
            </VStack>
          </Card>

          {/* Pillar 3: Engagement */}
          <Card padding={4}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon="info" size="sm" color="secondary" />
                <Heading level={4}>Discussion Vitality</Heading>
              </HStack>
              <Heading level={3}>
                {summary.totalComments.toLocaleString()} Comments
              </Heading>
              <Text type="supporting" color="secondary">
                Average of {avgCommentsPerCycle} comments per interval indicating active discussion.
              </Text>
            </VStack>
          </Card>
        </Grid>

        {/* Actionable Recommendations */}
        <Card padding={4}>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Icon icon="info" size="sm" color="secondary" />
              <Heading level={4}>Recommendations</Heading>
            </HStack>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon="check" size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  <strong>Pin High-Sentiment Posts:</strong> Highlight top-performing media to maximize engagement.
                </Text>
              </HStack>
              <HStack gap={2} vAlign="center">
                <Icon icon="check" size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  <strong>Accelerate Discussion:</strong> Reply to comments early to increase discussion velocity.
                </Text>
              </HStack>
              <HStack gap={2} vAlign="center">
                <Icon icon="check" size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  <strong>Consistent Cadence:</strong> Maintain regular publishing schedule for stable follower retention.
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </Card>
  );
}

export default DashboardAnalyticsInterpretation;
