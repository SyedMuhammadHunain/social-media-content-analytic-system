// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Header (PDF Section 4.1.ii, iv)

'use client';

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';

import {
  UserPlusIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import type { PostType, User } from '../../types/social';

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
              variant={
                type === 'VIDEO'
                  ? 'purple'
                  : type === 'IMAGE'
                    ? 'teal'
                    : 'neutral'
              }
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
          <Button
            data-testid={`post-edit-btn-${postId}`}
            label="Edit"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PencilSquareIcon} size="xsm" />}
            onClick={onEdit}
          />
          <Button
            data-testid={`post-delete-btn-${postId}`}
            label="Delete"
            variant="destructive"
            size="sm"
            icon={<Icon icon={TrashIcon} size="xsm" />}
            onClick={onDelete}
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
