// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Right Rail Who to Follow Card

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
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
          <Icon icon={UserPlusIcon} size="md" color="accent" />
          <Heading level={4}>Who to Follow</Heading>
        </HStack>

        <VStack gap={1}>
          {creators.map(creator => (
            <Item
              key={creator.id}
              density="compact"
              startContent={
                <Avatar
                  name={creator.name}
                  src={creator.avatarUrl}
                  size="md"
                />
              }
              label={creator.name}
              description={`@${creator.username}`}
              endContent={
                <div data-testid={`follow-suggested-${creator.id}`}>
                  <Button
                    size="sm"
                    variant={creator.isFollowed ? 'secondary' : 'primary'}
                    label={creator.isFollowed ? 'Following' : 'Follow'}
                    onClick={() => onToggleFollow(creator.id)}
                  />
                </div>
              }
            />
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

export default WhoToFollowCard;
