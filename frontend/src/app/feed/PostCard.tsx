// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card (PDF Section 4.1.ii, iii, iv, v)

'use client';

import { useState } from 'react';
import type React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';

import type { Post, UpdatePostInput, UserProfile, User } from '../../types/social.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { CommentSection } from './CommentSection.tsx';
import { PostEditModal } from './PostEditModal.tsx';
import { PostHeader } from './PostHeader.tsx';
import { PostDeleteModal } from './PostDeleteModal.tsx';
import { PostCardActionBar } from './PostCardActionBar.tsx';
import { PostCardContent } from './PostCardContent.tsx';
import { usePostCommentsToggle } from './usePostCommentsToggle.ts';
import { resolveCardBorderRadius, type CardPositionFlags } from './postCardBorderUtils.ts';

function checkIsAuthor(currentUserId?: string, authorId?: string): boolean {
  if (!currentUserId || !authorId) return false;
  if (currentUserId === authorId) return true;
  return normalizeBackendUserId(currentUserId) === normalizeBackendUserId(authorId);
}

export type { CardPositionFlags };

export interface PostCardProps {
  post: Post;
  currentUser?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
  onToggleBookmark?: (postId: string) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (user: User) => void;
  isFirst?: boolean;
  isLast?: boolean;
  hasTopComposer?: boolean;
}

function buildCardStyle(flags: CardPositionFlags): React.CSSProperties {
  const isOnly = flags.isFirst && flags.isLast;
  return {
    borderRadius: resolveCardBorderRadius(flags),
    borderTopWidth: flags.hasTopComposer && flags.isFirst ? '0px' : undefined,
    borderBottomWidth: flags.isLast || isOnly ? '1px' : '0px',
  };
}

export function PostCard({
  post,
  currentUser,
  onToggleLike,
  onToggleFollow,
  onAddComment,
  onToggleBookmark,
  onEditPost,
  onDeletePost,
  onViewProfile,
  isFirst = false,
  isLast = false,
  hasTopComposer = false,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { showComments, remoteComments, handleToggleComments } = usePostCommentsToggle(post, currentUser);

  const isAuthor = checkIsAuthor(currentUser?.id, post.author.id);
  const cardStyle = buildCardStyle({ hasTopComposer, isFirst, isLast });

  return (
    <div className="post-card-root" data-testid={`post-card-${post.id}`}>
      <Card padding={5} className="post-card-surface" style={cardStyle}>
        <VStack gap={4}>
          <PostHeader
            author={post.author}
            type={post.type}
            createdAt={post.createdAt}
            isAuthor={isAuthor}
            postId={post.id}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsConfirmingDelete(true)}
            onToggleFollow={onToggleFollow}
            onViewProfile={onViewProfile}
          />

          <PostCardContent
            text={post.text}
            description={post.description}
            type={post.type}
            mediaUrls={post.mediaUrls}
            mediaId={post.mediaId}
            hashtags={post.hashtags}
          />

          <Divider />

          <PostCardActionBar
            postId={post.id}
            likesCount={post.likesCount}
            isLiked={post.isLiked}
            commentsCount={post.commentsCount}
            isBookmarked={post.isBookmarked}
            onToggleLike={onToggleLike}
            onToggleComments={handleToggleComments}
            onToggleBookmark={onToggleBookmark}
          />

          {showComments && (
            <CommentSection
              postId={post.id}
              comments={[...post.comments, ...remoteComments]}
              onAddComment={onAddComment}
              onViewProfile={onViewProfile}
            />
          )}
        </VStack>
      </Card>

      <PostEditModal
        post={post}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={input => onEditPost?.(post.id, input)}
      />

      <PostDeleteModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          setIsConfirmingDelete(false);
          onDeletePost?.(post.id);
        }}
      />
    </div>
  );
}

export default PostCard;
