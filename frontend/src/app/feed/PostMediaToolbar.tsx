// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Toolbar (Media, GIF, Emoji)

'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';

const MediaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={20}
    height={20}
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const GifIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={20}
    height={20}
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="4" />
    <path d="M9 10H6a1 1 0 00-1 1v2a1 1 0 001 1h3v-2H7" />
    <path d="M12 10v4" />
    <path d="M15 14v-4h3" />
    <path d="M15 12h2" />
  </svg>
);

const EmojiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={20}
    height={20}
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M8 14.5c1.2 1.5 2.8 2 4 2s2.8-.5 4-2" />
  </svg>
);

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

export interface PostMediaToolbarProps {
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (gifUrl: string) => void;
  disabled?: boolean;
}

export function PostMediaToolbar({
  onFileSelect,
  onSelectEmoji,
  onSelectGif,
  disabled = false,
}: PostMediaToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePicker, setActivePicker] = useState<'none' | 'emoji' | 'gif'>('none');

  const handleMediaClick = () => {
    setActivePicker('none');
    fileInputRef.current?.click();
  };

  const toggleEmojiPicker = () => {
    setActivePicker((prev) => (prev === 'emoji' ? 'none' : 'emoji'));
  };

  const toggleGifPicker = () => {
    setActivePicker((prev) => (prev === 'gif' ? 'none' : 'gif'));
  };

  return (
    <div data-testid="post-media-toolbar" style={{ width: '100%' }}>
      <VStack gap={2} style={{ width: '100%', position: 'relative' }}>
        <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={onFileSelect}
        data-testid="post-media-file-input"
        disabled={disabled}
      />

      <HStack gap={1} vAlign="center">
        <IconButton
          data-testid="toolbar-media-btn"
          size="sm"
          variant="ghost"
          label="Attach photo or video"
          icon={<Icon icon={MediaIcon} size="sm" />}
          onClick={handleMediaClick}
          isDisabled={disabled}
        />

        <IconButton
          data-testid="toolbar-gif-btn"
          size="sm"
          variant={activePicker === 'gif' ? 'secondary' : 'ghost'}
          label="Choose a GIF"
          icon={<Icon icon={GifIcon} size="sm" />}
          onClick={toggleGifPicker}
          isDisabled={disabled}
        />

        <IconButton
          data-testid="toolbar-emoji-btn"
          size="sm"
          variant={activePicker === 'emoji' ? 'secondary' : 'ghost'}
          label="Insert emoji"
          icon={<Icon icon={EmojiIcon} size="sm" />}
          onClick={toggleEmojiPicker}
          isDisabled={disabled}
        />
      </HStack>

      {/* Inline Emoji Popover Picker */}
      {activePicker === 'emoji' && (
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
                    onClick={() => {
                      onSelectEmoji(emoji);
                      setActivePicker('none');
                    }}
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
      )}

      {/* Inline GIF Popover Picker */}
      {activePicker === 'gif' && (
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
                    onClick={() => {
                      onSelectGif(gif.url);
                      setActivePicker('none');
                    }}
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
      )}
    </VStack>
  </div>
);
}

export default PostMediaToolbar;
