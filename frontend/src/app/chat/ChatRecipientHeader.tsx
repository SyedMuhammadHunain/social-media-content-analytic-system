// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Recipient Identity Bar & Profile Header

'use client';

import { useState } from 'react';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import type { UserProfile } from '../../types/social';

interface ChatRecipientHeaderProps {
  participant: UserProfile;
  onBack?: () => void;
  onViewProfile?: (user: UserProfile) => void;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K followers`;
  return `${count} followers`;
}

export function ChatProfilePresentation({
  participant,
  onViewProfile,
}: {
  participant: UserProfile;
  onViewProfile?: (user: UserProfile) => void;
}) {
  const [isFollowed, setIsFollowed] = useState<boolean>(participant.isFollowed ?? false);

  const handleToggleFollow = () => {
    setIsFollowed((prev) => !prev);
  };

  return (
    <div
      data-testid="chat-recipient-pinned-profile"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 20px',
        textAlign: 'center',
      }}
    >
      <Avatar
        name={participant.name}
        src={participant.avatarUrl}
        size="xl"
      />

      <div style={{ marginTop: 12 }}>
        <Heading level={3}>
          {participant.username}
        </Heading>
      </div>

      <Text type="supporting" color="secondary" size="sm" style={{ marginTop: 4 }}>
        {participant.name} {participant.headline ? `• ${participant.headline}` : ''}
      </Text>

      <Text type="supporting" color="secondary" size="xsm" style={{ marginTop: 2 }}>
        {formatFollowers(participant.followerCount)}
      </Text>

      {participant.bio && (
        <div style={{ maxWidth: 420, marginTop: 8 }}>
          <Text size="sm" color="secondary">
            {participant.bio}
          </Text>
        </div>
      )}

      <HStack gap={3} align="center" justify="center" style={{ marginTop: 16 }}>
        <Button
          label="View profile"
          variant="secondary"
          size="sm"
          data-testid="chat-view-profile-btn"
          onClick={() => onViewProfile && onViewProfile(participant)}
        />

        <Button
          label={isFollowed ? 'Following' : 'Follow'}
          variant={isFollowed ? 'secondary' : 'primary'}
          size="sm"
          data-testid="chat-follow-toggle-btn"
          onClick={handleToggleFollow}
        />
      </HStack>
    </div>
  );
}

export function ChatRecipientHeader({
  participant,
  onBack,
  onViewProfile,
}: ChatRecipientHeaderProps) {
  return (
    <div
      data-testid="chat-recipient-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'var(--color-background-body, #111111)',
      }}
    >
      {/* Top Identity App Bar (Fixed at top of chat thread) */}
      <div
        data-testid="chat-top-identity-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <HStack gap={2} align="center">
          {onBack && (
            <IconButton
              variant="ghost"
              size="sm"
              label="Back"
              data-testid="chat-back-button"
              onClick={onBack}
              icon={<Icon icon="chevronLeft" size="sm" />}
            />
          )}
          <Avatar
            name={participant.name}
            src={participant.avatarUrl}
            size="sm"
          />
          <div
            onClick={() => onViewProfile && onViewProfile(participant)}
            style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
          >
            <VStack gap={0}>
              <Text weight="bold" size="sm">
                {participant.username}
              </Text>
              <Text type="supporting" color="secondary" size="xsm">
                {participant.name} {participant.headline ? `• ${participant.headline}` : ''}
              </Text>
            </VStack>
          </div>
        </HStack>
      </div>
    </div>
  );
}

export default ChatRecipientHeader;
