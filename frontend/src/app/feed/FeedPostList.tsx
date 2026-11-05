// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Post List Presentation Component

'use client';

import type { FC } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import type { Post, UserProfile, UpdatePostInput, User } from '../../types/social.ts';
import { PostCard } from './PostCard.tsx';
import { FeedSkeleton } from './FeedSkeleton.tsx';
import { FeedEmptyState } from './FeedEmptyState.tsx';

export interface FeedPostListProps {
  posts: Post[];
  currentUser: UserProfile;
  isBookmarksFilter: boolean;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (
    postId: string,
    text: string,
    parentCommentId?: string,
    mediaUrl?: string,
    mediaType?: 'IMAGE' | 'GIF' | 'VIDEO'
  ) => void;
  onToggleBookmark: (postId: string) => void;
  onEditPost: (postId: string, input: UpdatePostInput) => void;
  onDeletePost: (postId: string) => void;
  onViewUserProfile?: (user: User) => void;
  isLoading?: boolean;
  hasTopComposer?: boolean;
}

export const FeedPostList: FC<FeedPostListProps> = (props) => {
  if (props.isLoading) {
    return <FeedSkeleton count={3} />;
  }

  if (props.posts.length === 0) {
    return (
      <FeedEmptyState
        isBookmarksFilter={props.isBookmarksFilter}
        hasActiveFilter={props.hasActiveFilter}
        onClearFilter={props.onClearFilter}
      />
    );
  }

  return (
    <VStack gap={0}>
      {props.posts.map((post, index) => (
        <div
          key={post.id}
          className="post-card-animated"
          style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
        >
          <PostCard
            post={post}
            currentUser={props.currentUser}
            onToggleLike={props.onToggleLike}
            onToggleFollow={props.onToggleFollow}
            onAddComment={props.onAddComment}
            onToggleBookmark={props.onToggleBookmark}
            onEditPost={props.onEditPost}
            onDeletePost={props.onDeletePost}
            onViewProfile={props.onViewUserProfile}
            isFirst={index === 0}
            isLast={index === props.posts.length - 1}
            hasTopComposer={props.hasTopComposer}
          />
        </div>
      ))}
    </VStack>
  );
};

export default FeedPostList;
