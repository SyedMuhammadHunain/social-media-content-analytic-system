// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Official Astryx AppTopNav Component

'use client';

import type { FC } from 'react';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
} from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack } from '@astryxdesign/core/Layout';
import type { UserProfile } from '../../types/social';

import {
  SunIcon,
  MoonIcon,
  SparklesIcon,
  NewspaperIcon,
  ChartBarSquareIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export interface AppTopNavProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'feed' | 'dashboard';
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const AppTopNav: FC<AppTopNavProps> = ({
  mode,
  onToggleTheme,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  return (
    <TopNav
      label="Social Media Content Analysis Navigation"
      heading={
        <TopNavHeading
          logo={<Icon icon={SparklesIcon} size="md" style={{ color: '#0171E3' }} />}
          heading="Social Media Content Analysis"
        />
      }
      startContent={
        <>
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
        </>
      }
      endContent={
        <HStack gap={3} vAlign="center">
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
            label="Log Out"
            variant="secondary"
            size="sm"
            icon={<Icon icon={ArrowRightOnRectangleIcon} size="xsm" />}
            onClick={onLogout}
          />
          <Avatar
            name={currentUser?.name || 'Syed Muhammad Hunain'}
            src={currentUser?.avatarUrl}
            size="sm"
          />
        </HStack>
      }
    />
  );
};

export default AppTopNav;
