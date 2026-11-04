// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Right Sidebar Component (refine_3_ui)

'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { SuggestedCreator } from '../../types/social.ts';
import { WhoToFollowCard } from './WhoToFollowCard.tsx';

interface NewsFeedRightSidebarProps {
  activeHashtag?: string;
  suggestedCreators: SuggestedCreator[];
  onSelectHashtag?: (tag: string) => void;
  onToggleFollow: (userId: string) => void;
  onViewProfile?: (creator: SuggestedCreator) => void;
}

function SidebarSearchBox() {
  const [query, setQuery] = useState('');

  return (
    <div
      data-testid="sidebar-search-box"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '9999px',
        backgroundColor: 'var(--color-background-surface, #1e1e1e)',
        border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <MagnifyingGlassIcon
        style={{
          width: 18,
          height: 18,
          color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.5))',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        aria-label="Search"
        data-testid="sidebar-search-input"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--color-text-primary, #ffffff)',
          fontSize: '0.9375rem',
          fontFamily: 'inherit',
          padding: 0,
        }}
      />
    </div>
  );
}

export function NewsFeedRightSidebar({
  suggestedCreators,
  onToggleFollow,
  onViewProfile,
}: NewsFeedRightSidebarProps) {
  return (
    <aside className="newsfeed-right-sidebar" data-testid="newsfeed-right-rail">
      <SidebarSearchBox />
      <WhoToFollowCard
        creators={suggestedCreators}
        onToggleFollow={onToggleFollow}
        onViewProfile={onViewProfile}
      />
    </aside>
  );
}

export default NewsFeedRightSidebar;
