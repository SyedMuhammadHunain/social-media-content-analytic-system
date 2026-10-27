// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card Action Bar (Req 4.1.iii, v)

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
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

export interface PostCardActionBarProps {
  postId: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  isBookmarked?: boolean;
  onToggleLike: (postId: string) => void;
  onToggleComments: () => void;
  onToggleBookmark?: (postId: string) => void;
}

export function PostCardActionBar({
  postId,
  likesCount,
  isLiked,
  commentsCount,
  isBookmarked,
  onToggleLike,
  onToggleComments,
  onToggleBookmark,
}: PostCardActionBarProps) {
  const likeLabel = `${likesCount.toLocaleString()} ${isLiked ? 'Liked' : 'Like'}`;
  const bookmarkLabel = isBookmarked ? 'Saved' : 'Save';

  return (
    <HStack hAlign="between" vAlign="center">
      <HStack gap={3} vAlign="center">
        {/* Like / Unlike Button (Req 4.1.iii) */}
        <Button
          data-testid="post-like-btn"
          label={likeLabel}
          variant={isLiked ? 'primary' : 'secondary'}
          size="sm"
          icon={
            <Icon
              icon={isLiked ? HeartSolid : HeartOutline}
              size="sm"
              style={{ color: isLiked ? '#EF4444' : undefined }}
            />
          }
          onClick={() => onToggleLike(postId)}
        />

        {/* Comment Drawer Toggle (Req 4.1.v) */}
        <Button
          data-testid="post-comment-btn"
          label={`${commentsCount} Comments`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={ChatBubbleBottomCenterTextIcon} size="sm" />}
          onClick={onToggleComments}
        />
      </HStack>

      <HStack gap={2}>
        <Button
          data-testid={`post-bookmark-btn-${postId}`}
          label={bookmarkLabel}
          variant={isBookmarked ? 'secondary' : 'ghost'}
          size="sm"
          icon={
            <Icon
              icon={isBookmarked ? BookmarkSolid : BookmarkOutline}
              size="xsm"
              style={{ color: isBookmarked ? 'var(--astryx-color-primary, #1877F2)' : undefined }}
            />
          }
          onClick={() => onToggleBookmark?.(postId)}
        />
        <Button
          label="Share"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ShareIcon} size="xsm" />}
        />
      </HStack>
    </HStack>
  );
}
