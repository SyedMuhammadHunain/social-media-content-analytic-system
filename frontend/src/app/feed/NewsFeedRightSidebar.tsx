// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Right Sidebar Component (refine_3_ui)

'use client';

import type { SuggestedCreator } from '../../types/social.ts';
import type { SearchableUser } from '../../utils/userSearchIndex.ts';
import { WhoToFollowCard } from './WhoToFollowCard.tsx';
import { SidebarSearchBox } from './SidebarSearchBox.tsx';

export interface NewsFeedRightSidebarProps {
  activeHashtag?: string;
  suggestedCreators: SuggestedCreator[];
  searchableUsers?: SearchableUser[];
  currentUserId?: string;
  onSelectHashtag?: (tag: string) => void;
  onToggleFollow: (userId: string) => void;
  onViewProfile?: (creator: SuggestedCreator | SearchableUser | any) => void;
}

export function NewsFeedRightSidebar({
  suggestedCreators,
  searchableUsers,
  currentUserId,
  onToggleFollow,
  onViewProfile,
}: NewsFeedRightSidebarProps) {
  return (
    <aside className="newsfeed-right-sidebar" data-testid="newsfeed-right-rail">
      <SidebarSearchBox
        users={searchableUsers}
        currentUserId={currentUserId}
        onSelectUser={onViewProfile}
      />
      <WhoToFollowCard
        creators={suggestedCreators}
        onToggleFollow={onToggleFollow}
        onViewProfile={onViewProfile}
      />
    </aside>
  );
}

export default NewsFeedRightSidebar;
