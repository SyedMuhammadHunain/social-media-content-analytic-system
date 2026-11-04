// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Threads-Style New Post Modal (refine_2_ui)

'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Divider } from '@astryxdesign/core/Divider';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';

import type { CreatePostInput, PostType, User } from '../../types/social.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { mediaApi } from '../../api/mediaApi.ts';
import { storeMediaBlob } from '../../utils/mediaBlobStore.ts';
import { PostMediaToolbar } from './PostMediaToolbar.tsx';

const CloseXIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={16}
    height={16}
    aria-hidden="true"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreatePost: (post: CreatePostInput) => void;
}

function getMediaBadgeLabel(mediaUrl: string, mediaType: PostType): string {
  if (mediaUrl.includes('blob.core.windows.net')) {
    return 'Uploaded to Azure Blob';
  }
  return mediaType === 'VIDEO' ? 'Video Attached' : 'Photo Attached';
}

export function PostCreateModal({
  isOpen,
  onClose,
  currentUser,
  onCreatePost,
}: PostCreateModalProps) {
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [formatWarning, setFormatWarning] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isValid = text.trim().length > 0 || mediaUrl.length > 0;

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl);
    }

    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|mkv|avi|wmv)$/i.test(file.name);
    const isUnsupportedContainer = /\.(mkv|avi|wmv|flv)$/i.test(file.name);

    if (isUnsupportedContainer) {
      setFormatWarning(
        'Notice: .mkv/.avi video containers are not supported by web browsers. Please use MP4 or WebM.'
      );
    } else {
      setFormatWarning(null);
    }

    const isWebm = /\.webm$/i.test(file.name);
    const isOgg = /\.ogg$/i.test(file.name);
    const contentType =
      file.type && file.type.startsWith('video/')
        ? file.type
        : isWebm
          ? 'video/webm'
          : isOgg
            ? 'video/ogg'
            : isVideo
              ? 'video/mp4'
              : (file.type || 'image/jpeg');

    const typedBlob = file.slice(0, file.size, contentType);
    const localUrl = URL.createObjectURL(typedBlob);
    const generatedMediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');
    setMediaUrl(localUrl);
    setMediaId(generatedMediaId);
    storeMediaBlob(generatedMediaId, typedBlob).catch(() => {});

    e.target.value = '';

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
    setMediaId('');
    setMediaType('IMAGE');
    setFormatWarning(null);
  };

  const handleSubmit = () => {
    if (!isValid || isUploading) return;

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
      mediaId: mediaId || undefined,
      hashtags,
    });

    setText('');
    setMediaUrl('');
    setMediaId('');
    setMediaType('IMAGE');
    setFormatWarning(null);
    onClose();
  };

  const handleCancel = () => {
    handleRemoveMedia();
    setText('');
    onClose();
  };

  return (
    <div
      data-testid="post-create-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card padding={5} style={{ borderRadius: 16 }}>
          <VStack gap={4} align="stretch">
            {/* Header: Cancel on left, "New Post" in center, no icons on right */}
            <HStack hAlign="between" vAlign="center">
              <Button
                data-testid="modal-cancel-btn"
                label="Cancel"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              />
              <Heading level={4}>New Post</Heading>
              {/* Invisible spacer balancing the Cancel button width */}
              <div style={{ width: 64 }} aria-hidden="true" />
            </HStack>

            <Divider />

            {/* Body: Avatar + Username + Multiline Input */}
            <HStack gap={3} align="start" style={{ width: '100%' }}>
              <Avatar
                size="md"
                src={currentUser.avatarUrl}
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

                {/* Media Attachment Preview */}
                {mediaUrl && (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
                      maxHeight: 280,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    {mediaType === 'VIDEO' ? (
                      <video
                        src={mediaUrl}
                        controls
                        style={{
                          width: '100%',
                          maxHeight: 280,
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Attached media"
                        style={{
                          width: '100%',
                          maxHeight: 280,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                      }}
                    >
                      <IconButton
                        label="Remove attachment"
                        size="sm"
                        variant="secondary"
                        icon={<Icon icon={CloseXIcon} size="xsm" />}
                        onClick={handleRemoveMedia}
                      />
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        zIndex: 2,
                      }}
                    >
                      <Badge
                        variant="info"
                        label={getMediaBadgeLabel(mediaUrl, mediaType)}
                      />
                    </div>
                  </div>
                )}

                {formatWarning && (
                  <Text type="supporting" color="secondary" style={{ color: 'var(--color-warning, #f59e0b)' }}>
                    {formatWarning}
                  </Text>
                )}

                {/* Action Toolbar: Media, GIF, Emoji */}
                <PostMediaToolbar
                  onFileSelect={handleFileSelect}
                  onSelectEmoji={(emoji) => setText((prev) => prev + emoji)}
                  onSelectGif={(gifUrl) => {
                    setMediaUrl(gifUrl);
                    setMediaType('IMAGE');
                  }}
                  disabled={isUploading}
                />
              </VStack>
            </HStack>

            <Divider />

            {/* Footer: No post options on left, Post button on right */}
            <HStack hAlign="between" vAlign="center">
              <div aria-hidden="true" />
              <Button
                data-testid="modal-post-submit-btn"
                label="Post"
                variant="primary"
                size="md"
                isDisabled={!isValid || isUploading}
                isLoading={isUploading}
                onClick={handleSubmit}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
}

export default PostCreateModal;
