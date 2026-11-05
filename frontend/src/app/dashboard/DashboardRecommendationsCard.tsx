// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dashboard Recommendations Card

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';

export function DashboardRecommendationsCard() {
  return (
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
  );
}
