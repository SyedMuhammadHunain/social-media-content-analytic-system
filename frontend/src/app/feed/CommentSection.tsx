// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Section with Nested Replies (PDF Section 4.1.v & Section 10.3 Comment.reply())

'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import type { Comment } from '../../types/social.ts';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleMainSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText.trim());
    setCommentText('');
  };

  const handleReplySubmit = (parentCommentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(postId, replyText.trim(), parentCommentId);
    setReplyText('');
    setReplyingTo(null);
  };

  // Build comment tree
  const allIds = new Set(comments.map((c) => c.id));
  const rootComments = comments.filter((c) => !c.parentCommentId || !allIds.has(c.parentCommentId));
  const repliesByParent = new Map<string, Comment[]>();

  comments.forEach((c) => {
    if (c.parentCommentId && allIds.has(c.parentCommentId)) {
      const list = repliesByParent.get(c.parentCommentId) || [];
      list.push(c);
      repliesByParent.set(c.parentCommentId, list);
    }
  });

  const renderCommentItem = (c: Comment, isNested = false) => {
    const replies = repliesByParent.get(c.id) || [];
    const isReplyingThis = replyingTo?.id === c.id;

    return (
      <VStack key={c.id} gap={2}>
        <div
          data-testid={`comment-item-${c.id}`}
          style={{
            backgroundColor: isNested ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.03)',
            borderRadius: 8,
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <VStack gap={1}>
            <HStack hAlign="between" vAlign="center">
              <HStack gap={2} vAlign="center">
                <Avatar name={c.author.name} src={c.author.avatarUrl} size={isNested ? 'xsm' : 'sm'} />
                <Text type="body">
                  <strong>{c.author.name}</strong>{' '}
                  <span style={{ color: 'var(--color-text-secondary, #9E9E9E)' }}>
                    @{c.author.username}
                  </span>
                </Text>
                {isNested && (
                  <Badge variant="blue" label="Reply" />
                )}
              </HStack>
              <Text type="supporting" color="secondary">
                {c.createdAt}
              </Text>
            </HStack>

            <div style={{ paddingLeft: isNested ? 28 : 36 }}>
              <Text type="body">{c.text}</Text>
            </div>

            {/* Inline reply action button */}
            <div style={{ paddingLeft: isNested ? 28 : 36, paddingTop: 2 }}>
              <Button
                data-testid={`reply-btn-${c.id}`}
                label="Reply"
                variant="ghost"
                size="sm"
                icon={<Icon icon={ArrowUturnLeftIcon} size="xsm" />}
                onClick={() => {
                  if (replyingTo?.id === c.id) {
                    setReplyingTo(null);
                    setReplyText('');
                  } else {
                    setReplyingTo({ id: c.id, username: c.author.username });
                    setReplyText('');
                  }
                }}
              />
            </div>
          </VStack>
        </div>

        {/* Inline Reply Composer */}
        {isReplyingThis && (
          <div
            data-testid={`reply-composer-${c.id}`}
            style={{
              paddingLeft: isNested ? 20 : 28,
              borderLeft: '2px solid var(--astryx-color-primary, #1877F2)',
              marginLeft: isNested ? 16 : 20,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <VStack gap={2}>
              <HStack hAlign="between" vAlign="center">
                <HStack gap={1} vAlign="center">
                  <Text type="supporting" color="secondary">
                    Replying to
                  </Text>
                  <Badge variant="blue" label={`@${replyingTo.username}`} />
                </HStack>
                <Button
                  data-testid={`cancel-reply-btn-${c.id}`}
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={XMarkIcon} size="xsm" />}
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                />
              </HStack>

              <HStack gap={2} vAlign="center">
                <div style={{ flex: 1 }}>
                  <TextInput
                    data-testid={`reply-input-${c.id}`}
                    label={`Reply to @${replyingTo.username}`}
                    isLabelHidden
                    placeholder={`Write a reply to @${replyingTo.username}...`}
                    value={replyText}
                    onChange={(val: string) => setReplyText(val)}
                    onEnter={() => handleReplySubmit(c.id)}
                  />
                </div>
                <Button
                  data-testid={`reply-submit-btn-${c.id}`}
                  label="Reply"
                  variant="primary"
                  size="sm"
                  isDisabled={!replyText.trim()}
                  icon={<Icon icon={PaperAirplaneIcon} size="xsm" />}
                  onClick={() => handleReplySubmit(c.id)}
                />
              </HStack>
            </VStack>
          </div>
        )}

        {/* Indented Nested Replies Thread */}
        {replies.length > 0 && (
          <div
            data-testid={`nested-replies-${c.id}`}
            style={{
              paddingLeft: 18,
              borderLeft: '2px solid rgba(255, 255, 255, 0.08)',
              marginLeft: 16,
              marginTop: 4,
            }}
          >
            <VStack gap={2}>
              {replies.map((r) => renderCommentItem(r, true))}
            </VStack>
          </div>
        )}
      </VStack>
    );
  };

  return (
    <VStack gap={3}>
      <Divider />

      <HStack gap={2} vAlign="center">
        <Icon icon={ChatBubbleLeftIcon} size="xsm" color="secondary" />
        <Heading level={4}>Comments ({comments.length})</Heading>
      </HStack>

      {/* Main Comment Input */}
      <HStack gap={2} vAlign="center">
        <div style={{ flex: 1 }}>
          <TextInput
            data-testid="comment-input"
            label="Write a comment"
            isLabelHidden
            placeholder="Write a comment..."
            value={commentText}
            onChange={(val: string) => setCommentText(val)}
            onEnter={handleMainSubmit}
          />
        </div>
        <Button
          data-testid="comment-submit-btn"
          label="Post"
          variant="primary"
          size="sm"
          isDisabled={!commentText.trim()}
          icon={<Icon icon={PaperAirplaneIcon} size="xsm" />}
          onClick={handleMainSubmit}
        />
      </HStack>

      {/* Comments Hierarchy */}
      {rootComments.length > 0 && (
        <VStack gap={3}>
          {rootComments.map((root) => renderCommentItem(root, false))}
        </VStack>
      )}
    </VStack>
  );
}
