// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Threads-Style Post Composer Prompt Bar (refine_2_ui)

'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import type { CreatePostInput, User } from '../../types/social.ts';

export interface PostComposerProps {
  currentUser: User;
  onCreatePost?: (post: CreatePostInput) => void;
  onOpenModal?: () => void;
  isBare?: boolean;
  onCancel?: () => void;
}

export function PostComposer({
  currentUser,
  onOpenModal,
}: PostComposerProps) {
  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      window.dispatchEvent(new CustomEvent('social:open-create-post'));
    }
  };

  return (
    <div
      data-testid="post-composer-prompt-bar"
      onClick={handleOpen}
      style={{
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <Card
        padding={4}
        style={{
          width: '100%',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottom: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'var(--color-background-surface, #1e1e1e)',
          transition: 'background-color 0.15s ease',
        }}
      >
        <HStack vAlign="center" hAlign="between" gap={3} style={{ width: '100%' }}>
          <HStack vAlign="center" gap={3} style={{ flex: 1, minWidth: 0 }}>
            <Avatar
              size="md"
              src={currentUser.avatarUrl}
              name={currentUser.name}
            />
            <Text
              type="body"
              color="secondary"
              size="base"
              style={{ userSelect: 'none' }}
            >
              What's new?
            </Text>
          </HStack>

          <Button
            data-testid="composer-prompt-post-btn"
            label="Post"
            variant="primary"
            size="sm"
            onClick={(e) => {
              e?.stopPropagation();
              handleOpen();
            }}
          />
        </HStack>
      </Card>
    </div>
  );
}

export default PostComposer;
