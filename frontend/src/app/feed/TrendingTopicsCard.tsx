// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Right Rail Trending Topics Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { FireIcon } from '@heroicons/react/24/outline';

import type { TrendingTopic } from '../../types/social';

export interface TrendingTopicsCardProps {
  topics: TrendingTopic[];
  activeHashtag?: string;
  onSelectHashtag: (tag: string) => void;
}

export function TrendingTopicsCard({
  topics,
  activeHashtag,
  onSelectHashtag,
}: TrendingTopicsCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FireIcon} size="md" />
          <Heading level={4}>Trending Topics</Heading>
        </HStack>

        <VStack gap={1}>
          {topics.map(topic => {
            const isActive = activeHashtag === topic.tag;
            const sanitizedTag = topic.tag.replace(/^#/, '');

            return (
              <Item
                key={topic.id}
                data-testid={`trending-topic-${sanitizedTag}`}
                label={topic.tag}
                description={topic.category ? `${topic.category} • Trending` : undefined}
                density="compact"
                isSelected={isActive}
                endContent={
                  <Badge
                    variant="neutral"
                    label={topic.formattedCount}
                  />
                }
                onClick={() => onSelectHashtag(topic.tag)}
              />
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}

export default TrendingTopicsCard;
