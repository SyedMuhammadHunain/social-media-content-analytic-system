// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Card Metrics Section

'use client';

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';

interface ProfileCardMetricsProps {
  connections: number;
  views: number;
  onOpenProfileViews?: () => void;
}

export function ProfileCardMetrics({
  connections,
  views,
  onOpenProfileViews,
}: ProfileCardMetricsProps) {
  const handleClickViews = (e: React.MouseEvent) => {
    if (onOpenProfileViews) {
      e.stopPropagation();
      onOpenProfileViews();
    }
  };

  return (
    <VStack gap={2} align="stretch" style={{ padding: '12px 16px' }}>
      <HStack hAlign="between" vAlign="center">
        <Text type="supporting" color="secondary">
          Connections
        </Text>
        <Text type="supporting" color="accent" weight="bold">
          {connections.toLocaleString()}
        </Text>
      </HStack>

      <div
        data-testid="profile-views-trigger"
        onClick={handleClickViews}
        style={{
          cursor: onOpenProfileViews ? 'pointer' : 'default',
          borderRadius: 6,
          padding: '2px 4px',
          margin: '-2px -4px',
          transition: 'background-color 0.15s ease',
        }}
        title={onOpenProfileViews ? "Click to see who viewed your profile" : undefined}
      >
        <HStack hAlign="between" vAlign="center">
          <Text type="supporting" color="secondary">
            Who&apos;s viewed your profile
          </Text>
          <Text type="supporting" color="accent" weight="bold">
            {views.toLocaleString()}
          </Text>
        </HStack>
      </div>
    </VStack>
  );
}

export default ProfileCardMetrics;
