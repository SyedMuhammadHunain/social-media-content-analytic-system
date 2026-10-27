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

import type { Post, UpdatePostInput, UserProfile, Comment } from '../../types/social.ts';
import { CommentSection } from './CommentSection.tsx';
import { PostEditModal } from './PostEditModal.tsx';
import { PostHeader } from './PostHeader.tsx';
import { PostMediaViewer } from './PostMediaViewer.tsx';
import { PostDeleteModal } from './PostDeleteModal.tsx';
import { socialApi } from '../../api/socialApi.ts';

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
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
  const [remoteComments, setRemoteComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAuthor = Boolean(currentUser && currentUser.id === post.author.id);
  const postContent = post.text || post.description;

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    if (nextShow && post.comments.length === 0 && post.commentsCount > 0 && remoteComments.length === 0) {
      try {
        const backendComments = await socialApi.getComments(post.id);
        if (backendComments && backendComments.length > 0) {
          const mapped: Comment[] = backendComments.map((c) => ({
            id: c.id,
            postId: c.postId,
            userId: c.userId,
            author: {
              id: c.userId,
              username: c.userId.replace(/^user_/, ''),
              name: c.userId === currentUser?.id ? currentUser.name : c.userId.replace(/^user_/, ''),
              avatarUrl: c.userId === currentUser?.id ? currentUser.avatarUrl : undefined,
              isFollowed: false,
            },
            text: c.content,
            parentCommentId: c.parentCommentId,
            createdAt: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setRemoteComments(mapped);
        }
      } catch {
        // Offline fallback
      }
    }
  };

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
          {postContent && (
            <Text type="body">
              {postContent}
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
                onClick={handleToggleComments}
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
              comments={[...post.comments, ...remoteComments]}
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
