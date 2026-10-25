// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Right Rail Trending Topics Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
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
          <FireIcon style={{ width: 20, height: 20, color: '#F97316' }} />
          <Heading level={4}>Trending Topics</Heading>
        </HStack>

        <VStack gap={1}>
          {topics.map(topic => {
            const isActive = activeHashtag === topic.tag;
            const sanitizedTag = topic.tag.replace(/^#/, '');

            return (
              <button
                key={topic.id}
                type="button"
                data-testid={`trending-topic-${sanitizedTag}`}
                onClick={() => onSelectHashtag(topic.tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--astryx-color-fill-secondary, rgba(0, 0, 0, 0.06))' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <VStack gap={0}>
                  {topic.category && (
                    <Text type="supporting" color="secondary">
                      {topic.category} • Trending
                    </Text>
                  )}
                  <Text
                    type="body"
                    weight={isActive ? 'bold' : 'medium'}
                    color={isActive ? 'primary' : 'inherit'}
                  >
                    {topic.tag}
                  </Text>
                </VStack>

                <Badge
                  variant={isActive ? 'neutral' : 'neutral'}
                  label={topic.formattedCount}
                />
              </button>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}

export default TrendingTopicsCard;
