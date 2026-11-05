// Copyright (c) Meta Platforms, Inc. and affiliates.
// Astryx Mobile Navigation Left Slide Drawer

import { useState } from 'react';
import { Drawer } from '@astryxdesign/core/Drawer';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import type { UserProfile } from '../../types/social.ts';
import { useAuth } from '../../context/useAuth.ts';
import { AppearanceNavIcon, LogoutNavIcon } from './astryxMobileIcons.tsx';

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onNavigateProfile?: () => void;
}

export function MobileNavigationDrawer({
  isOpen,
  user,
  onClose,
  onNavigateProfile,
}: MobileNavigationDrawerProps) {
  const { logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
    }
    window.dispatchEvent(new CustomEvent('app:set-theme', { detail: nextTheme }));
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Drawer
      data-testid="mobile-navigation-drawer"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="start"
      width={300}
      hasScrim={true}
      label="Mobile Menu"
    >
      <div
        style={{
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-background-body, #111111)',
          color: 'var(--color-text-primary, #FFFFFF)',
        }}
      >
        {/* Header with User Info & Close Button */}
        <HStack hAlign="between" vAlign="center" style={{ width: '100%', marginBottom: 16 }}>
          <div
            data-testid="drawer-user-info"
            onClick={() => {
              onClose();
              onNavigateProfile?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: onNavigateProfile ? 'pointer' : 'default',
            }}
          >
            <img
              src={user.avatarUrl || '/logo.jpeg'}
              alt={user.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.jpeg';
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary, #FFFFFF)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #9CA3AF)' }}>
                @{user.username}
              </span>
            </div>
          </div>

          <IconButton
            data-testid="drawer-close-btn"
            size="sm"
            variant="ghost"
            label="Close"
            icon={<Icon icon="close" size="sm" />}
            onClick={onClose}
          />
        </HStack>

        <Divider />

        {/* Drawer Menu Items */}
        <VStack gap={3} style={{ marginTop: 24, flex: 1 }}>
          {/* Appearance Toggle */}
          <div
            data-testid="drawer-appearance-toggle"
            onClick={handleToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: 'var(--color-background-surface, rgba(255, 255, 255, 0.05))',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon icon={AppearanceNavIcon} size="md" color="secondary" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Appearance</span>
            </div>
            <span
              data-testid="drawer-theme-indicator"
              style={{
                fontSize: '0.8rem',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: 'var(--color-background-body, #111111)',
                color: 'var(--color-text-secondary, #9CA3AF)',
                border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
              }}
            >
              {currentTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>

          {/* Logout Action */}
          <div
            data-testid="drawer-logout-action"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--color-text-error, #EF4444)',
              userSelect: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Icon icon={LogoutNavIcon} size="md" style={{ color: '#EF4444' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Log Out</span>
          </div>
        </VStack>

        {/* App Footer Branding */}
        <div style={{ padding: '16px 0', borderTop: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #9CA3AF)' }}>
            SocialPulse • Astryx Design System
          </span>
        </div>
      </div>
    </Drawer>
  );
}

export default MobileNavigationDrawer;
