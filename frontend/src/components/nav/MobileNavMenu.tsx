// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Mobile Navigation Menu

'use client';

import { MoreMenu } from '@astryxdesign/core/MoreMenu';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import {
  NewspaperIcon,
  ChartBarSquareIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types/social.ts';
import type { DemoUserSummary } from '../../context/auth-context-def.ts';

interface MobileNavMenuProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
  setIsNotificationsOpen: (val: boolean) => void;
  unreadCount: number;
  onOpenNewPost?: () => void;
}

export function MobileNavMenu({
  mode,
  onToggleTheme,
  onSelectTab,
  currentUser,
  onLogout,
  demoUsers,
  onSwitchUser,
  setIsNotificationsOpen,
  unreadCount,
  onOpenNewPost,
}: MobileNavMenuProps) {
  const mobileMenuItems = [
    ...(onOpenNewPost
      ? [
          {
            id: 'nav-new-post',
            label: 'Create New Post',
            icon: <Icon icon={PlusIcon} size="sm" />,
            onClick: onOpenNewPost,
          },
        ]
      : []),
    {
      id: 'nav-feed',
      label: 'News Feed',
      icon: <Icon icon={NewspaperIcon} size="sm" />,
      onClick: () => onSelectTab('feed'),
    },
    {
      id: 'nav-analytics',
      label: 'Analytics Dashboard',
      icon: <Icon icon={ChartBarSquareIcon} size="sm" />,
      onClick: () => onSelectTab('dashboard'),
    },
    {
      id: 'nav-notifications',
      label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
      icon: <Icon icon={BellIcon} size="sm" />,
      onClick: () => setIsNotificationsOpen(true),
    },
    ...(demoUsers && demoUsers.length > 0 && onSwitchUser
      ? demoUsers.map((u) => ({
          id: `mobile-switch-${u.id}`,
          label: `Switch to ${u.name}${currentUser?.id === u.id ? ' ✓' : ''}`,
          icon: <Avatar name={u.name} src={u.avatarUrl} size="sm" />,
          onClick: () => onSwitchUser(u.id),
        }))
      : []),
    {
      id: 'theme-toggle',
      label: mode === 'dark' ? 'Light Mode' : 'Dark Mode',
      icon: <Icon icon={mode === 'dark' ? SunIcon : MoonIcon} size="sm" />,
      onClick: onToggleTheme,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <Icon icon={ArrowRightOnRectangleIcon} size="sm" />,
      onClick: onLogout,
    },
  ];

  return (
    <div className="mobile-more-menu">
      <MoreMenu
        label="Navigation options"
        size="sm"
        presentation="adaptive"
        items={mobileMenuItems}
      />
    </div>
  );
}
