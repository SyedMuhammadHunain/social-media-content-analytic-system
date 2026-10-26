// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card (PDF Section 4.1.ii, iii, iv, v)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';

import {
  HeartIcon as HeartOutline,
  ChatBubbleBottomCenterTextIcon,
  ShareIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';

import type { Post, UpdatePostInput, UserProfile } from '../../types/social';
import { CommentSection } from './CommentSection';
import { PostEditModal } from './PostEditModal';
import { PostHeader } from './PostHeader';
import { PostMediaViewer } from './PostMediaViewer';
import { PostDeleteModal } from './PostDeleteModal';

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleBookmark?: (postId: string) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
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
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAuthor = Boolean(currentUser && currentUser.id === post.author.id);

  return (
    <div data-testid={`post-card-${post.id}`}>
      <Card padding={5}>
        <VStack gap={4}>
          {/* Header: Author info, Format badge & Follow or Edit/Delete controls */}
          <PostHeader
            author={post.author}
            type={post.type}
            createdAt={post.createdAt}
            isAuthor={isAuthor}
            postId={post.id}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsConfirmingDelete(true)}
            onToggleFollow={onToggleFollow}
          />

          {/* Text Content / Description */}
          {(post.text || post.description) && (
            <Text type="body">
              {post.text || post.description}
            </Text>
          )}

          {/* Media Visualization */}
          <PostMediaViewer
            mediaUrls={post.mediaUrls}
            type={post.type}
            description={post.description}
          />

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <HStack gap={2} wrap="wrap">
              {post.hashtags.map(tag => (
                <Badge key={tag} variant="neutral" label={tag} />
              ))}
            </HStack>
          )}

          <Divider />

          {/* Action Bar: Like, Comment, Share */}
          <HStack hAlign="between" vAlign="center">
            <HStack gap={3} vAlign="center">
              {/* Like / Unlike Button (Req 4.1.iii) */}
              <Button
                data-testid="post-like-btn"
                label={`${post.likesCount.toLocaleString()} ${post.isLiked ? 'Liked' : 'Like'}`}
                variant={post.isLiked ? 'primary' : 'secondary'}
                size="sm"
                icon={
                  <Icon
                    icon={post.isLiked ? HeartSolid : HeartOutline}
                    size="sm"
                    style={{ color: post.isLiked ? '#EF4444' : undefined }}
                  />
                }
                onClick={() => onToggleLike(post.id)}
              />

              {/* Comment Drawer Toggle (Req 4.1.v) */}
              <Button
                data-testid="post-comment-btn"
                label={`${post.commentsCount} Comments`}
                variant="secondary"
                size="sm"
                icon={<Icon icon={ChatBubbleBottomCenterTextIcon} size="sm" />}
                onClick={() => setShowComments(!showComments)}
              />
            </HStack>

            <HStack gap={2}>
              <Button
                data-testid={`post-bookmark-btn-${post.id}`}
                label={post.isBookmarked ? 'Saved' : 'Save'}
                variant={post.isBookmarked ? 'secondary' : 'ghost'}
                size="sm"
                icon={
                  <Icon
                    icon={post.isBookmarked ? BookmarkSolid : BookmarkOutline}
                    size="xsm"
                    style={{ color: post.isBookmarked ? 'var(--astryx-color-primary, #1877F2)' : undefined }}
                  />
                }
                onClick={() => onToggleBookmark?.(post.id)}
              />
              <Button
                label="Share"
                variant="ghost"
                size="sm"
                icon={<Icon icon={ShareIcon} size="xsm" />}
              />
            </HStack>
          </HStack>

          {/* Collapsible Comment Drawer */}
          {showComments && (
            <CommentSection
              postId={post.id}
              comments={post.comments}
              onAddComment={onAddComment}
            />
          )}
        </VStack>
      </Card>

      {/* Edit Modal (PDF Req 4.1.ii) */}
      <PostEditModal
        post={post}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={input => onEditPost?.(post.id, input)}
      />

      {/* Delete Confirmation Dialog (PDF Req 4.1.ii) */}
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
