// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Picker Popovers (Emoji & GIF)

'use client';

import { useState, useMemo, useDeferredValue } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { PRESET_GIFS, GIF_CATEGORIES } from './presetGifs.ts';

const POPULAR_EMOJIS = [
  '😀', '😂', '🔥', '❤️', '🚀', '✨', '🎉', '👍',
  '🙌', '💡', '💯', '😍', '👏', '😎', '🥳', '💪',
  '⭐', '🤝', '🤩', '🎯', '⚡', '☕', '👀', '💬',
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
}

export function EmojiPickerPopover({ onSelectEmoji }: EmojiPickerPopoverProps) {
  return (
    <div data-testid="emoji-picker-popover" style={{ width: '100%' }}>
      <Card
        padding={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-background-surface, #1e1e1e)',
          border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
          borderRadius: 8,
        }}
      >
        <VStack gap={2}>
          <Text type="supporting" color="secondary" weight="semibold">
            Popular Emojis
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
              gap: 4,
              width: '100%',
            }}
          >
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelectEmoji(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.35rem',
                  padding: '8px 4px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {emoji}
              </button>
            ))}
          </div>
        </VStack>
      </Card>
    </div>
  );
}

interface GifPickerPopoverProps {
  onSelectGif: (gifUrl: string) => void;
}

export function GifPickerPopover({ onSelectGif }: GifPickerPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [customUrl, setCustomUrl] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredGifs = useMemo(() => {
    return PRESET_GIFS.filter((gif) => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        gif.category.toLowerCase() === activeCategory.toLowerCase();

      if (!matchesCategory) return false;

      const q = deferredQuery.trim().toLowerCase();
      if (!q) return true;

      const inLabel = gif.label.toLowerCase().includes(q);
      const inCategory = gif.category.toLowerCase().includes(q);
      const inTags = gif.tags.some((tag) => tag.toLowerCase().includes(q));

      return inLabel || inCategory || inTags;
    });
  }, [deferredQuery, activeCategory]);

  const handleAttachCustomUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      setCustomError('Please enter a valid GIF URL');
      return;
    }
    try {
      const parsed = new URL(trimmed);
      const isHttps = parsed.protocol === 'https:';
      const isDevLocal = (parsed.protocol === 'http:' || parsed.protocol === 'https:') && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
      if (!isHttps && !isDevLocal) {
        setCustomError('Only secure HTTPS URLs are allowed');
        return;
      }
      const isPrivateNetwork = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(parsed.hostname);
      if (isPrivateNetwork) {
        setCustomError('Private network addresses are not allowed');
        return;
      }
      setCustomError(null);
      onSelectGif(trimmed);
    } catch {
      setCustomError('Invalid URL format');
    }
  };

  return (
    <div data-testid="gif-picker-popover" style={{ width: '100%' }}>
      <Card
        padding={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-background-surface, #1e1e1e)',
          border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
          borderRadius: 8,
        }}
      >
        <VStack gap={3}>
          {/* Header */}
          <HStack hAlign="between" vAlign="center">
            <Text type="supporting" color="secondary" weight="semibold">
              Search & Select Animated GIFs
            </Text>
            <Text type="supporting" size="sm" color="secondary">
              {filteredGifs.length} results
            </Text>
          </HStack>

          {/* Search Input */}
          <TextInput
            data-testid="gif-search-input"
            label="Search GIFs"
            isLabelHidden
            placeholder="Search animated GIFs (e.g. clap, dance, fire)..."
            startIcon={<Icon icon="search" size="sm" />}
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            hasClear
          />

          {/* Category Quick Filters */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 2,
            }}
          >
            {GIF_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  data-testid={`gif-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--astryx-color-primary, #1877F2)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary, #b0b3b8)',
                    border: 'none',
                    borderRadius: 16,
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* GIF Grid */}
          {filteredGifs.length > 0 ? (
            <div
              data-testid="gif-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 8,
                maxHeight: 240,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                paddingRight: 2,
              }}
            >
              {filteredGifs.map((gif) => (
                <div
                  key={gif.id}
                  data-testid={`gif-item-${gif.id}`}
                  onClick={() => onSelectGif(gif.url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectGif(gif.url);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
                    position: 'relative',
                    height: 84,
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    transition: 'transform 0.1s ease, border-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--astryx-color-primary, #1877F2)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle, rgba(255, 255, 255, 0.1))';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={gif.url}
                    alt={gif.label}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '2px 6px',
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <Text type="supporting" size="sm" color="primary">
                      {gif.label}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              data-testid="gif-empty-results"
              style={{
                padding: '20px 12px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 6,
              }}
            >
              <Text type="supporting" color="secondary">
                No GIFs found matching &ldquo;{searchQuery}&rdquo;.
              </Text>
            </div>
          )}

          {/* Custom GIF URL Attachment */}
          <VStack gap={1} style={{ borderTop: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))', paddingTop: 8 }}>
            <Text type="supporting" size="sm" color="secondary">
              Or paste direct animated GIF link:
            </Text>
            <HStack gap={2} vAlign="center">
              <div style={{ flex: 1 }}>
                <TextInput
                  data-testid="custom-gif-url-input"
                  label="Direct GIF URL"
                  isLabelHidden
                  placeholder="https://example.com/reaction.gif"
                  value={customUrl}
                  onChange={(val) => {
                    setCustomUrl(val);
                    if (customError) setCustomError(null);
                  }}
                  onEnter={handleAttachCustomUrl}
                />
              </div>
              <Button
                data-testid="attach-custom-gif-btn"
                label="Attach"
                size="md"
                variant="primary"
                onClick={handleAttachCustomUrl}
              />
            </HStack>
            {customError && (
              <Text type="supporting" size="sm" style={{ color: 'var(--color-critical, #EF4444)' }}>
                {customError}
              </Text>
            )}
          </VStack>
        </VStack>
      </Card>
    </div>
  );
}
