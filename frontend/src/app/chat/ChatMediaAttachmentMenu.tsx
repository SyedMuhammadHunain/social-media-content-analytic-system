// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chat Media & Attachment Picker Menu

'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Badge } from '@astryxdesign/core/Badge';
import { PRESET_GIFS, GIF_CATEGORIES } from '../feed/presetGifs';
import { PlusNavIcon } from '../feed/astryxMobileIcons';
import type { ChatMediaAttachment } from '../../types/chat';

const QUICK_EMOJIS = [
  '😀', '😂', '🔥', '❤️', '🚀', '✨', '🎉', '👍',
  '🙌', '💡', '💯', '😍', '👏', '😎', '🥳', '💪',
  '⭐', '🤝', '🤩', '🎯', '⚡', '☕', '👀', '💬',
];

interface ChatMediaAttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachMedia: (attachment: ChatMediaAttachment) => void;
  onInsertEmoji: (emoji: string) => void;
}

type MenuTab = 'menu' | 'emoji' | 'gif';

export function ChatMediaAttachmentMenu({
  isOpen,
  onClose,
  onAttachMedia,
  onInsertEmoji,
}: ChatMediaAttachmentMenuProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>('menu');
  const [gifQuery, setGifQuery] = useState('');
  const [selectedGifCategory, setSelectedGifCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);

    onAttachMedia({
      type: isVideo ? 'video' : 'image',
      url: previewUrl,
      name: file.name,
    });
    onClose();
  };

  const filteredGifs = PRESET_GIFS.filter((gif) => {
    const matchesCat =
      selectedGifCategory === 'All' ||
      gif.category.toLowerCase() === selectedGifCategory.toLowerCase();
    const matchesQuery =
      !gifQuery.trim() ||
      gif.label.toLowerCase().includes(gifQuery.toLowerCase()) ||
      gif.tags.some((t) => t.toLowerCase().includes(gifQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div
      data-testid="chat-media-attachment-popover"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: 12,
        zIndex: 50,
        width: 320,
        maxWidth: 'calc(100vw - 32px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Card
        padding={3}
        style={{
          backgroundColor: 'var(--color-background-surface, #1e1e1e)',
          border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: 12,
        }}
      >
        <VStack gap={2}>
          {/* Header Bar */}
          <HStack align="center" justify="between">
            <HStack gap={1} align="center">
              {activeTab !== 'menu' && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  label="Back to menu"
                  onClick={() => setActiveTab('menu')}
                  icon={<Icon icon="chevronLeft" size="sm" />}
                />
              )}
              <Text weight="bold" size="sm">
                {activeTab === 'menu' && 'Add to Message'}
                {activeTab === 'emoji' && 'Choose Emoji'}
                {activeTab === 'gif' && 'Choose Animated GIF'}
              </Text>
            </HStack>

            <IconButton
              variant="ghost"
              size="sm"
              label="Close"
              onClick={onClose}
              icon={<Icon icon="close" size="sm" />}
            />
          </HStack>

          {/* 1. Main Action Menu */}
          {activeTab === 'menu' && (
            <VStack gap={1} style={{ marginTop: 4 }}>
              <Button
                label="Photo or Video"
                variant="secondary"
                size="sm"
                data-testid="chat-action-photos"
                onClick={() => fileInputRef.current?.click()}
                icon={<Icon icon={PlusNavIcon} size="sm" />}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              />

              <Button
                label="Animated GIF"
                variant="secondary"
                size="sm"
                data-testid="chat-action-gif"
                onClick={() => setActiveTab('gif')}
                endContent={<Badge variant="neutral" label="GIF" />}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              />

              <Button
                label="Insert Emoji"
                variant="secondary"
                size="sm"
                data-testid="chat-action-emoji"
                onClick={() => setActiveTab('emoji')}
                endContent={<span style={{ fontSize: 16 }}>😀</span>}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              />
            </VStack>
          )}

          {/* 2. Emoji Picker */}
          {activeTab === 'emoji' && (
            <div
              data-testid="chat-emoji-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 6,
                maxHeight: 180,
                overflowY: 'auto',
                padding: '4px 0',
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  data-testid={`chat-emoji-btn-${emoji}`}
                  onClick={() => {
                    onInsertEmoji(emoji);
                    onClose();
                  }}
                  style={{
                    fontSize: 20,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    padding: 4,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* 3. GIF Picker */}
          {activeTab === 'gif' && (
            <VStack gap={2}>
              <TextInput
                label="Search GIFs"
                isLabelHidden
                value={gifQuery}
                placeholder="Search GIFs..."
                onChange={setGifQuery}
                startIcon={<Icon icon="search" size="sm" />}
              />

              <HStack gap={1} style={{ overflowX: 'auto', paddingBottom: 4 }}>
                {['All', ...GIF_CATEGORIES].map((cat) => (
                  <Button
                    key={cat}
                    label={cat}
                    variant={selectedGifCategory === cat ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedGifCategory(cat)}
                  />
                ))}
              </HStack>

              <div
                data-testid="chat-gif-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 6,
                  maxHeight: 180,
                  overflowY: 'auto',
                }}
              >
                {filteredGifs.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    data-testid={`chat-gif-item-${gif.id}`}
                    onClick={() => {
                      onAttachMedia({
                        type: 'gif',
                        url: gif.url,
                        name: gif.label,
                      });
                      onClose();
                    }}
                    style={{
                      border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: 6,
                      overflow: 'hidden',
                      padding: 0,
                      background: '#000',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={gif.url}
                      alt={gif.label}
                      style={{ width: '100%', height: 75, objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                ))}
              </div>
            </VStack>
          )}
        </VStack>
      </Card>
    </div>
  );
}

export default ChatMediaAttachmentMenu;
