// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Desktop Navigation Tabs

'use client';

import { TopNavItem } from '@astryxdesign/core/TopNav';
import { Icon } from '@astryxdesign/core/Icon';
import { NewspaperIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';

interface DesktopNavTabsProps {
  activeTab: 'feed' | 'dashboard';
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
}

export function DesktopNavTabs({ activeTab, onSelectTab }: DesktopNavTabsProps) {
  return (
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
  );
}
