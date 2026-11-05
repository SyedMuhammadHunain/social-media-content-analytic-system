// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card (PDF Section 4.1.ii, iii, iv, v)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';

import type { Post, UpdatePostInput, UserProfile, Comment, User } from '../../types/social.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { CommentSection } from './CommentSection.tsx';
import { PostEditModal } from './PostEditModal.tsx';
import { PostHeader } from './PostHeader.tsx';
import { PostDeleteModal } from './PostDeleteModal.tsx';
import { PostCardActionBar } from './PostCardActionBar.tsx';
import { PostCardContent } from './PostCardContent.tsx';
import { shouldFetchRemoteComments, fetchRemoteCommentsForPost } from './postCommentUtils.ts';

function checkIsAuthor(currentUserId?: string, authorId?: string): boolean {
  if (!currentUserId || !authorId) return false;
  if (currentUserId === authorId) return true;
  return normalizeBackendUserId(currentUserId) === normalizeBackendUserId(authorId);
}

interface PostCardProps {
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
  const [showComments, setShowComments] = useState(false);
  const [remoteComments, setRemoteComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAuthor = checkIsAuthor(currentUser?.id, post.author.id);

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    const needFetch = shouldFetchRemoteComments(
      nextShow,
      post.comments.length,
      post.commentsCount,
      remoteComments.length
    );

    if (needFetch) {
      const fetched = await fetchRemoteCommentsForPost(post.id, currentUser);
      if (fetched.length > 0) {
        setRemoteComments(fetched);
      }
    }
  };

  const isOnly = isFirst && isLast;
  const cardBorderRadius = hasTopComposer
    ? isLast || isOnly
      ? '0 0 var(--radius-container, 12px) var(--radius-container, 12px)'
      : 0
    : isOnly
      ? undefined
      : isFirst
        ? 'var(--radius-container, 12px) var(--radius-container, 12px) 0 0'
        : isLast
          ? '0 0 var(--radius-container, 12px) var(--radius-container, 12px)'
          : 0;

  const cardStyle: React.CSSProperties = {
    borderRadius: cardBorderRadius,
    borderTopWidth: hasTopComposer && isFirst ? '0px' : undefined,
    borderBottomWidth: isLast || isOnly ? '1px' : '0px',
  };

  return (
    <div data-testid={`post-card-${post.id}`}>
      <Card padding={5} style={cardStyle}>
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
