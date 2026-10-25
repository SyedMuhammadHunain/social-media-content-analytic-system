// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Left Rail Feed Shortcuts Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import {
  NewspaperIcon,
  PhotoIcon,
  BookmarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import type { FeedFilterType } from '../../types/social';

export interface FeedShortcutsCardProps {
  activeFilterType: FeedFilterType;
  savedCount?: number;
  followerCount?: number;
  onSelectShortcut: (type: FeedFilterType) => void;
  onNavigateAnalytics?: () => void;
}

export function FeedShortcutsCard({
  activeFilterType,
  savedCount = 0,
  followerCount,
  onSelectShortcut,
  onNavigateAnalytics,
}: FeedShortcutsCardProps) {
  const items: Array<{
    type: FeedFilterType;
    label: string;
    icon: typeof NewspaperIcon;
    badge?: string | number;
  }> = [
    {
      type: 'ALL',
      label: 'All Posts',
      icon: NewspaperIcon,
    },
    {
      type: 'MEDIA',
      label: 'Media Only',
      icon: PhotoIcon,
    },
    {
      type: 'BOOKMARKS',
      label: 'Saved Posts',
      icon: BookmarkIcon,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={4}>Feeds & Shortcuts</Heading>

        <VStack gap={1}>
          {items.map(item => {
            const isActive = activeFilterType === item.type;

            return (
              <Item
                key={item.type}
                data-testid={`shortcut-${item.type.toLowerCase()}`}
                label={item.label}
                density="compact"
                isSelected={isActive}
                startContent={<Icon icon={item.icon} size="sm" />}
                endContent={
                  item.badge !== undefined ? (
                    <Badge variant="neutral" label={item.badge} />
                  ) : undefined
                }
                onClick={() => onSelectShortcut(item.type)}
              />
            );
          })}
        </VStack>

        <Divider />

        {/* Quick jump to Creator Analytics */}
        <Item
          data-testid="shortcut-creator-analytics"
          label="Creator Analytics"
          density="compact"
          startContent={<Icon icon={ChartBarIcon} size="sm" />}
          endContent={
            <Badge
              variant="success"
              label={followerCount !== undefined ? `${(followerCount / 1000).toFixed(1)}k` : 'Live'}
            />
          }
          onClick={onNavigateAnalytics}
        />
      </VStack>
    </Card>
  );
}

export default FeedShortcutsCard;
