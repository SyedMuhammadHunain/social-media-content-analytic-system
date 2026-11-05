// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Composer Form

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { TextArea } from '@astryxdesign/core/TextArea';
import type { User } from '../../types/social.ts';
import { PostMediaToolbar } from './PostMediaToolbar.tsx';
import { PostMediaDropzone } from './PostMediaDropzone.tsx';

interface PostComposerFormProps {
  currentUser: User;
  text: string;
  setText: (text: string) => void;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  formatWarning: string | null;
  isUploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (gifUrl: string) => void;
}

export function PostComposerForm({
  currentUser,
  text,
  setText,
  mediaUrl,
  mediaType,
  formatWarning,
  isUploading,
  onFileSelect,
  onRemoveMedia,
  onSelectEmoji,
  onSelectGif,
}: PostComposerFormProps) {
  return (
    <HStack gap={3} align="start" style={{ width: '100%' }}>
      <Avatar
        size="md"
        src={currentUser.avatarUrl || undefined}
        name={currentUser.name}
      />

      <VStack gap={3} style={{ flex: 1, minWidth: 0 }}>
        <Text weight="semibold" type="body">
          {currentUser.username ? `${currentUser.username}` : currentUser.name}
        </Text>

        <TextArea
          label="What's new?"
          isLabelHidden
          placeholder="What's new?"
          rows={4}
          value={text}
          onChange={setText}
          data-testid="modal-post-textarea"
        />

        <PostMediaDropzone
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          formatWarning={formatWarning}
          onRemoveMedia={onRemoveMedia}
        />

        <PostMediaToolbar
          onFileSelect={onFileSelect}
          onSelectEmoji={onSelectEmoji}
          onSelectGif={onSelectGif}
          disabled={isUploading}
        />
      </VStack>
    </HStack>
  );
}
