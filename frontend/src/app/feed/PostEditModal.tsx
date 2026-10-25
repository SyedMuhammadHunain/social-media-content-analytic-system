// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Edit Modal (PDF Section 4.1.ii)

'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

import type { Post, UpdatePostInput } from '../../types/social';

export interface PostEditModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdatePostInput) => void;
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
    const effectiveText = domTextarea?.value !== undefined ? domTextarea.value : text;

    const domMedia = document.querySelector('[data-testid="post-edit-media-input"] input') as HTMLInputElement | null;
    const effectiveMedia = domMedia?.value !== undefined ? domMedia.value : mediaUrl;

    const domTags = document.querySelector('[data-testid="post-edit-hashtags-input"] input') as HTMLInputElement | null;
    const effectiveTags = domTags?.value !== undefined ? domTags.value : hashtagsRaw;

    const hashtags = effectiveTags
      .split(' ')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));

    onSave({
      text: effectiveText.trim(),
      description: effectiveText.trim(),
      mediaUrls: effectiveMedia.trim().length > 0 ? [effectiveMedia.trim()] : undefined,
      hashtags,
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
            {/* Header */}
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

            {/* Post Content */}
            <VStack gap={1}>
              <Text type="label" color="secondary">
                Post Text Content
              </Text>
              <div data-testid="post-edit-text-input">
                <TextArea
                  label="Post Text"
                  isLabelHidden
                  placeholder="What's happening?"
                  value={text}
                  onChange={setText}
                  onInput={(e: FormEvent<HTMLElement>) => {
                    const target = e.target as HTMLTextAreaElement;
                    if (target) setText(target.value);
                  }}
                  rows={4}
                />
              </div>
            </VStack>

            {/* Media URL */}
            <VStack gap={1}>
              <Text type="label" color="secondary">
                Media URL (Optional)
              </Text>
              <div data-testid="post-edit-media-input">
                <TextInput
                  label="Media URL"
                  isLabelHidden
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(val: string) => setMediaUrl(val)}
                  onInput={(e: FormEvent<HTMLElement>) => {
                    const target = e.target as HTMLInputElement;
                    if (target) setMediaUrl(target.value);
                  }}
                />
              </div>
            </VStack>

            {/* Hashtags */}
            <VStack gap={1}>
              <Text type="label" color="secondary">
                Hashtags
              </Text>
              <div data-testid="post-edit-hashtags-input">
                <TextInput
                  label="Hashtags"
                  isLabelHidden
                  placeholder="#metaastryx #systemarchitecture"
                  value={hashtagsRaw}
                  onChange={(val: string) => setHashtagsRaw(val)}
                  onInput={(e: FormEvent<HTMLElement>) => {
                    const target = e.target as HTMLInputElement;
                    if (target) setHashtagsRaw(target.value);
                  }}
                />
              </div>
            </VStack>

            <Divider />

            {/* Action Buttons */}
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
