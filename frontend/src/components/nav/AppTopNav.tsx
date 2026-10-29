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
  onRefreshFeed?: () => void;
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
  onRefreshFeed,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBrandBouncing, setIsBrandBouncing] = useState(false);
  const { notifications, unreadCount, handleMarkAsRead, handleMarkAllAsRead, simulateDynamicAlert } =
    useNotificationPolling(currentUser, demoUsers);

  const handleBrandClick = () => {
    setIsBrandBouncing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onRefreshFeed) {
      onRefreshFeed();
    } else {
      window.dispatchEvent(new CustomEvent('social:refresh-feed'));
    }
    setTimeout(() => setIsBrandBouncing(false), 550);
  };

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

        @keyframes brandBounceAnim {
          0% { transform: scale(1); }
          25% { transform: scale(0.92); }
          50% { transform: scale(1.08); }
          75% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }

        .brand-bouncing {
          animation: brandBounceAnim 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .navbar-brand-clickable {
          cursor: pointer;
          user-select: none;
          transition: opacity 0.15s ease;
          display: inline-flex;
          align-items: center;
        }
        .navbar-brand-clickable:hover {
          opacity: 0.9;
        }
        .navbar-brand-clickable:active {
          opacity: 0.75;
        }
      `}</style>

      <TopNav
        label="Social Media Content Analysis Navigation"
        heading={
          <div
            data-testid="navbar-brand-button"
            className={`navbar-brand-clickable ${isBrandBouncing ? 'brand-bouncing' : ''}`}
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            title="Back to top & refresh feed"
            aria-label="Back to top and refresh feed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBrandClick();
              }
            }}
          >
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
          </div>
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
