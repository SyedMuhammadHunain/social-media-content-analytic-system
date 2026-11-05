// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Picker Popovers (Emoji & GIF)

'use client';

import { VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';

const POPULAR_EMOJIS = [
  '😀', '😂', '🔥', '❤️', '🚀', '✨', '🎉', '👍',
  '🙌', '💡', '💯', '😍', '👏', '😎', '🥳', '💪',
  '⭐', '🤝', '🤩', '🎯', '⚡', '☕', '👀', '💬',
];

const PRESET_GIFS = [
  {
    id: 'gif-1',
    label: 'Celebration',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=480&auto=format&fit=crop&q=80',
  },
  {
    id: 'gif-2',
    label: 'Mind Blown',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=480&auto=format&fit=crop&q=80',
  },
  {
    id: 'gif-3',
    label: 'Applause',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=480&auto=format&fit=crop&q=80',
  },
  {
    id: 'gif-4',
    label: 'Thumbs Up',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&auto=format&fit=crop&q=80',
  },
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
        <VStack gap={2}>
          <Text type="supporting" color="secondary" weight="semibold">
            Trending Reactions
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
              width: '100%',
            }}
          >
            {PRESET_GIFS.map((gif) => (
              <div
                key={gif.id}
                onClick={() => onSelectGif(gif.url)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
                  position: 'relative',
                  height: 80,
                }}
              >
                <img
                  src={gif.url}
                  alt={gif.label}
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
                    background: 'rgba(0,0,0,0.65)',
                  }}
                >
                  <Text type="supporting" size="sm" color="primary">
                    {gif.label}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </VStack>
      </Card>
    </div>
  );
}
