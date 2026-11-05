// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Toolbar (Media, GIF, Emoji)

'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import {
  EmojiPickerPopover,
  GifPickerPopover,
} from './MediaPickerPopovers.tsx';

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

        {activePicker === 'emoji' && (
          <EmojiPickerPopover
            onSelectEmoji={(emoji) => {
              onSelectEmoji(emoji);
              setActivePicker('none');
            }}
          />
        )}

        {activePicker === 'gif' && (
          <GifPickerPopover
            onSelectGif={(gifUrl) => {
              onSelectGif(gifUrl);
              setActivePicker('none');
            }}
          />
        )}
      </VStack>
    </div>
  );
}

export default PostMediaToolbar;
