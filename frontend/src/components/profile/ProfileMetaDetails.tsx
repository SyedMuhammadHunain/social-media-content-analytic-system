// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Meta Details (PDF Section 4.1.i)

'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { CameraIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types/social';

export interface ProfileMetaDetailsProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onChangePhoto?: () => void;
  onToggleFollow?: (userId: string) => void;
}

export function ProfileMetaDetails({
  user,
  isOwnProfile = true,
  onChangePhoto,
  onToggleFollow,
}: ProfileMetaDetailsProps) {
  return (
    <Card variant="default">
      <div style={{ paddingTop: 24 }}>
        <VStack gap={4} align="stretch">
          <HStack hAlign="between" vAlign="start" wrap="wrap" gap={3}>
            <VStack gap={1} align="stretch" style={{ flex: '1 1 300px' }}>
              <Heading level={2}>{user.name}</Heading>
              <Text type="supporting" color="secondary">
                @{user.username}
              </Text>
            </VStack>

            {isOwnProfile ? (
              onChangePhoto && (
                <Button
                  label="Change Photo"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={CameraIcon} size="xsm" />}
                  onClick={onChangePhoto}
                />
              )
            ) : (
              onToggleFollow && (
                <Button
                  data-testid="profile-header-follow-btn"
                  label={user.isFollowed ? 'Following' : 'Follow'}
                  variant={user.isFollowed ? 'secondary' : 'primary'}
                  size="sm"
                  icon={
                    user.isFollowed ? (
                      <Icon icon={CheckIcon} size="xsm" />
                    ) : (
                      <Icon icon={UserPlusIcon} size="xsm" />
                    )
                  }
                  onClick={() => onToggleFollow(user.id)}
                />
              )
            )}
          </HStack>

          <Text type="body" color="primary">
            {user.headline}
          </Text>

          <HStack gap={2} wrap="wrap" style={{ marginTop: 8 }}>
            {user.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="neutral" />
            ))}
          </HStack>

          <Divider />

          <HStack gap={6} vAlign="center">
            <Text type="supporting" color="secondary">
              Followers:{' '}
              <strong
                style={{
                  color: 'var(--color-text-primary, #FFFFFF)',
                }}
              >
                {user.followerCount.toLocaleString()}
              </strong>
            </Text>
            <Text type="supporting" color="secondary">
              Following:{' '}
              <strong
                style={{
                  color: 'var(--color-text-primary, #FFFFFF)',
                }}
              >
                {user.followingCount.toLocaleString()}
              </strong>
            </Text>
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}

export default ProfileMetaDetails;
