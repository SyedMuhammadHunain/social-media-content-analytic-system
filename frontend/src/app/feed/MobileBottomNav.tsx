// Copyright (c) Meta Platforms, Inc. and affiliates.
// Astryx Mobile 5-Icon Bottom Navigation Bar

import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SavedNavIcon,
  AnalyticsNavIcon,
  PlusNavIcon,
  NotificationsNavIcon,
  ProfileNavIcon,
} from './astryxMobileIcons.tsx';

export type MobileNavItem = 'saved' | 'analytics' | 'create' | 'notifications' | 'profile';

export interface MobileBottomNavProps {
  activeItem?: MobileNavItem | 'feed';
  unreadCount?: number;
  onSelectSaved: () => void;
  onSelectAnalytics: () => void;
  onSelectCreate: () => void;
  onSelectNotifications: () => void;
  onSelectProfile: () => void;
}

export function MobileBottomNav({
  activeItem,
  unreadCount = 0,
  onSelectSaved,
  onSelectAnalytics,
  onSelectCreate,
  onSelectNotifications,
  onSelectProfile,
}: MobileBottomNavProps) {
  return (
    <nav
      className="mobile-bottom-nav"
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'var(--color-background-body, #111111)',
        borderTop: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
        boxSizing: 'border-box',
        padding: '0 8px',
      }}
    >
      {/* 1. Saved Icon */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton
          data-testid="bottom-nav-saved"
          label="Saved Posts"
          size="md"
          variant={activeItem === 'saved' ? 'secondary' : 'ghost'}
          icon={<Icon icon={SavedNavIcon} size="md" />}
          onClick={onSelectSaved}
        />
      </div>

      {/* 2. Creator Analytics Icon */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton
          data-testid="bottom-nav-analytics"
          label="Creator Analytics"
          size="md"
          variant={activeItem === 'analytics' ? 'secondary' : 'ghost'}
          icon={<Icon icon={AnalyticsNavIcon} size="md" />}
          onClick={onSelectAnalytics}
        />
      </div>

      {/* 3. + Icon at the centre for creating post */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton
          data-testid="bottom-nav-create"
          label="Create Post"
          size="md"
          variant="primary"
          style={{
            borderRadius: '50%',
            width: 44,
            height: 44,
            boxShadow: '0 4px 12px rgba(0, 102, 255, 0.35)',
          }}
          icon={<Icon icon={PlusNavIcon} size="md" />}
          onClick={onSelectCreate}
        />
      </div>

      {/* 4. Notification Icon */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <IconButton
          data-testid="bottom-nav-notifications"
          label="Notifications"
          size="md"
          variant={activeItem === 'notifications' ? 'secondary' : 'ghost'}
          icon={<Icon icon={NotificationsNavIcon} size="md" />}
          onClick={onSelectNotifications}
        />
        {unreadCount > 0 && (
          <span
            data-testid="bottom-nav-unread-badge"
            style={{
              position: 'absolute',
              top: 4,
              right: 'calc(50% - 16px)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* 5. Profile Icon */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton
          data-testid="bottom-nav-profile"
          label="Profile"
          size="md"
          variant={activeItem === 'profile' ? 'secondary' : 'ghost'}
          icon={<Icon icon={ProfileNavIcon} size="md" />}
          onClick={onSelectProfile}
        />
      </div>
    </nav>
  );
}
