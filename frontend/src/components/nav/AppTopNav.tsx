// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Application Top Navigation

'use client';

import { useState, type FC } from 'react';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { Avatar } from '@astryxdesign/core/Avatar';
import { HStack } from '@astryxdesign/core/Layout';
import type { UserProfile } from '../../types/social.ts';
import type { DemoUserSummary } from '../../context/auth-context-def.ts';
import { NotificationDrawer } from './NotificationDrawer.tsx';
import { useNotificationPolling } from './useNotificationPolling.ts';
import { DesktopNavTabs } from './DesktopNavTabs.tsx';
import { DesktopNavActions } from './DesktopNavActions.tsx';
import { MobileNavMenu } from './MobileNavMenu.tsx';

export interface AppTopNavProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'feed' | 'dashboard';
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
  onOpenNewPost?: () => void;
}

export const AppTopNav: FC<AppTopNavProps> = ({
  mode,
  onToggleTheme,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  demoUsers,
  onSwitchUser,
  onOpenNewPost,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, handleMarkAsRead, handleMarkAllAsRead, simulateDynamicAlert } =
    useNotificationPolling(currentUser, demoUsers);

  return (
    <>
      <style>{`
        /* Responsive visibility */
        .desktop-nav-items,
        .desktop-nav-actions {
          display: flex;
          align-items: center;
        }

        .mobile-more-menu {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-nav-items,
          .desktop-nav-actions {
            display: none !important;
          }

          .mobile-more-menu {
            display: flex !important;
            align-items: center;
          }
        }
      `}</style>

      <TopNav
        label="Social Media Content Analysis Navigation"
        heading={
          <TopNavHeading
            logo={
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            }
            heading={isMobile ? 'SMCAS' : 'Social Media Content Analysis'}
          />
        }
        startContent={
          <DesktopNavTabs activeTab={activeTab} onSelectTab={onSelectTab} />
        }
        endContent={
          <HStack gap={2} vAlign="center">
            <DesktopNavActions
              mode={mode}
              onToggleTheme={onToggleTheme}
              currentUser={currentUser}
              onLogout={onLogout}
              demoUsers={demoUsers}
              onSwitchUser={onSwitchUser}
              isNotificationsOpen={isNotificationsOpen}
              setIsNotificationsOpen={setIsNotificationsOpen}
              unreadCount={unreadCount}
              onOpenNewPost={onOpenNewPost}
            />

            <MobileNavMenu
              mode={mode}
              onToggleTheme={onToggleTheme}
              onSelectTab={onSelectTab}
              currentUser={currentUser}
              onLogout={onLogout}
              demoUsers={demoUsers}
              onSwitchUser={onSwitchUser}
              setIsNotificationsOpen={setIsNotificationsOpen}
              unreadCount={unreadCount}
              onOpenNewPost={onOpenNewPost}
            />

            <Avatar
              name={currentUser?.name || 'Syed Muhammad Hunain'}
              src={currentUser?.avatarUrl}
              size="sm"
            />
          </HStack>
        }
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSimulateNotification={simulateDynamicAlert}
      />
    </>
  );
};

export default AppTopNav;
