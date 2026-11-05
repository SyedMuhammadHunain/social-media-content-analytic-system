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
  BookmarkIcon,
  ChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

import type { FeedFilterType } from '../../types/social';
import { useAuth } from '../../context/useAuth';
import { FeedAppearanceSwitcher } from './FeedAppearanceSwitcher.tsx';

export interface FeedShortcutsCardProps {
  activeFilterType: FeedFilterType;
  savedCount?: number;
  followerCount?: number;
  onSelectShortcut: (type: FeedFilterType) => void;
  onNavigateAnalytics?: () => void;
  onNavigateNotifications?: () => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

export function FeedShortcutsCard({
  activeFilterType,
  savedCount = 0,
  followerCount: _followerCount,
  onSelectShortcut,
  onNavigateAnalytics,
  onNavigateNotifications,
  onToggleTheme,
  onLogout,
}: FeedShortcutsCardProps) {
  const { logout } = useAuth();

  const handleNotificationsClick = () => {
    if (onNavigateNotifications) {
      onNavigateNotifications();
    } else {
      window.dispatchEvent(
        new CustomEvent('social:navigate-tab', { detail: 'notifications' })
      );
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

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
          {items.map(item => (
            <Item
              key={item.type}
              data-testid={`shortcut-${item.type.toLowerCase()}`}
              label={item.label}
              density="compact"
              isSelected={activeFilterType === item.type}
              startContent={<Icon icon={item.icon} size="sm" />}
              endContent={
                item.badge !== undefined ? (
                  <Badge variant="neutral" label={item.badge} />
                ) : undefined
              }
              onClick={() => onSelectShortcut(item.type)}
            />
          ))}
        </VStack>

        <Divider />

        <Item
          data-testid="shortcut-creator-analytics"
          label="Creator Analytics"
          density="compact"
          startContent={<Icon icon={ChartBarIcon} size="sm" />}
          onClick={onNavigateAnalytics}
        />

        <Divider />

        <VStack gap={1}>
          <Item
            data-testid="shortcut-notifications"
            label="Notifications"
            density="compact"
            startContent={<Icon icon={BellIcon} size="sm" />}
            onClick={handleNotificationsClick}
          />

          <FeedAppearanceSwitcher onToggleTheme={onToggleTheme} />

          <Item
            data-testid="shortcut-logout"
            label="Logout"
            density="compact"
            startContent={<Icon icon={ArrowRightOnRectangleIcon} size="sm" color="error" />}
            onClick={handleLogoutClick}
          />
        </VStack>
      </VStack>
    </Card>
  );
}

export default FeedShortcutsCard;
