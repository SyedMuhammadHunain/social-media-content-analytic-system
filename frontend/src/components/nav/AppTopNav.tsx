'use client';

import { useState, useEffect, type FC } from 'react';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
} from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack } from '@astryxdesign/core/Layout';
import { MoreMenu } from '@astryxdesign/core/MoreMenu';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import type { UserProfile } from '../../types/social.ts';
import type { DemoUserSummary } from '../../context/auth-context-def.ts';
import { notificationsApi, type Notification } from '../../api/notificationsApi.ts';
import { NotificationDrawer } from './NotificationDrawer.tsx';

import {
  SunIcon,
  MoonIcon,
  NewspaperIcon,
  ChartBarSquareIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export interface AppTopNavProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'feed' | 'dashboard';
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
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
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const list = await notificationsApi.getNotifications(currentUser.id);
        if (isMounted) {
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.read).length);
        }
      } catch {
        // Offline fallback
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Offline fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (currentUser?.id) {
      try {
        await notificationsApi.markAllAsRead(currentUser.id);
      } catch {
        // Offline fallback
      }
    }
  };

  const userSwitcherItems = (demoUsers || []).map((u) => ({
    id: `switch-${u.id}`,
    label: `${u.name}${currentUser?.id === u.id ? ' (Active)' : ''}`,
    description: `@${u.username}`,
    icon: <Avatar name={u.name} src={u.avatarUrl} size="sm" />,
    onClick: () => onSwitchUser?.(u.id),
  }));

  const mobileMenuItems = [
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
          <div className="desktop-nav-items">
            <TopNavItem
              data-testid="nav-news-feed"
              href="#feed"
              label="News Feed"
              isSelected={activeTab === 'feed'}
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('feed');
              }}
              icon={<Icon icon={NewspaperIcon} size="sm" />}
            />
            <TopNavItem
              data-testid="nav-analytics-dashboard"
              href="#dashboard"
              label="Analytics Dashboard"
              isSelected={activeTab === 'dashboard'}
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('dashboard');
              }}
              icon={<Icon icon={ChartBarSquareIcon} size="sm" />}
            />
          </div>
        }
        endContent={
          <HStack gap={2} vAlign="center">
            {/* Desktop Actions */}
            <div className="desktop-nav-actions">
              <HStack gap={2} vAlign="center">
                {/* Demo User Switcher Dropdown */}
                {userSwitcherItems.length > 0 && onSwitchUser && (
                  <DropdownMenu
                    data-testid="nav-user-switcher"
                    button={{
                      label: currentUser ? currentUser.name.split(' ')[0] : 'Switch User',
                      variant: 'secondary',
                      size: 'sm',
                      icon: <Icon icon={UsersIcon} size="sm" />,
                    }}
                    items={userSwitcherItems}
                  />
                )}

                {/* Notification Bell Button */}
                <div style={{ position: 'relative' }}>
                  <Button
                    data-testid="nav-notifications-btn"
                    label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
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
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

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

            {/* Mobile Overflow Menu (Astryx MoreMenu) */}
            <div className="mobile-more-menu">
              <MoreMenu
                label="Navigation options"
                size="sm"
                presentation="adaptive"
                items={mobileMenuItems}
              />
            </div>

            {/* User Profile Avatar */}
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
      />
    </>
  );
};

export default AppTopNav;
