// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Header (PDF Section 4.1.ii, iv)

'use client';

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { MoreMenu } from '@astryxdesign/core/MoreMenu';

import {
  UserPlusIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import type { PostType, User } from '../../types/social';
import { resolveAuthorPresentation } from '../../utils/authorUtils.ts';
import { formatPostTimestamp, getPostFullDate } from '../../utils/dateUtils.ts';

export interface PostHeaderProps {
  author: User;
  type: PostType;
  createdAt: string;
  isAuthor: boolean;
  postId: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFollow: (userId: string) => void;
  onViewProfile?: (author: User) => void;
}

export function PostHeader({
  author,
  createdAt,
  isAuthor,
  postId,
  onEdit,
  onDelete,
  onToggleFollow,
  onViewProfile,
}: PostHeaderProps) {
  const resolvedAuthor = resolveAuthorPresentation(author);
  const formattedTime = formatPostTimestamp(createdAt);
  const fullDateTitle = getPostFullDate(createdAt);

  return (
    <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
      <HStack
        gap={3}
        vAlign="center"
        onClick={() => onViewProfile?.(author)}
        style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
        data-testid={`post-author-${author.id}`}
      >
        <Avatar
          name={resolvedAuthor.name}
          src={resolvedAuthor.avatarUrl || author.avatarUrl || undefined}
          size="md"
        />
        <VStack gap={0}>
          <Heading level={4}>{resolvedAuthor.name}</Heading>
          <HStack gap={1} vAlign="center" wrap="wrap">
            <Text type="supporting" color="secondary">
              @{resolvedAuthor.username}
            </Text>
            <Text type="supporting" color="secondary">
              •
            </Text>
            <span
              title={fullDateTitle}
              style={{
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Text type="supporting" color="secondary">
                {formattedTime}
              </Text>
            </span>
          </HStack>
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
