// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Left Sidebar Component

'use client';

import type { UserProfile, FeedFilterType } from '../../types/social.ts';
import { UserProfileCard } from '../../components/profile/UserProfileCard.tsx';
import { FeedShortcutsCard } from './FeedShortcutsCard.tsx';

interface NewsFeedLeftSidebarProps {
  user: UserProfile;
  activeFilterType: FeedFilterType;
  savedCount: number;
  onOpenProfile: () => void;
  onSelectShortcut: (type: FeedFilterType) => void;
  onNavigateAnalytics?: () => void;
}

export function NewsFeedLeftSidebar({
  user,
  activeFilterType,
  savedCount,
  onOpenProfile,
  onSelectShortcut,
  onNavigateAnalytics,
}: NewsFeedLeftSidebarProps) {
  return (
    <aside className="newsfeed-fixed-sidebar" data-testid="newsfeed-left-rail">
      <UserProfileCard
        user={user}
        onOpenProfile={onOpenProfile}
      />
      <FeedShortcutsCard
        activeFilterType={activeFilterType}
        savedCount={savedCount}
        followerCount={user.followerCount}
        onSelectShortcut={onSelectShortcut}
        onNavigateAnalytics={onNavigateAnalytics}
      />
    </aside>
  );
}

export default NewsFeedLeftSidebar;
