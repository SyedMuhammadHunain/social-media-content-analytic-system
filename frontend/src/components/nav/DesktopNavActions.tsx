// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Desktop Navigation Actions

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import {
  UsersIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types/social.ts';
import type { DemoUserSummary } from '../../context/auth-context-def.ts';

function UserSwitcherDropdown({
  currentUser,
  demoUsers,
  onSwitchUser,
}: {
  currentUser?: UserProfile | null;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
}) {
  if (!onSwitchUser) return null;
  if (!demoUsers?.length) return null;

  const items = demoUsers.map((u) => ({
    id: `switch-${u.id}`,
    label: `${u.name}${currentUser?.id === u.id ? ' (Active)' : ''}`,
    description: `@${u.username}`,
    icon: <Avatar name={u.name} src={u.avatarUrl} size="sm" />,
    onClick: () => onSwitchUser(u.id),
  }));

  const buttonLabel = currentUser ? currentUser.name.split(' ')[0] : 'Switch User';

  return (
    <div data-testid="nav-user-switcher">
      <DropdownMenu
        button={{
          label: buttonLabel,
          variant: 'secondary',
          size: 'sm',
          icon: <Icon icon={UsersIcon} size="sm" />,
        }}
        items={items}
      />
    </div>
  );
}

function NotificationBellButton({
  isNotificationsOpen,
  setIsNotificationsOpen,
  unreadCount,
}: {
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  unreadCount: number;
}) {
  const badgeLabel = unreadCount > 9 ? '9+' : unreadCount;
  const buttonLabel = `Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`;

  return (
    <div style={{ position: 'relative' }}>
      <Button
        data-testid="nav-notifications-btn"
        label={buttonLabel}
        isIconOnly
        variant={isNotificationsOpen ? 'secondary' : 'ghost'}
        size="sm"
        icon={<Icon icon={BellIcon} size="sm" />}
        onClick={() => setIsNotificationsOpen((prev) => !prev)}
      />
      {unreadCount > 0 && (
        <span
          data-testid="nav-notifications-badge"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '0 5px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          {badgeLabel}
        </span>
      )}
    </div>
  );
}

interface DesktopNavActionsProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  unreadCount: number;
  onOpenNewPost?: () => void;
}

export function DesktopNavActions({
  mode,
  onToggleTheme,
  currentUser,
  onLogout,
  demoUsers,
  onSwitchUser,
  isNotificationsOpen,
  setIsNotificationsOpen,
  unreadCount,
  onOpenNewPost,
}: DesktopNavActionsProps) {
  return (
    <div className="desktop-nav-actions">
      <HStack gap={2} vAlign="center">
        {onOpenNewPost && (
          <Button
            data-testid="nav-new-post-btn"
            variant="primary"
            label="New Post"
            size="sm"
            icon={<Icon icon={PlusIcon} size="sm" />}
            onClick={onOpenNewPost}
          />
        )}

        <UserSwitcherDropdown
          currentUser={currentUser}
          demoUsers={demoUsers}
          onSwitchUser={onSwitchUser}
        />

        <NotificationBellButton
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          unreadCount={unreadCount}
        />

        <Button
          label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          isIconOnly
          variant="ghost"
          size="sm"
          icon={<Icon icon={mode === 'dark' ? SunIcon : MoonIcon} size="sm" />}
          onClick={onToggleTheme}
        />

        <Button
          data-testid="nav-logout-btn"
          variant="secondary"
          label="Logout"
          size="sm"
          icon={<Icon icon={ArrowRightOnRectangleIcon} size="sm" />}
          onClick={onLogout}
        />
      </HStack>
    </div>
  );
}
