'use client';

import { useState, useEffect, type FC } from 'react';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';
import type { UserProfile } from '../../types/social';
import { getProfileActivity } from '../../utils/profileActivityStore';

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
          {/* 1. Cover Banner Image (no default Unsplash image - user sets it up) */}
          <div
            style={{
              width: '100%',
              height: 64,
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface-muted, #1E293B)',
            }}
          >
            {user.coverBannerUrl ? (
              <img
                src={user.coverBannerUrl}
                alt=""
                aria-hidden="true"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                }}
              />
            )}
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
              <Avatar name={user.name} src={user.avatarUrl || undefined} size={72} />
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

          {/* 5. Metrics Section (Dynamic connections & interactive profile views) */}
          <VStack gap={2} align="stretch" style={{ padding: '12px 16px' }}>
            <HStack hAlign="between" vAlign="center">
              <Text type="supporting" color="secondary">
                Connections
              </Text>
              <Text type="supporting" color="accent" weight="bold">
                {finalConnections.toLocaleString()}
              </Text>
            </HStack>

            <div
              data-testid="profile-views-trigger"
              onClick={(e) => {
                if (onOpenProfileViews) {
                  e.stopPropagation();
                  onOpenProfileViews();
                }
              }}
              style={{
                cursor: onOpenProfileViews ? 'pointer' : 'default',
                borderRadius: 6,
                padding: '2px 4px',
                margin: '-2px -4px',
                transition: 'background-color 0.15s ease',
              }}
              title={onOpenProfileViews ? "Click to see who viewed your profile" : undefined}
            >
              <HStack hAlign="between" vAlign="center">
                <Text type="supporting" color="secondary">
                  Who's viewed your profile
                </Text>
                <Text type="supporting" color="accent" weight="bold">
                  {finalViews.toLocaleString()}
                </Text>
              </HStack>
            </div>
          </VStack>
        </VStack>
      </ClickableCard>
    </div>
  );
};

export default UserProfileCard;
