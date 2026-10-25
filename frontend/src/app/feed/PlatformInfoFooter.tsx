// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Right Rail Platform Info Footer

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';

export function PlatformInfoFooter() {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack justify="between" vAlign="center">
          <Text type="supporting" weight="semibold">
            OOAD Content Analysis
          </Text>
          <Badge variant="neutral" label="v1.0" />
        </HStack>

        <Text type="supporting" color="secondary">
          High-throughput social telemetry engine designed for 500M DAU scale (PDF Section 5).
        </Text>

        <Divider />

        <VStack gap={1}>
          <HStack gap={1} wrap="wrap">
            <Text type="supporting" color="secondary">
              React 19 • Meta Astryx • Spring Boot 3
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            NED University of Engineering & Technology • 2026
          </Text>
        </VStack>
      </VStack>
    </Card>
  );
}

export default PlatformInfoFooter;
