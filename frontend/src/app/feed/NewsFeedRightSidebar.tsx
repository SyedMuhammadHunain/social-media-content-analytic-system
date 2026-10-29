// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Right Sidebar Component

'use client';

import type { SuggestedCreator } from '../../types/social.ts';
import { TRENDING_TOPICS } from '../../mock/socialSeedData.ts';
import { TrendingTopicsCard } from './TrendingTopicsCard.tsx';
import { WhoToFollowCard } from './WhoToFollowCard.tsx';
import { PlatformInfoFooter } from './PlatformInfoFooter.tsx';

interface NewsFeedRightSidebarProps {
  activeHashtag?: string;
  suggestedCreators: SuggestedCreator[];
  onSelectHashtag: (tag: string) => void;
  onToggleFollow: (userId: string) => void;
  onViewProfile?: (creator: SuggestedCreator) => void;
}

export function NewsFeedRightSidebar({
  activeHashtag,
  suggestedCreators,
  onSelectHashtag,
  onToggleFollow,
  onViewProfile,
}: NewsFeedRightSidebarProps) {
  return (
    <aside className="newsfeed-right-sidebar" data-testid="newsfeed-right-rail">
      <TrendingTopicsCard
        topics={TRENDING_TOPICS}
        activeHashtag={activeHashtag}
        onSelectHashtag={onSelectHashtag}
      />
      <WhoToFollowCard
        creators={suggestedCreators}
        onToggleFollow={onToggleFollow}
        onViewProfile={onViewProfile}
      />
      <PlatformInfoFooter />
    </aside>
  );
}

export default NewsFeedRightSidebar;
