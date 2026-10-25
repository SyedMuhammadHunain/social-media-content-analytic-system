// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Right Rail Who to Follow Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { UserPlusIcon } from '@heroicons/react/24/outline';

import type { SuggestedCreator } from '../../types/social';

export interface WhoToFollowCardProps {
  creators: SuggestedCreator[];
  onToggleFollow: (userId: string) => void;
}

export function WhoToFollowCard({
  creators,
  onToggleFollow,
}: WhoToFollowCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <UserPlusIcon style={{ width: 20, height: 20, color: 'var(--astryx-color-primary, #1877F2)' }} />
          <Heading level={4}>Who to Follow</Heading>
        </HStack>

        <VStack gap={3}>
          {creators.map(creator => (
            <HStack
              key={creator.id}
              justify="between"
              vAlign="center"
              gap={2}
            >
              <HStack gap={2} vAlign="center" style={{ minWidth: 0, flex: 1 }}>
                <Avatar
                  name={creator.name}
                  src={creator.avatarUrl}
                  size="md"
                />
                <VStack gap={0} style={{ minWidth: 0, overflow: 'hidden' }}>
                  <Text type="body" weight="semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {creator.name}
                  </Text>
                  <Text type="supporting" color="secondary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{creator.username}
                  </Text>
                </VStack>
              </HStack>

              <div data-testid={`follow-suggested-${creator.id}`}>
                <Button
                  size="sm"
                  variant={creator.isFollowed ? 'secondary' : 'primary'}
                  label={creator.isFollowed ? 'Following' : 'Follow'}
                  onClick={() => onToggleFollow(creator.id)}
                />
              </div>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

export default WhoToFollowCard;
