// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Delete Confirmation Modal (PDF Section 4.1.ii)

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';

export interface PostDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PostDeleteModal({ isOpen, onClose, onConfirm }: PostDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="post-delete-confirm-modal"
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
      <div style={{ maxWidth: 440, width: '100%' }}>
        <Card padding={5}>
          <VStack gap={4}>
            <Heading level={3}>Delete Post?</Heading>
            <Text type="body" color="secondary">
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </Text>
            <Divider />
            <HStack hAlign="end" gap={3}>
              <Button
                label="Cancel"
                variant="secondary"
                size="md"
                onClick={onClose}
              />
              <Button
                data-testid="confirm-delete-btn"
                label="Delete Post"
                variant="destructive"
                size="md"
                onClick={onConfirm}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
}

export default PostDeleteModal;
