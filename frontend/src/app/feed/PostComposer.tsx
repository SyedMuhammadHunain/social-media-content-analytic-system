// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Composer (PDF Section 4.1.ii)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';

import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

import type { CreatePostInput, PostType, User } from '../../types/social';

interface PostComposerProps {
  currentUser: User;
  onCreatePost: (post: CreatePostInput) => void;
}

export function PostComposer({ currentUser, onCreatePost }: PostComposerProps) {
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagsRaw, setHashtagsRaw] = useState('');

  const isValid =
    postType === 'TEXT'
      ? text.trim().length > 0
      : mediaUrl.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const hashtags = hashtagsRaw
      .split(' ')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));

    onCreatePost({
      type: postType,
      text: postType === 'TEXT' ? text.trim() : undefined,
      description: postType !== 'TEXT' ? description.trim() : undefined,
      mediaUrl: postType !== 'TEXT' ? mediaUrl.trim() : undefined,
      hashtags,
    });

    // Reset inputs
    setText('');
    setMediaUrl('');
    setDescription('');
    setHashtagsRaw('');
  };

  return (
    <Card padding={5}>
      <VStack gap={4}>
        {/* Header: User Avatar & Format Selector */}
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
          <HStack gap={3} vAlign="center">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
            <VStack gap={0}>
              <Heading level={4}>{currentUser.name}</Heading>
              <Text type="supporting" color="secondary">
                @{currentUser.username} • Create New Post
              </Text>
            </VStack>
          </HStack>

          {/* Post Format Selector */}
          <HStack gap={2} vAlign="center">
            <Button
              label="Text Post"
              variant={postType === 'TEXT' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Icon icon={DocumentTextIcon} size="xsm" />}
              onClick={() => setPostType('TEXT')}
            />
            <Button
              label="Image Post"
              variant={postType === 'IMAGE' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Icon icon={PhotoIcon} size="xsm" />}
              onClick={() => setPostType('IMAGE')}
            />
            <Button
              label="Video Post"
              variant={postType === 'VIDEO' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Icon icon={VideoCameraIcon} size="xsm" />}
              onClick={() => setPostType('VIDEO')}
            />
          </HStack>
        </HStack>

        <Divider />

        {/* Dynamic Fields by Format */}
        {postType === 'TEXT' ? (
          <TextArea
            label="What's happening?"
            isLabelHidden
            placeholder="Share your thoughts, architectural insights, or questions with your followers..."
            value={text}
            onChange={(val: string) => setText(val)}
            rows={4}
          />
        ) : (
          <VStack gap={3}>
            <TextInput
              label={postType === 'IMAGE' ? 'Image Media URL (S3 / Pre-Signed)' : 'Video Stream URL (S3 / Pre-Signed)'}
              placeholder={
                postType === 'IMAGE'
                  ? 'https://images.unsplash.com/... or S3 object URL'
                  : 'https://...mp4 or S3 video URL'
              }
              value={mediaUrl}
              onChange={(val: string) => setMediaUrl(val)}
            />
            <TextArea
              label="Caption / Description"
              isLabelHidden
              placeholder={`Write a caption for this ${postType.toLowerCase()} post...`}
              value={description}
              onChange={(val: string) => setDescription(val)}
              rows={2}
            />

            {/* Media Preview Box */}
            {mediaUrl.trim().length > 0 && (
              <div
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  maxHeight: 220,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {postType === 'IMAGE' ? (
                  <img
                    src={mediaUrl}
                    alt="Post preview"
                    style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'cover' }}
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <video
                    src={mediaUrl}
                    controls
                    style={{ maxWidth: '100%', maxHeight: 220 }}
                  />
                )}
              </div>
            )}
          </VStack>
        )}

        {/* Hashtags Input */}
        <TextInput
          label="Hashtags (space separated)"
          placeholder="#systemdesign #microservices #nosql"
          value={hashtagsRaw}
          onChange={(val: string) => setHashtagsRaw(val)}
        />

        <Divider />

        {/* Action Footer */}
        <HStack hAlign="between" vAlign="center">
          <Badge
            variant={postType === 'VIDEO' ? 'purple' : postType === 'IMAGE' ? 'teal' : 'neutral'}
            label={`${postType} POST FORMAT`}
          />
          <Button
            label="Publish Post"
            variant="primary"
            size="md"
            isDisabled={!isValid}
            icon={<Icon icon={PaperAirplaneIcon} size="sm" />}
            onClick={handleSubmit}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
