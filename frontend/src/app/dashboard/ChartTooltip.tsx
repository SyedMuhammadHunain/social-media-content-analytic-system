// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chart Tooltip Component

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { StopIcon } from '@heroicons/react/24/solid';

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
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
