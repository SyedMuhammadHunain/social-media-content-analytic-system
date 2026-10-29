// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Post List Presentation Component

'use client';

import { VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Button } from '@astryxdesign/core/Button';
import type { Post, UserProfile, UpdatePostInput, User } from '../../types/social.ts';
import { PostCard } from './PostCard.tsx';

export interface FeedPostListProps {
  posts: Post[];
  currentUser: UserProfile;
  isBookmarksFilter: boolean;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
  onToggleBookmark: (postId: string) => void;
  onEditPost: (postId: string, input: UpdatePostInput) => void;
  onDeletePost: (postId: string) => void;
  onViewUserProfile?: (user: User) => void;
}

function getEmptyStateDescription(isBookmarksFilter: boolean): string {
  if (isBookmarksFilter) {
    return 'You have not saved any posts yet. Click the bookmark icon on any post to save it here.';
  }
  return 'No posts match the active filter criteria.';
}

function FeedEmptyState({
  isBookmarksFilter,
  hasActiveFilter,
  onClearFilter,
}: {
  isBookmarksFilter: boolean;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
}) {
  return (
    <Card padding={6}>
      <EmptyState
        headingLevel={3}
        title="No Posts Found"
        description={getEmptyStateDescription(isBookmarksFilter)}
        actions={
          hasActiveFilter ? (
            <Button
              size="sm"
              variant="primary"
              label="Reset to All Posts"
              onClick={onClearFilter}
            />
          ) : undefined
        }
      />
    </Card>
  );
}

export function FeedPostList({
  posts,
  currentUser,
  isBookmarksFilter,
  hasActiveFilter,
  onClearFilter,
  onToggleLike,
  onToggleFollow,
  onAddComment,
  onToggleBookmark,
  onEditPost,
  onDeletePost,
  onViewUserProfile,
}: FeedPostListProps) {
  if (posts.length === 0) {
    return (
      <FeedEmptyState
        isBookmarksFilter={isBookmarksFilter}
        hasActiveFilter={hasActiveFilter}
        onClearFilter={onClearFilter}
      />
    );
  }

  return (
    <VStack gap={4}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onToggleLike={onToggleLike}
          onToggleFollow={onToggleFollow}
          onAddComment={onAddComment}
          onToggleBookmark={onToggleBookmark}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          onViewProfile={onViewUserProfile}
        />
      ))}
    </VStack>
  );
}

export default FeedPostList;
