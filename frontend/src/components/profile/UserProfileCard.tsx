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
  connectionsCount?: number;
  profileViewsCount?: number;
}

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  onOpenProfile,
  connectionsCount = 149,
  profileViewsCount = 73,
}) => {
  const bannerSrc = user.coverBannerUrl || DEFAULT_BANNER;

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
          {/* 1. Cover Banner Image */}
          <div
            style={{
              width: '100%',
              height: 64,
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface-muted, #E2E8F0)',
            }}
          >
            <img
              src={bannerSrc}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* 2. Overlapping Centered Avatar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: -36,
              zIndex: 1,
            }}
          >
            <div
              style={{
                borderRadius: '50%',
                border: '3px solid #FFFFFF',
                lineHeight: 0,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Avatar name={user.name} src={user.avatarUrl} size={72} />
            </div>
          </div>

          {/* 3. Name, Username, Headline & Tags */}
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

          {/* 4. Astryx Subtle Divider */}
          <Divider variant="subtle" />

          {/* 5. Metrics Section */}
          <VStack gap={2} align="stretch" style={{ padding: '12px 16px' }}>
            <HStack hAlign="between" vAlign="center">
              <Text type="supporting" color="secondary">
                Connections
              </Text>
              <Text type="supporting" color="accent" weight="bold">
                {connectionsCount.toLocaleString()}
              </Text>
            </HStack>

            <HStack hAlign="between" vAlign="center">
              <Text type="supporting" color="secondary">
                Who's viewed your profile
              </Text>
              <Text type="supporting" color="accent" weight="bold">
                {profileViewsCount.toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </ClickableCard>
    </div>
  );
};

export default UserProfileCard;
