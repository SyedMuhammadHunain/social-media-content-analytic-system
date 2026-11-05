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
import { isGifUrl } from './postCommentUtils.ts';

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

          {comment.text && (
            <div style={{ paddingLeft: paddingIndent }}>
              <Text type="body">{comment.text}</Text>
            </div>
          )}

          {comment.mediaUrl && (
            <div
              data-testid={`comment-media-${comment.id}`}
              style={{
                paddingLeft: paddingIndent,
                marginTop: 6,
                position: 'relative',
                display: 'inline-block',
                maxWidth: 280,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <img
                src={comment.mediaUrl}
                alt="Comment attachment"
                loading="lazy"
                style={{
                  width: '100%',
                  maxHeight: 180,
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 6,
                }}
              />
              {(comment.mediaType === 'GIF' || isGifUrl(comment.mediaUrl)) && (
                <div
                  data-testid={`comment-gif-badge-${comment.id}`}
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(2px)',
                    pointerEvents: 'none',
                  }}
                >
                  GIF
                </div>
              )}
            </div>
          )}

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
