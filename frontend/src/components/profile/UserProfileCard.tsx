// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Left Sidebar User Profile Card

'use client';

import type { FC } from 'react';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import type { UserProfile } from '../../types/social';

export interface UserProfileCardProps {
  user: UserProfile;
  onOpenProfile: () => void;
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  onOpenProfile,
}) => {
  return (
    <div
      data-testid="user-profile-card"
      onClick={onOpenProfile}
      style={{ cursor: 'pointer' }}
    >
      <ClickableCard
        label={`View full profile for ${user.name}`}
        onClick={onOpenProfile}
        variant="default"
      >
        <VStack gap={3} align="stretch">
          <HStack gap={3} vAlign="center">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <VStack gap={0}>
              <Heading level={4}>{user.name}</Heading>
              <Text type="supporting" color="secondary">
                @{user.username}
              </Text>
            </VStack>
          </HStack>

          <Text type="body" color="primary">
            {user.headline}
          </Text>

          <HStack gap={2} wrap="wrap">
            {user.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="neutral" />
            ))}
          </HStack>

          <Divider />

          <HStack hAlign="between" vAlign="center">
            <Text type="supporting" color="secondary">
              Followers:{' '}
              <strong style={{ color: 'var(--color-text-primary, #FFFFFF)' }}>
                {user.followerCount.toLocaleString()}
              </strong>
            </Text>
            <Text type="supporting" color="secondary">
              Following:{' '}
              <strong style={{ color: 'var(--color-text-primary, #FFFFFF)' }}>
                {user.followingCount.toLocaleString()}
              </strong>
            </Text>
          </HStack>
        </VStack>
      </ClickableCard>
    </div>
  );
};

export default UserProfileCard;
