// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Viewers Modal

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { ProfileViewer } from '../../utils/profileActivityStore';

export interface ProfileViewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewers: ProfileViewer[];
  totalViews: number;
  onViewProfile?: (viewer: ProfileViewer) => void;
}

export function ProfileViewersModal({
  isOpen,
  onClose,
  viewers,
  totalViews,
  onViewProfile,
}: ProfileViewersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="profile-viewers-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <Card padding={5}>
          <VStack gap={4} align="stretch">
            {/* Header */}
            <HStack hAlign="between" vAlign="center">
              <HStack gap={2} vAlign="center">
                <Icon icon={EyeIcon} size="md" color="accent" />
                <VStack gap={0}>
                  <Heading level={3}>Who's Viewed Your Profile</Heading>
                  <Text type="supporting" color="secondary">
                    {totalViews} profile view{totalViews === 1 ? '' : 's'} recorded
                  </Text>
                </VStack>
              </HStack>

              <Button
                label="Close"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XMarkIcon} size="xsm" />}
                onClick={onClose}
                aria-label="Close modal"
              />
            </HStack>

            <Divider />

            {/* Viewers List */}
            <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {viewers.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <Text type="body" color="secondary">
                    No profile views recorded yet. As other community members explore your profile, their activity will appear here.
                  </Text>
                </div>
              ) : (
                <VStack gap={2} align="stretch">
                  {viewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      style={{
                        borderRadius: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06))',
                        padding: '4px',
                      }}
                    >
                      <Item
                        density="compact"
                        startContent={
                          <Avatar
                            name={viewer.name}
                            src={viewer.avatarUrl || undefined}
                            size="md"
                          />
                        }
                        label={viewer.name}
                        description={`@${viewer.username} • ${viewer.headline || 'Active Member'}`}
                        endContent={
                          <HStack gap={2} vAlign="center">
                            <Text type="supporting" color="secondary" size="sm">
                              {viewer.viewedAt}
                            </Text>
                            {onViewProfile && (
                              <Button
                                size="sm"
                                variant="secondary"
                                label="View Profile"
                                onClick={() => {
                                  onViewProfile(viewer);
                                  onClose();
                                }}
                              />
                            )}
                          </HStack>
                        }
                      />
                    </div>
                  ))}
                </VStack>
              )}
            </div>

            <Divider />

            {/* Footer */}
            <HStack hAlign="end">
              <Button label="Close" variant="secondary" size="sm" onClick={onClose} />
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
}

export default ProfileViewersModal;
