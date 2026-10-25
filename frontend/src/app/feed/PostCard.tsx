// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card (PDF Section 4.1.ii, iii, iv, v)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';

import {
  HeartIcon as HeartOutline,
  ChatBubbleBottomCenterTextIcon,
  ShareIcon,
  UserPlusIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';

import type { Post, UpdatePostInput, UserProfile } from '../../types/social';
import { CommentSection } from './CommentSection';
import { PostEditModal } from './PostEditModal';

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
          <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
            <HStack gap={3} vAlign="center">
              <Avatar
                name={post.author.name}
                src={post.author.avatarUrl}
                size="md"
              />
              <VStack gap={0}>
                <HStack gap={2} vAlign="center">
                  <Heading level={4}>{post.author.name}</Heading>
                  <Badge
                    variant={
                      post.type === 'VIDEO'
                        ? 'purple'
                        : post.type === 'IMAGE'
                          ? 'teal'
                          : 'neutral'
                    }
                    label={post.type}
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  @{post.author.username} • {post.createdAt}
                </Text>
              </VStack>
            </HStack>

            {/* Author Controls (PDF Req 4.1.ii) or Follow Toggle (Req 4.1.iv) */}
            {isAuthor ? (
              <HStack gap={2} vAlign="center">
                <Button
                  data-testid={`post-edit-btn-${post.id}`}
                  label="Edit"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={PencilSquareIcon} size="xsm" />}
                  onClick={() => setIsEditing(true)}
                />
                <Button
                  data-testid={`post-delete-btn-${post.id}`}
                  label="Delete"
                  variant="destructive"
                  size="sm"
                  icon={<Icon icon={TrashIcon} size="xsm" />}
                  onClick={() => setIsConfirmingDelete(true)}
                />
              </HStack>
            ) : (
              <Button
                data-testid="post-follow-btn"
                label={post.author.isFollowed ? 'Following' : 'Follow'}
                variant={post.author.isFollowed ? 'secondary' : 'primary'}
                size="sm"
                icon={
                  <Icon
                    icon={post.author.isFollowed ? CheckIcon : UserPlusIcon}
                    size="xsm"
                  />
                }
                onClick={() => onToggleFollow(post.author.id)}
              />
            )}
          </HStack>

          {/* Text Content / Description */}
          {(post.text || post.description) && (
            <Text type="body">
              {post.text || post.description}
            </Text>
          )}

          {/* Media Visualization */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxHeight: 480,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {post.type === 'IMAGE' ? (
                <img
                  src={post.mediaUrls[0]}
                  alt={post.description || 'Post image'}
                  style={{
                    width: '100%',
                    maxHeight: 480,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <video
                  src={post.mediaUrls[0]}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 480,
                    backgroundColor: '#000000',
                  }}
                />
              )}
            </div>
          )}

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
      {isConfirmingDelete && (
        <div
          data-testid="post-delete-confirm-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setIsConfirmingDelete(false);
          }}
        >
          <div style={{ maxWidth: 440, width: '100%' }}>
            <Card padding={5}>
              <VStack gap={4}>
                <Heading level={3}>Delete Post?</Heading>
                <Text type="body" color="secondary">
                  Are you sure you want to delete this post? This action is permanent and cannot be undone.
                </Text>
                <Divider />
                <HStack hAlign="end" gap={3}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    size="md"
                    onClick={() => setIsConfirmingDelete(false)}
                  />
                  <Button
                    data-testid="confirm-delete-btn"
                    label="Delete Post"
                    variant="destructive"
                    size="md"
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      onDeletePost?.(post.id);
                    }}
                  />
                </HStack>
              </VStack>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
