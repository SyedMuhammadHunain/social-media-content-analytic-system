// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Section (PDF Section 4.1.v)

'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

import type { Comment } from '../../types/social';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, text: string) => void;
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText.trim());
    setCommentText('');
  };

  return (
    <VStack gap={3}>
      <Divider />

      <HStack gap={2} vAlign="center">
        <Icon icon={ChatBubbleLeftIcon} size="xsm" color="secondary" />
        <Heading level={4}>Comments ({comments.length})</Heading>
      </HStack>

      {/* Comment Input */}
      <HStack gap={2} vAlign="center">
        <div style={{ flex: 1 }}>
          <TextInput
            label="Write a comment"
            isLabelHidden
            placeholder="Write a constructive response..."
            value={commentText}
            onChange={(val: string) => setCommentText(val)}
            onEnter={handleSubmit}
          />
        </div>
        <Button
          label="Reply"
          variant="primary"
          size="sm"
          isDisabled={!commentText.trim()}
          icon={<Icon icon={PaperAirplaneIcon} size="xsm" />}
          onClick={handleSubmit}
        />
      </HStack>

      {/* Comments List */}
      {comments.length > 0 && (
        <VStack gap={3}>
          {comments.map(c => (
            <div
              key={c.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 8,
                padding: '10px 12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <VStack gap={1}>
                <HStack hAlign="between" vAlign="center">
                  <HStack gap={2} vAlign="center">
                    <Avatar name={c.author.name} src={c.author.avatarUrl} size="sm" />
                    <Text type="body">
                      <strong>{c.author.name}</strong>{' '}
                      <span style={{ color: 'var(--color-text-secondary, #9E9E9E)' }}>
                        @{c.author.username}
                      </span>
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {c.createdAt}
                  </Text>
                </HStack>
                <div style={{ paddingLeft: 36 }}>
                  <Text type="body">{c.text}</Text>
                </div>
              </VStack>
            </div>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
