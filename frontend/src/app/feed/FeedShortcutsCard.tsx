// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Left Rail Feed Shortcuts Card

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { Button } from '@astryxdesign/core/Button';
import {
  NewspaperIcon,
  BookmarkIcon,
  ChartBarIcon,
  BellIcon,
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

import type { FeedFilterType } from '../../types/social';
import { useAuth } from '../../context/useAuth';

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
  followerCount,
  onSelectShortcut,
  onNavigateAnalytics,
  onNavigateNotifications,
  onToggleTheme,
  onLogout,
}: FeedShortcutsCardProps) {
  const { logout } = useAuth();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.style.colorScheme = newTheme;
    window.dispatchEvent(new CustomEvent('app:set-theme', { detail: newTheme }));
    onToggleTheme?.();
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

        <Divider />

        {/* New Shortcuts: Notification, Appearance, Logout */}
        <VStack gap={1}>
          <Item
            data-testid="shortcut-notifications"
            label="Notifications"
            density="compact"
            startContent={<Icon icon={BellIcon} size="sm" />}
            onClick={() => {
              if (onNavigateNotifications) {
                onNavigateNotifications();
              } else {
                window.dispatchEvent(
                  new CustomEvent('social:navigate-tab', { detail: 'notifications' })
                );
              }
            }}
          />

          <Item
            data-testid="shortcut-appearance"
            label="Appearance"
            density="compact"
            startContent={<Icon icon={PaintBrushIcon} size="sm" />}
            onClick={() => setIsAppearanceOpen(prev => !prev)}
          />

          {isAppearanceOpen && (
            <div style={{ padding: '4px 8px' }}>
              <HStack gap={2}>
                <Button
                  data-testid="theme-light-btn"
                  size="sm"
                  variant={currentTheme === 'light' ? 'primary' : 'secondary'}
                  label="Light"
                  icon={<Icon icon={SunIcon} size="xsm" />}
                  onClick={() => handleThemeChange('light')}
                />
                <Button
                  data-testid="theme-dark-btn"
                  size="sm"
                  variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
                  label="Dark"
                  icon={<Icon icon={MoonIcon} size="xsm" />}
                  onClick={() => handleThemeChange('dark')}
                />
              </HStack>
            </div>
          )}

          <Item
            data-testid="shortcut-logout"
            label="Logout"
            density="compact"
            startContent={<Icon icon={ArrowRightOnRectangleIcon} size="sm" color="error" />}
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                logout();
              }
            }}
          />
        </VStack>
      </VStack>
    </Card>
  );
}

export default FeedShortcutsCard;
