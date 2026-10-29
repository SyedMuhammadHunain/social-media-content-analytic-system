// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Unified Post Composer

'use client';

import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';

import {
  PhotoIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import type { CreatePostInput, PostType, User } from '../../types/social.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { mediaApi } from '../../api/mediaApi.ts';

interface PostComposerProps {
  currentUser: User;
  onCreatePost: (post: CreatePostInput) => void;
}

function getMediaBadgeLabel(mediaUrl: string, mediaType: PostType): string {
  if (mediaUrl.includes('blob.core.windows.net')) {
    return 'Uploaded to Azure Blob';
  }
  return mediaType === 'VIDEO' ? 'Video Attached' : 'Photo Attached';
}

export function PostComposer({ currentUser, onCreatePost }: PostComposerProps) {
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = text.trim().length > 0 || mediaUrl.length > 0;

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }

    const isVideo = file.type.startsWith('video/');
    const localUrl = URL.createObjectURL(file);
    const contentType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');
    setMediaUrl(localUrl);

    // Reset input so re-selecting same file triggers change
    e.target.value = '';

    // Asynchronously generate presigned SAS URL and upload to Azure Blob if online
    try {
      setIsUploading(true);
      const effectiveUserId = normalizeBackendUserId(currentUser.id);
      const presign = await mediaApi.getPresignedUploadUrl({
        userId: effectiveUserId,
        fileName: file.name,
        contentType,
      });

      if (presign && presign.uploadUrl) {
        try {
          await mediaApi.uploadBlob(presign.uploadUrl, file, contentType);
          if (presign.publicBlobUrl) {
            setMediaUrl(presign.publicBlobUrl);
          }
        } catch (uploadErr) {
          console.warn('Azure cloud upload failed, retaining local media preview:', uploadErr);
        }
      }
    } catch {
      // Offline fallback: retain local object preview URL
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    if (mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaUrl('');
  };

  const handleSubmit = () => {
    if (!isValid) return;

    // Automatically parse hashtags from the combined post text
    const matches = text.match(/#[a-zA-Z0-9_\u00c0-\u024e\u1e00-\u1eff]+/g) || [];
    const seen = new Set<string>();
    const hashtags: string[] = [];
    for (const tag of matches) {
      const lower = tag.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        hashtags.push(tag);
      }
    }

    const effectiveType: PostType = mediaUrl.length > 0 ? mediaType : 'TEXT';

    onCreatePost({
      type: effectiveType,
      text: text.trim(),
      description: mediaUrl.length > 0 ? text.trim() : undefined,
      mediaUrl: mediaUrl || undefined,
      hashtags,
    });

    // Reset inputs
    setText('');
    handleRemoveMedia();
  };

  return (
    <Card padding={5}>
      <VStack gap={4}>
        {/* Header: User Avatar & Context */}
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
          <HStack gap={3} vAlign="center">
            <Avatar
              name={currentUser.name}
              src={currentUser.avatarUrl}
              size="md"
            />
            <VStack gap={0}>
              <Heading level={4}>{currentUser.name}</Heading>
              <Text type="supporting" color="secondary">
                @{currentUser.username} • Create Post
              </Text>
            </VStack>
          </HStack>

          {isUploading && (
            <Badge
              variant="blue"
              label="Uploading to Azure..."
            />
          )}
          {!isUploading && mediaUrl.length > 0 && (
            <Badge
              variant={mediaType === 'VIDEO' ? 'purple' : 'teal'}
              label={getMediaBadgeLabel(mediaUrl, mediaType)}
            />
          )}
        </HStack>

        <Divider />

        {/* Unified Text Composer with inline hashtags */}
        <TextArea
          label="What's happening?"
          isLabelHidden
          placeholder="Share your thoughts, architectural insights, #hashtags, or attach media from your PC..."
          value={text}
          onChange={setText}
          rows={3}
        />

        {/* Live Detected Hashtag Previews */}
        {(() => {
          const detected = text.match(/#[a-zA-Z0-9_\u00c0-\u024e\u1e00-\u1eff]+/g);
          if (!detected || detected.length === 0) return null;
          const uniqueTags = Array.from(new Set(detected));
          return (
            <HStack gap={2} wrap="wrap">
              <Text type="supporting" color="secondary">Tags:</Text>
              {uniqueTags.map((tag) => (
                <Badge key={tag} variant="neutral" label={tag} />
              ))}
            </HStack>
          );
        })()}

        {/* Hidden Local File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Inline Media Preview */}
        {mediaUrl.length > 0 && (
          <div
            style={{
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              maxHeight: 260,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {mediaType === 'IMAGE' ? (
              <img
                src={mediaUrl}
                alt="Upload preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 260,
                  objectFit: 'contain',
                }}
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                style={{ maxWidth: '100%', maxHeight: 260 }}
              />
            )}

            {/* Remove Attached Media Button */}
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button
                label="Remove"
                variant="secondary"
                size="sm"
                icon={<Icon icon={XMarkIcon} size="xsm" />}
                onClick={handleRemoveMedia}
              />
            </div>
          </div>
        )}

        <Divider />

        {/* Action Footer */}
        <HStack hAlign="between" vAlign="center">
          <Button
            label={mediaUrl ? 'Change Media' : 'Attach Media'}
            variant="secondary"
            size="sm"
            icon={<Icon icon={PhotoIcon} size="xsm" />}
            onClick={() => fileInputRef.current?.click()}
          />

          <Button
            data-testid="composer-publish-btn"
            label={isUploading ? 'Uploading...' : 'Publish Post'}
            variant="primary"
            size="md"
            isDisabled={!isValid || isUploading}
            icon={<Icon icon={PaperAirplaneIcon} size="sm" />}
            onClick={handleSubmit}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

export default PostComposer;
