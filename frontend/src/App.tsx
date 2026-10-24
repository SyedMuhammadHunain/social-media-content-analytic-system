// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Main App Navigation

'use client';

import { useState } from 'react';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';

import {
  NewspaperIcon,
  ChartBarSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import DashboardTemplate from './app/dashboard/page';
import NewsFeedPage from './app/feed/NewsFeedPage';

type AppTab = 'feed' | 'dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('feed');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-body, #111111)',
        color: 'var(--color-text-primary, #FFFFFF)',
      }}
    >
      {/* Top Application Header Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(27, 27, 27, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 24px' }}>
          <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
            {/* Platform Branding */}
            <HStack gap={3} vAlign="center">
              <Icon icon={SparklesIcon} size="md" style={{ color: '#0171E3' }} />
              <VStack gap={0}>
                <Heading level={3}>Social Media Content Analysis</Heading>
                <Text type="supporting" color="secondary">
                  Meta Astryx • Section 4.1 System Client
                </Text>
              </VStack>
              <Badge variant="neutral" label="500M DAU" />
            </HStack>

            {/* Navigation Tabs */}
            <HStack gap={2} vAlign="center">
              <Button
                label="News Feed"
                variant={activeTab === 'feed' ? 'primary' : 'ghost'}
                size="md"
                icon={<Icon icon={NewspaperIcon} size="sm" />}
                onClick={() => setActiveTab('feed')}
              />
              <Button
                label="Analytics Dashboard"
                variant={activeTab === 'dashboard' ? 'primary' : 'ghost'}
                size="md"
                icon={<Icon icon={ChartBarSquareIcon} size="sm" />}
                onClick={() => setActiveTab('dashboard')}
              />
            </HStack>
          </HStack>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {activeTab === 'feed' ? <NewsFeedPage /> : <DashboardTemplate />}
      </main>
    </div>
  );
}
