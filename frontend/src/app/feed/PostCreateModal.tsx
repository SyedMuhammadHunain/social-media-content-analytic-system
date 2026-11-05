// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Threads-Style New Post Modal (refine_2_ui)

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';

import type { CreatePostInput, PostType, User } from '../../types/social.ts';
import { usePostMediaUpload } from './usePostMediaUpload.ts';
import { PostComposerForm } from './PostComposerForm.tsx';

export interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreatePost: (post: CreatePostInput) => void;
}

function extractHashtags(content: string): string[] {
  const matches = content.match(/#[a-zA-Z0-9_\u00c0-\u024e\u1e00-\u1eff]+/g) || [];
  const seen = new Set<string>();
  const hashtags: string[] = [];
  for (const tag of matches) {
    const lower = tag.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      hashtags.push(tag);
    }
  }
  return hashtags;
}

export function PostCreateModal({
  isOpen,
  onClose,
  currentUser,
  onCreatePost,
}: PostCreateModalProps) {
  const [text, setText] = useState('');
  const {
    mediaUrl,
    setMediaUrl,
    mediaId,
    mediaType,
    setMediaType,
    formatWarning,
    isUploading,
    handleFileSelect,
    handleRemoveMedia,
    resetMediaState,
  } = usePostMediaUpload(currentUser?.id);

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

  const handleSubmit = () => {
    if (!isValid || isUploading) return;

    const hashtags = extractHashtags(text);
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
    resetMediaState();
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
            <HStack hAlign="between" vAlign="center">
              <Button
                data-testid="modal-cancel-btn"
                label="Cancel"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              />
              <Heading level={4}>New Post</Heading>
              <div style={{ width: 64 }} aria-hidden="true" />
            </HStack>

            <Divider />

            <PostComposerForm
              currentUser={currentUser}
              text={text}
              setText={setText}
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              formatWarning={formatWarning}
              isUploading={isUploading}
              onFileSelect={handleFileSelect}
              onRemoveMedia={handleRemoveMedia}
              onSelectEmoji={(emoji) => setText((prev) => prev + emoji)}
              onSelectGif={(gifUrl) => {
                setMediaUrl(gifUrl);
                setMediaType('IMAGE');
              }}
            />

            <Divider />

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
