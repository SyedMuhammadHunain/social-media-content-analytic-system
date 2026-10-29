// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Header (PDF Section 4.1.ii, iv)

'use client';

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import { MoreMenu } from '@astryxdesign/core/MoreMenu';

import {
  UserPlusIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import type { PostType, User } from '../../types/social';

const TYPE_BADGE_VARIANTS: Record<PostType, 'purple' | 'teal' | 'neutral'> = {
  VIDEO: 'purple',
  IMAGE: 'teal',
  TEXT: 'neutral',
};

export interface PostHeaderProps {
  author: User;
  type: PostType;
  createdAt: string;
  isAuthor: boolean;
  postId: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFollow: (userId: string) => void;
}

export function PostHeader({
  author,
  type,
  createdAt,
  isAuthor,
  postId,
  onEdit,
  onDelete,
  onToggleFollow,
}: PostHeaderProps) {
  return (
    <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
      <HStack gap={3} vAlign="center">
        <Avatar
          name={author.name}
          src={author.avatarUrl}
          size="md"
        />
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Heading level={4}>{author.name}</Heading>
            <Badge
              variant={TYPE_BADGE_VARIANTS[type] || 'neutral'}
              label={type}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            @{author.username} • {createdAt}
          </Text>
        </VStack>
      </HStack>

      {/* Author Controls (PDF Req 4.1.ii) or Follow Toggle (Req 4.1.iv) */}
      {isAuthor ? (
        <HStack gap={2} vAlign="center">
          <MoreMenu
            size="sm"
            label="Post options"
            data-testid={`post-more-menu-${postId}`}
            items={[
              {
                label: 'Edit',
                icon: <Icon icon={PencilSquareIcon} size="xsm" />,
                onClick: onEdit,
              },
              {
                label: 'Delete',
                variant: 'destructive',
                icon: <Icon icon={TrashIcon} size="xsm" />,
                onClick: onDelete,
              },
            ]}
          />
        </HStack>
      ) : (
        <Button
          data-testid="post-follow-btn"
          label={author.isFollowed ? 'Following' : 'Follow'}
          variant={author.isFollowed ? 'secondary' : 'primary'}
          size="sm"
          icon={
            <Icon
              icon={author.isFollowed ? CheckIcon : UserPlusIcon}
              size="xsm"
            />
          }
          onClick={() => onToggleFollow(author.id)}
        />
      )}
    </HStack>
  );
}

export default PostHeader;
