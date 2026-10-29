// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Refresh Indicator Banner

'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/Layout';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Text } from '@astryxdesign/core/Text';

export function FeedRefreshBanner() {
  return (
    <div
      data-testid="feed-refresh-banner"
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBlockEnd: 12,
        animation: 'feedBannerSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <Card padding={2} elevation="low">
        <HStack gap={2} vAlign="center">
          <Spinner size="sm" />
          <Text size="sm" weight="medium" color="secondary">
            Refreshing feed & fetching latest posts...
          </Text>
        </HStack>
      </Card>
    </div>
  );
}

export default FeedRefreshBanner;
