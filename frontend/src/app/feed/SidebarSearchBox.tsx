// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Sidebar Search Box

'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { matchUsers, type SearchableUser } from '../../utils/userSearchIndex.ts';

export interface SidebarSearchBoxProps {
  users?: SearchableUser[];
  currentUserId?: string;
  onSelectUser?: (user: SearchableUser) => void;
}

interface SearchItemProps {
  user: SearchableUser;
  isSelected: boolean;
  onSelect: (user: SearchableUser) => void;
  onHover: () => void;
}

interface SearchResultsDropdownProps {
  listboxId: string;
  query: string;
  results: SearchableUser[];
  activeIndex: number;
  onSelect: (user: SearchableUser) => void;
  onHoverIndex: (index: number) => void;
}

interface SearchInputBarProps {
  query: string;
  listboxId: string;
  activeOptionId?: string;
  showDropdown: boolean;
  onQueryChange: (val: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

interface SearchKeyNavParams {
  isOpen: boolean;
  resultsLength: number;
  hasQuery: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: (step: 'ArrowDown' | 'ArrowUp') => void;
  onCommit: () => void;
}

function SearchItemAvatar({ user }: { user: SearchableUser }) {
  if (user.avatarUrl) {
    return (
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
    );
  }
  return (
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
  );
}

function SearchResultItem({ user, isSelected, onSelect, onHover }: SearchItemProps) {
  return (
    <div
      id={`search-opt-${user.id}`}
      role="option"
      aria-selected={isSelected}
      data-testid="search-result-item"
      onClick={() => onSelect(user)}
      onMouseEnter={onHover}
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
      <SearchItemAvatar user={user} />
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
          {user.headline && <span> • {user.headline}</span>}
        </div>
      </div>
    </div>
  );
}

function SearchResultsDropdown({
  listboxId,
  query,
  results,
  activeIndex,
  onSelect,
  onHoverIndex,
}: SearchResultsDropdownProps) {
  if (results.length === 0) {
    return (
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
          padding: '16px 20px',
          boxSizing: 'border-box',
          textAlign: 'center',
          color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.5))',
          fontSize: '0.875rem',
        }}
      >
        <span data-testid="search-no-results">
          No users found for &ldquo;{query}&rdquo;
        </span>
      </div>
    );
  }

  return (
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
      {results.map((user, index) => (
        <SearchResultItem
          key={user.id}
          user={user}
          isSelected={index === activeIndex}
          onSelect={onSelect}
          onHover={() => onHoverIndex(index)}
        />
      ))}
    </div>
  );
}

function SearchInputBar({
  query,
  listboxId,
  activeOptionId,
  showDropdown,
  onQueryChange,
  onFocus,
  onKeyDown,
  onClear,
}: SearchInputBarProps) {
  const hasQuery = Boolean(query.trim());
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
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
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
      {hasQuery && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
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
  );
}

function resolveArrowIndex(key: 'ArrowDown' | 'ArrowUp', current: number, total: number): number {
  if (key === 'ArrowDown') {
    return current < total - 1 ? current + 1 : 0;
  }
  return current > 0 ? current - 1 : total - 1;
}

function dispatchSearchKey(
  key: string,
  e: React.KeyboardEvent<HTMLInputElement>,
  params: SearchKeyNavParams
) {
  if (!params.isOpen || params.resultsLength === 0) {
    if (key === 'ArrowDown' && params.hasQuery) {
      params.onOpen();
    }
    return;
  }

  if (key === 'ArrowDown' || key === 'ArrowUp') {
    e.preventDefault();
    params.onNavigate(key);
    return;
  }

  if (key === 'Enter') {
    e.preventDefault();
    params.onCommit();
    return;
  }

  if (key === 'Escape') {
    e.preventDefault();
    params.onClose();
  }
}

export function SidebarSearchBox({ users = [], currentUserId, onSelectUser }: SidebarSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const trimmed = query.trim();
  const results = trimmed ? matchUsers(query, users, currentUserId) : [];

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
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
    dispatchSearchKey(e.key, e, {
      isOpen,
      resultsLength: results.length,
      hasQuery: Boolean(trimmed),
      onOpen: () => setIsOpen(true),
      onClose: () => setIsOpen(false),
      onNavigate: (dir) => setActiveIndex((prev) => resolveArrowIndex(dir, prev, results.length)),
      onCommit: () => {
        const target = activeIndex >= 0 ? results[activeIndex] : results[0];
        if (target) handleSelect(target);
      },
    });
  };

  const activeOptionId = activeIndex >= 0 && results[activeIndex]
    ? `search-opt-${results[activeIndex].id}`
    : undefined;

  const showDropdown = isOpen && Boolean(trimmed);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <SearchInputBar
        query={query}
        listboxId={listboxId}
        activeOptionId={activeOptionId}
        showDropdown={showDropdown}
        onQueryChange={(val) => {
          setQuery(val);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (trimmed) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onClear={() => {
          setQuery('');
          setIsOpen(false);
          setActiveIndex(-1);
        }}
      />
      {showDropdown && (
        <SearchResultsDropdown
          listboxId={listboxId}
          query={trimmed}
          results={results}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          onHoverIndex={setActiveIndex}
        />
      )}
    </div>
  );
}

export default SidebarSearchBox;
