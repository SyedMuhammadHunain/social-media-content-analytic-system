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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

import type { Post, UpdatePostInput, UserProfile } from '../../types/social';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUser: _currentUser,
  onToggleLike,
  onToggleFollow,
  onAddComment,
  onEditPost: _onEditPost,
  onDeletePost: _onDeletePost,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card padding={5}>
      <VStack gap={4}>
        {/* Header: Author info, Format badge & Follow button */}
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

          {/* Follow / Unfollow Toggle (Req 4.1.iv) */}
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
        </HStack>

        {/* Text Content / Description */}
        {post.type === 'TEXT' && post.text && (
          <Text type="body">{post.text}</Text>
        )}

        {post.type !== 'TEXT' && post.description && (
          <Text type="body">{post.description}</Text>
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

          <Button
            label="Share"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ShareIcon} size="xsm" />}
          />
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
  );
}
