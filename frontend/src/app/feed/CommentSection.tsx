// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Section with Nested Replies (PDF Section 4.1.v & Section 10.3 Comment.reply())

'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

import type { Comment, User } from '../../types/social.ts';
import { CommentTreeItem } from './CommentTreeItem.tsx';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
  onViewProfile?: (user: User) => void;
}

interface CommentTreePartition {
  rootComments: Comment[];
  repliesByParent: Map<string, Comment[]>;
}

function partitionCommentTree(comments: Comment[]): CommentTreePartition {
  const allIds = new Set(comments.map((c) => c.id));
  const rootComments = comments.filter((c) => !c.parentCommentId || !allIds.has(c.parentCommentId));
  const repliesByParent = new Map<string, Comment[]>();

  for (const c of comments) {
    if (c.parentCommentId && allIds.has(c.parentCommentId)) {
      const list = repliesByParent.get(c.parentCommentId) || [];
      list.push(c);
      repliesByParent.set(c.parentCommentId, list);
    }
  }

  return { rootComments, repliesByParent };
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
  onViewProfile,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const { rootComments, repliesByParent } = partitionCommentTree(comments);

  const handleMainSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onAddComment(postId, trimmed);
    setCommentText('');
  };

  const handleReplySubmit = (parentCommentId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onAddComment(postId, trimmed, parentCommentId);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleSelectReply = (targetComment: Comment) => {
    if (replyingTo?.id === targetComment.id) {
      setReplyingTo(null);
      setReplyText('');
      return;
    }
    setReplyingTo({ id: targetComment.id, username: targetComment.author.username });
    setReplyText('');
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
          {rootComments.map((root) => (
            <CommentTreeItem
              key={root.id}
              comment={root}
              replyingTo={replyingTo}
              replyText={replyText}
              repliesByParent={repliesByParent}
              onSelectReply={handleSelectReply}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              onReplyTextChange={(val) => setReplyText(val)}
              onReplySubmit={handleReplySubmit}
              onViewProfile={onViewProfile}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default CommentSection;
