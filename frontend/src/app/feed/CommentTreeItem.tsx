// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Tree Item

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

import type { Comment, User } from '../../types/social.ts';
import { resolveAuthorPresentation } from '../../utils/authorUtils.ts';
import { formatPostTimestamp, getPostFullDate } from '../../utils/dateUtils.ts';
import { CommentReplyComposer } from './CommentReplyComposer.tsx';

export interface CommentTreeItemProps {
  comment: Comment;
  isNested?: boolean;
  replyingTo: { id: string; username: string } | null;
  replyText: string;
  repliesByParent: Map<string, Comment[]>;
  onSelectReply: (comment: Comment) => void;
  onCancelReply: () => void;
  onReplyTextChange: (val: string) => void;
  onReplySubmit: (parentCommentId: string) => void;
  onViewProfile?: (user: User) => void;
}

interface CommentHeaderProps {
  comment: Comment;
  isNested: boolean;
  onViewProfile?: (user: User) => void;
}

function CommentHeader({ comment, isNested, onViewProfile }: CommentHeaderProps) {
  const resolvedAuthor = resolveAuthorPresentation(comment.author);
  const formattedCommentTime = formatPostTimestamp(comment.createdAt);
  const fullCommentDate = getPostFullDate(comment.createdAt);
  const avatarSrc = resolvedAuthor.avatarUrl || comment.author.avatarUrl || undefined;

  return (
    <HStack hAlign="between" vAlign="center">
      <HStack
        gap={2}
        vAlign="center"
        onClick={() => onViewProfile?.(comment.author)}
        style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
      >
        <Avatar name={resolvedAuthor.name} src={avatarSrc} size={isNested ? 'xsm' : 'sm'} />
        <Text type="body">
          <strong>{resolvedAuthor.name}</strong>{' '}
          <span style={{ color: 'var(--color-text-secondary, #9E9E9E)' }}>
            @{resolvedAuthor.username}
          </span>
        </Text>
        {isNested && <Badge variant="blue" label="Reply" />}
      </HStack>
      <span title={fullCommentDate} style={{ cursor: 'default' }}>
        <Text type="supporting" color="secondary">
          {formattedCommentTime}
        </Text>
      </span>
    </HStack>
  );
}

export function CommentTreeItem({
  comment,
  isNested = false,
  replyingTo,
  replyText,
  repliesByParent,
  onSelectReply,
  onCancelReply,
  onReplyTextChange,
  onReplySubmit,
  onViewProfile,
}: CommentTreeItemProps) {
  const replies = repliesByParent.get(comment.id) || [];
  const isReplyingThis = replyingTo?.id === comment.id;
  const paddingIndent = isNested ? 28 : 36;

  return (
    <VStack key={comment.id} gap={2}>
      <div
        data-testid={`comment-item-${comment.id}`}
        style={{
          backgroundColor: isNested ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.03)',
          borderRadius: 8,
          padding: '10px 12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <VStack gap={1}>
          <CommentHeader comment={comment} isNested={isNested} onViewProfile={onViewProfile} />

          <div style={{ paddingLeft: paddingIndent }}>
            <Text type="body">{comment.text}</Text>
          </div>

          <div style={{ paddingLeft: paddingIndent, paddingTop: 2 }}>
            <Button
              data-testid={`reply-btn-${comment.id}`}
              label="Reply"
              variant="ghost"
              size="sm"
              icon={<Icon icon={ArrowUturnLeftIcon} size="xsm" />}
              onClick={() => onSelectReply(comment)}
            />
          </div>
        </VStack>
      </div>

      {isReplyingThis && (
        <CommentReplyComposer
          commentId={comment.id}
          replyingToUsername={replyingTo.username}
          replyText={replyText}
          isNested={isNested}
          onReplyTextChange={onReplyTextChange}
          onSubmit={() => onReplySubmit(comment.id)}
          onCancel={onCancelReply}
        />
      )}

      {replies.length > 0 && (
        <div
          data-testid={`nested-replies-${comment.id}`}
          style={{
            paddingLeft: 18,
            borderLeft: '2px solid rgba(255, 255, 255, 0.08)',
            marginLeft: 16,
            marginTop: 4,
          }}
        >
          <VStack gap={2}>
            {replies.map((childReply) => (
              <CommentTreeItem
                key={childReply.id}
                comment={childReply}
                isNested
                replyingTo={replyingTo}
                replyText={replyText}
                repliesByParent={repliesByParent}
                onSelectReply={onSelectReply}
                onCancelReply={onCancelReply}
                onReplyTextChange={onReplyTextChange}
                onReplySubmit={onReplySubmit}
                onViewProfile={onViewProfile}
              />
            ))}
          </VStack>
        </div>
      )}
    </VStack>
  );
}

export default CommentTreeItem;
