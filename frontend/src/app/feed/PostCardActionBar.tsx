// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card Action Bar (Req 4.1.iii, v)

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import {
  ChatBubbleBottomCenterTextIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { LikeActionButton, BookmarkActionButton } from './PostActionButtons.tsx';

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
  return (
    <HStack hAlign="between" vAlign="center">
      <HStack gap={3} vAlign="center">
        <LikeActionButton
          likesCount={likesCount}
          isLiked={isLiked}
          onToggle={() => onToggleLike(postId)}
        />

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
        <BookmarkActionButton
          postId={postId}
          isBookmarked={isBookmarked}
          onToggle={() => onToggleBookmark?.(postId)}
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
