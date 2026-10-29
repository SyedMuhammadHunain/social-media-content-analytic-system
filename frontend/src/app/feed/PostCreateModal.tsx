// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Create Modal

'use client';

import { useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { CreatePostInput, User } from '../../types/social.ts';
import { PostComposer } from './PostComposer.tsx';

export interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreatePost: (post: CreatePostInput) => void;
}

export function PostCreateModal({
  isOpen,
  onClose,
  currentUser,
  onCreatePost,
}: PostCreateModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card padding={5}>
          <VStack gap={4} align="stretch">
            {/* Modal Header */}
            <HStack hAlign="between" vAlign="center">
              <HStack gap={2} vAlign="center">
                <Icon icon={PencilSquareIcon} size="md" color="accent" />
                <Heading level={3}>Create New Post</Heading>
              </HStack>

              <Button
                label="Close"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XMarkIcon} size="xsm" />}
                onClick={onClose}
                aria-label="Close composer"
              />
            </HStack>

            <Divider />

            {/* Embedded Post Composer */}
            <PostComposer
              currentUser={currentUser}
              isBare
              onCreatePost={(post) => {
                onCreatePost(post);
                onClose();
              }}
              onCancel={onClose}
            />
          </VStack>
        </Card>
      </div>
    </div>
  );
}

export default PostCreateModal;
