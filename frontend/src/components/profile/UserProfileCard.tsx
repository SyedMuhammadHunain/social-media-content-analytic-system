// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - UserProfileCard

'use client';

import { useState, useEffect, type FC } from 'react';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Badge } from '@astryxdesign/core/Badge';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import type { UserProfile } from '../../types/social';
import { getProfileActivity } from '../../utils/profileActivityStore';
import { ProfileCardBanner } from './ProfileCardBanner.tsx';
import { ProfileCardMetrics } from './ProfileCardMetrics.tsx';

export interface UserProfileCardProps {
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenProfileViews?: () => void;
  connectionsCount?: number;
  profileViewsCount?: number;
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  onOpenProfile,
  onOpenProfileViews,
  connectionsCount,
  profileViewsCount,
}) => {
  const [activity, setActivity] = useState(() =>
    getProfileActivity(user.id, user.username, user.followingCount)
  );

  useEffect(() => {
    const sync = () => {
      setActivity(getProfileActivity(user.id, user.username, user.followingCount));
    };
    sync();
    window.addEventListener('profile-activity-updated', sync);
    return () => window.removeEventListener('profile-activity-updated', sync);
  }, [user.id, user.username, user.followingCount]);

  const finalConnections =
    connectionsCount !== undefined ? connectionsCount : activity.connections;

  const finalViews =
    profileViewsCount !== undefined ? profileViewsCount : activity.views;

  return (
    <div
      data-testid="user-profile-card"
      onClick={onOpenProfile}
      style={{ cursor: 'pointer', width: '100%' }}
    >
      <ClickableCard
        label={`View full profile for ${user.name}`}
        onClick={onOpenProfile}
        variant="default"
        padding={0}
        style={{ overflow: 'hidden' }}
      >
        <VStack gap={0} align="stretch">
          <ProfileCardBanner
            name={user.name}
            avatarUrl={user.avatarUrl}
            coverBannerUrl={user.coverBannerUrl}
          />

          <VStack
            gap={1}
            align="center"
            style={{ padding: '8px 16px 16px 16px', textAlign: 'center' }}
          >
            <Heading level={4}>{user.name}</Heading>
            <Text type="supporting" color="secondary">
              @{user.username}
            </Text>
            <Text type="body" color="primary">
              {user.headline}
            </Text>
            {user.tags && user.tags.length > 0 && (
              <HStack gap={1} wrap="wrap" justify="center" style={{ marginTop: 4 }}>
                {user.tags.map((tag) => (
                  <Badge key={tag} label={tag} variant="neutral" />
                ))}
              </HStack>
            )}
          </VStack>

          <Divider variant="subtle" />

          <ProfileCardMetrics
            connections={finalConnections}
            views={finalViews}
            onOpenProfileViews={onOpenProfileViews}
          />
        </VStack>
      </ClickableCard>
    </div>
  );
};

export default UserProfileCard;
