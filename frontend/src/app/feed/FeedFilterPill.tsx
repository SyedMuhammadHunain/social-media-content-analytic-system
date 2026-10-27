// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Active Filter Pill Indicator

'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/Layout';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import type { FeedFilter } from '../../types/social.ts';

interface FeedFilterPillProps {
  activeFilter: FeedFilter;
  postCount: number;
  onClearFilter: () => void;
}

export function FeedFilterPill({
  activeFilter,
  postCount,
  onClearFilter,
}: FeedFilterPillProps) {
  if (activeFilter.type === 'ALL') {
    return null;
  }

  const postLabel = postCount === 1 ? 'post' : 'posts';

  return (
    <Card padding={3}>
      <HStack justify="between" vAlign="center">
        <HStack gap={2} vAlign="center">
          <Badge variant="neutral" label={activeFilter.label} />
          <Text type="supporting" color="secondary">
            {postCount} {postLabel}
          </Text>
        </HStack>
        <Button
          data-testid="clear-filter-btn"
          size="sm"
          variant="ghost"
          label="Clear Filter"
          onClick={onClearFilter}
        />
      </HStack>
    </Card>
  );
}

export default FeedFilterPill;
