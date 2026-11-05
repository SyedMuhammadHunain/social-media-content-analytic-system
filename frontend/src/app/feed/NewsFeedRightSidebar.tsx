// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Right Sidebar Component (refine_3_ui)

'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { SuggestedCreator } from '../../types/social.ts';
import { matchUsers, type SearchableUser } from '../../utils/userSearchIndex.ts';
import { WhoToFollowCard } from './WhoToFollowCard.tsx';

export interface NewsFeedRightSidebarProps {
  activeHashtag?: string;
  suggestedCreators: SuggestedCreator[];
  searchableUsers?: SearchableUser[];
  currentUserId?: string;
  onSelectHashtag?: (tag: string) => void;
  onToggleFollow: (userId: string) => void;
  onViewProfile?: (creator: SuggestedCreator | SearchableUser | any) => void;
}

interface SidebarSearchBoxProps {
  users?: SearchableUser[];
  currentUserId?: string;
  onSelectUser?: (user: SearchableUser) => void;
}

function SidebarSearchBox({ users = [], currentUserId, onSelectUser }: SidebarSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const results = query.trim() ? matchUsers(query, users, currentUserId) : [];

  // Click outside listener
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSelect = (user: SearchableUser) => {
    onSelectUser?.(user);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
    >
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
          role="combobox"
          aria-expanded={isOpen && Boolean(query.trim())}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `search-opt-${results[activeIndex].id}`
              : undefined
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search people..."
          aria-label="Search people"
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
        {query.trim() && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setActiveIndex(-1);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.5))',
            }}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div
          id={listboxId}
          role="listbox"
          data-testid="sidebar-search-results"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 60,
            backgroundColor: 'var(--color-background-surface, #1e1e1e)',
            border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            maxHeight: '340px',
            overflowY: 'auto',
            padding: '8px 0',
            boxSizing: 'border-box',
          }}
        >
          {results.length === 0 ? (
            <div
              data-testid="search-no-results"
              style={{
                padding: '16px 20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.5))',
                fontSize: '0.875rem',
              }}
            >
              No users found for &ldquo;{query.trim()}&rdquo;
            </div>
          ) : (
            results.map((user, index) => {
              const isSelected = index === activeIndex;
              return (
                <div
                  key={user.id}
                  id={`search-opt-${user.id}`}
                  role="option"
                  aria-selected={isSelected}
                  data-testid="search-result-item"
                  onClick={() => handleSelect(user)}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? 'var(--color-background-hover, rgba(255, 255, 255, 0.08))'
                      : 'transparent',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-background-subtle, rgba(255, 255, 255, 0.1))',
                        color: 'var(--color-text-primary, #ffffff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: 'var(--color-text-primary, #ffffff)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.5))',
                        fontSize: '0.8125rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      @{user.username}
                      {user.headline && (
                        <span> • {user.headline}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
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
