// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Edit Modal (PDF Section 4.1.ii)

'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

import type { Post, UpdatePostInput } from '../../types/social';
import { PostEditFormBody } from './PostEditFormBody.tsx';

export interface PostEditModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdatePostInput) => void;
}

function parseHashtags(rawTags: string): string[] {
  return rawTags
    .split(' ')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));
}

export const PostEditModal: FC<PostEditModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState<string>(post.text ?? post.description ?? '');
  const [mediaUrl, setMediaUrl] = useState<string>(post.mediaUrls?.[0] ?? '');
  const [hashtagsRaw, setHashtagsRaw] = useState<string>(post.hashtags.join(' '));

  if (!isOpen) return null;

  const handleSave = () => {
    const domTextarea = document.querySelector('[data-testid="post-edit-text-input"] textarea') as HTMLTextAreaElement | null;
    const effectiveText = domTextarea?.value ?? text;

    const domMedia = document.querySelector('[data-testid="post-edit-media-input"] input') as HTMLInputElement | null;
    const effectiveMedia = domMedia?.value ?? mediaUrl;

    const domTags = document.querySelector('[data-testid="post-edit-hashtags-input"] input') as HTMLInputElement | null;
    const effectiveTags = domTags?.value ?? hashtagsRaw;

    onSave({
      text: effectiveText.trim(),
      description: effectiveText.trim(),
      mediaUrls: effectiveMedia.trim().length > 0 ? [effectiveMedia.trim()] : undefined,
      hashtags: parseHashtags(effectiveTags),
    });
    onClose();
  };

  return (
    <div
      data-testid="post-edit-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ maxWidth: 580, width: '100%' }}>
        <Card padding={6}>
          <VStack gap={4}>
            <HStack hAlign="between" vAlign="center">
              <VStack gap={0}>
                <Heading level={3}>Edit Post</Heading>
                <Text type="supporting" color="secondary">
                  Update text content, attached media, and categorization tags.
                </Text>
              </VStack>
              <Button
                label="Close modal"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<Icon icon={XMarkIcon} size="sm" />}
                onClick={onClose}
              />
            </HStack>

            <Divider />

            <PostEditFormBody
              text={text}
              setText={setText}
              mediaUrl={mediaUrl}
              setMediaUrl={setMediaUrl}
              hashtagsRaw={hashtagsRaw}
              setHashtagsRaw={setHashtagsRaw}
            />

            <Divider />

            <HStack hAlign="end" gap={3}>
              <Button
                data-testid="post-edit-cancel-btn"
                label="Cancel"
                variant="secondary"
                size="md"
                onClick={onClose}
              />
              <Button
                data-testid="post-edit-save-btn"
                label="Save Changes"
                variant="primary"
                size="md"
                icon={<Icon icon={CheckIcon} size="xsm" />}
                onClick={handleSave}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
};

export default PostEditModal;
