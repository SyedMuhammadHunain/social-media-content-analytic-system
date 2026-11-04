// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dashboard Header & Controls

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import type { TimeRange } from '../../types/analytics';
import type { UserProfile } from '../../types/social';

interface DashboardHeaderProps {
  currentUser?: UserProfile | null;
  timeRange?: TimeRange;
  setTimeRange?: (range: TimeRange) => void;
  refreshMetrics?: () => Promise<void>;
}

export function DashboardHeader({ currentUser }: DashboardHeaderProps) {
  return (
    <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>Creator Analytics Dashboard</Heading>
        </HStack>
        <Text type="body" color="secondary">
          Live analytics for <strong style={{ color: 'var(--color-text-primary, #fff)' }}>{currentUser?.name || 'Creator'}</strong>{currentUser?.username ? ` (@${currentUser.username})` : ''}.
        </Text>
      </VStack>
    </HStack>
  );
}
