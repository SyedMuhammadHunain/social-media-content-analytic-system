// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card Action Bar (Req 4.1.iii, v)

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { useMediaQuery } from '@astryxdesign/core/hooks';
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
  const isMobile = useMediaQuery('(max-width: 767px)', false);

  return (
    <div className="post-card-action-bar" data-testid="post-card-action-bar">
      <HStack hAlign="between" vAlign="center">
        <HStack gap={isMobile ? 1 : 3} vAlign="center">
          <LikeActionButton
            likesCount={likesCount}
            isLiked={isLiked}
            isIconOnly={isMobile}
            onToggle={() => onToggleLike(postId)}
          />

          <Button
            data-testid="post-comment-btn"
            label={`${commentsCount} Comments`}
            isIconOnly={isMobile}
            variant="secondary"
            size="sm"
            icon={<Icon icon={ChatBubbleBottomCenterTextIcon} size="sm" />}
            onClick={onToggleComments}
          />
        </HStack>

        <HStack gap={isMobile ? 1 : 2}>
          <BookmarkActionButton
            postId={postId}
            isBookmarked={isBookmarked}
            isIconOnly={isMobile}
            onToggle={() => onToggleBookmark?.(postId)}
          />
          <Button
            data-testid="post-share-btn"
            label="Share"
            isIconOnly={isMobile}
            variant="ghost"
            size="sm"
            icon={<Icon icon={ShareIcon} size="xsm" />}
          />
        </HStack>
      </HStack>
    </div>
  );
}
