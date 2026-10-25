// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Official Astryx AppTopNav Component

'use client';

import type { FC } from 'react';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuItem,
  TopNavMegaMenuFeaturedCard,
} from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack } from '@astryxdesign/core/Layout';

import {
  SunIcon,
  MoonIcon,
  SparklesIcon,
  NewspaperIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';

export interface AppTopNavProps {
  mode: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'feed' | 'dashboard';
  onSelectTab: (tab: 'feed' | 'dashboard') => void;
}

export const AppTopNav: FC<AppTopNavProps> = ({
  mode,
  onToggleTheme,
  activeTab,
  onSelectTab,
}) => {
  return (
    <TopNav
      label="Social Media Content Analysis Navigation"
      heading={
        <TopNavHeading
          logo={<Icon icon={SparklesIcon} size="md" style={{ color: '#0171E3' }} />}
          heading="Social Media Content Analysis"
          subheading="Meta Astryx • Section 4.1 System Client"
          headerEndContent={<Badge variant="neutral" label="500M DAU" />}
        />
      }
      startContent={
        <>
          <TopNavItem
            label="News Feed"
            isSelected={activeTab === 'feed'}
            onClick={() => onSelectTab('feed')}
            icon={<Icon icon={NewspaperIcon} size="sm" />}
          />
          <TopNavItem
            label="Analytics Dashboard"
            isSelected={activeTab === 'dashboard'}
            onClick={() => onSelectTab('dashboard')}
            icon={<Icon icon={ChartBarSquareIcon} size="sm" />}
          />
          <TopNavMegaMenu
            label="Explore Platform"
            items={
              <>
                <TopNavMegaMenuItem
                  title="Real-Time Feed"
                  description="Chronological media stream with sub-second fan-out"
                  icon={<Icon icon={NewspaperIcon} size="md" />}
                  onClick={() => onSelectTab('feed')}
                />
                <TopNavMegaMenuItem
                  title="Creator Analytics"
                  description="Audience growth, reactions, and engagement metrics"
                  icon={<Icon icon={ChartBarSquareIcon} size="md" />}
                  onClick={() => onSelectTab('dashboard')}
                />
              </>
            }
            featured={
              <TopNavMegaMenuFeaturedCard
                title="500M DAU Architecture"
                description="Designed for 2.5B daily interactions and 216 TB/day storage"
                linkLabel="Read System Spec"
                linkHref="#spec"
              />
            }
          />
        </>
      }
      endContent={
        <HStack gap={3} vAlign="center">
          <Button
            label={mode === 'dark' ? 'Light mode' : 'Dark mode'}
            variant="ghost"
            size="sm"
            icon={<Icon icon={mode === 'dark' ? SunIcon : MoonIcon} size="sm" />}
            onClick={onToggleTheme}
          />
          <Avatar name="Syed Muhammad Hunain" size="sm" />
        </HStack>
      }
    />
  );
};

export default AppTopNav;
