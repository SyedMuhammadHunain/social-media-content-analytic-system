// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Left Rail Feed Shortcuts Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
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
            const Icon = item.icon;
            const isActive = activeFilterType === item.type;

            return (
              <button
                key={item.type}
                type="button"
                data-testid={`shortcut-${item.type.toLowerCase()}`}
                onClick={() => onSelectShortcut(item.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--astryx-color-fill-secondary, rgba(0, 0, 0, 0.06))' : 'transparent',
                  color: isActive ? 'var(--astryx-color-primary, #1877F2)' : 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <HStack gap={3} vAlign="center">
                  <Icon
                    style={{
                      width: 18,
                      height: 18,
                      color: isActive ? 'var(--astryx-color-primary, #1877F2)' : 'currentColor',
                    }}
                  />
                  <Text
                    type="body"
                    weight={isActive ? 'semibold' : 'normal'}
                    color={isActive ? 'primary' : 'inherit'}
                  >
                    {item.label}
                  </Text>
                </HStack>

                {item.badge !== undefined && (
                  <Badge variant={isActive ? 'neutral' : 'neutral'} label={item.badge} />
                )}
              </button>
            );
          })}
        </VStack>

        <Divider />

        {/* Quick jump to Creator Analytics */}
        <button
          type="button"
          data-testid="shortcut-creator-analytics"
          onClick={onNavigateAnalytics}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s ease',
            fontFamily: 'inherit',
          }}
        >
          <HStack gap={3} vAlign="center">
            <ChartBarIcon style={{ width: 18, height: 18, color: '#10B981' }} />
            <Text type="body" weight="medium">
              Creator Analytics
            </Text>
          </HStack>
          <Badge
            variant="success"
            label={followerCount !== undefined ? `${(followerCount / 1000).toFixed(1)}k` : 'Live'}
          />
        </button>
      </VStack>
    </Card>
  );
}

export default FeedShortcutsCard;
