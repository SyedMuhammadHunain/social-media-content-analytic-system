// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Action Buttons

'use client';

import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import {
  HeartIcon as HeartOutline,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';

interface LikeButtonProps {
  likesCount: number;
  isLiked: boolean;
  onToggle: () => void;
  isIconOnly?: boolean;
}

export function LikeActionButton({ likesCount, isLiked, onToggle, isIconOnly }: LikeButtonProps) {
  const likeLabel = `${likesCount.toLocaleString()} ${isLiked ? 'Liked' : 'Like'}`;
  return (
    <Button
      data-testid="post-like-btn"
      label={likeLabel}
      isIconOnly={isIconOnly}
      variant={isLiked ? 'primary' : 'secondary'}
      size="sm"
      icon={
        <Icon
          icon={isLiked ? HeartSolid : HeartOutline}
          size="sm"
          style={{ color: isLiked ? '#EF4444' : undefined }}
        />
      }
      onClick={onToggle}
    />
  );
}

interface BookmarkButtonProps {
  postId: string;
  isBookmarked?: boolean;
  onToggle?: () => void;
  isIconOnly?: boolean;
}

export function BookmarkActionButton({ postId, isBookmarked, onToggle, isIconOnly }: BookmarkButtonProps) {
  const bookmarkLabel = isBookmarked ? 'Saved' : 'Save';
  return (
    <div data-testid={`post-bookmark-container-${postId}`}>
      <Button
        data-testid={`post-bookmark-btn-${postId}`}
        label={bookmarkLabel}
        isIconOnly={isIconOnly}
        variant={isBookmarked ? 'secondary' : 'ghost'}
        size="sm"
        icon={
          <Icon
            icon={isBookmarked ? BookmarkSolid : BookmarkOutline}
            size="xsm"
            style={{ color: isBookmarked ? 'var(--astryx-color-primary, #1877F2)' : undefined }}
          />
        }
        onClick={onToggle}
      />
    </div>
  );
}
