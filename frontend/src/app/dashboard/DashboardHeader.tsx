// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dashboard Header & Controls

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { TimeRange } from '../../types/analytics';
import type { UserProfile } from '../../types/social';

interface DashboardHeaderProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  refreshMetrics?: () => Promise<void>;
  currentUser?: UserProfile | null;
}

export function DashboardHeader({ timeRange, setTimeRange, refreshMetrics, currentUser }: DashboardHeaderProps) {
  return (
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
          Live analytics for <strong style={{ color: 'var(--color-text-primary, #fff)' }}>{currentUser?.name || 'Creator'}</strong>{currentUser?.username ? ` (@${currentUser.username})` : ''} • Real-time sentiment reaction distribution, audience growth velocity, and engagement tracking (PDF Sections 4.1.vii-ix &amp; 4.2).
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
  );
}
