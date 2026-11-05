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
import { MediaIcon, GifIcon, EmojiIcon } from './postMediaIcons.tsx';

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
