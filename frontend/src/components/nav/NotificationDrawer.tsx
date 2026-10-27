// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Drawer (CT-263 Gap 1)

'use client';

import type { FC } from 'react';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { Layout, LayoutContent, VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge, type BadgeVariant } from '@astryxdesign/core/Badge';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Icon } from '@astryxdesign/core/Icon';
import {
  BellIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  UserPlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

import type { Notification, NotificationType } from '../../api/notificationsApi.ts';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; variant: BadgeVariant; icon: any }
> = {
  LIKE: { label: 'Like', variant: 'pink', icon: HeartIcon },
  COMMENT: { label: 'Comment', variant: 'blue', icon: ChatBubbleBottomCenterTextIcon },
  FOLLOW: { label: 'Follow', variant: 'teal', icon: UserPlusIcon },
};

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recent';
  }
}

export const NotificationDrawer: FC<NotificationDrawerProps> = ({
  isOpen,
  onOpenChange,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <Drawer
      data-testid="notifications-drawer"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      label="Notifications"
      side="end"
      width={420}
    >
      <Layout
        header={
          <DrawerHeader
            title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            subtitle="Real-time alerts for likes, comments, and follows"
            onOpenChange={onOpenChange}
            endContent={
              unreadCount > 0 ? (
                <Button
                  data-testid="mark-all-read-btn"
                  label="Mark all read"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={CheckIcon} size="xsm" />}
                  onClick={onMarkAllAsRead}
                />
              ) : undefined
            }
          />
        }
        content={
          <LayoutContent>
            <div style={{ padding: '16px' }}>
              {notifications.length === 0 ? (
                <EmptyState
                  icon={<Icon icon={BellIcon} size="lg" color="secondary" />}
                  title="No notifications yet"
                  description="When users like your posts, comment, or follow you, updates will appear here."
                />
              ) : (
                <VStack gap={3}>
                  {notifications.map((n) => {
                    const typeCfg = TYPE_CONFIG[n.type] || {
                      label: n.type,
                      variant: 'neutral' as BadgeVariant,
                      icon: BellIcon,
                    };

                    return (
                      <div
                        key={n.id}
                        data-testid={`notification-item-${n.id}`}
                        onClick={() => {
                          if (!n.read) onMarkAsRead(n.id);
                        }}
                        style={{
                          backgroundColor: n.read
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'rgba(24, 119, 242, 0.08)',
                          borderRadius: 8,
                          padding: '12px 14px',
                          border: n.read
                            ? '1px solid rgba(255, 255, 255, 0.06)'
                            : '1px solid rgba(24, 119, 242, 0.28)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <VStack gap={2}>
                          <HStack hAlign="between" vAlign="center">
                            <HStack gap={2} vAlign="center">
                              <Avatar
                                name={n.actorName}
                                src={n.actorAvatar}
                                size="sm"
                              />
                              <Text type="body">
                                <strong>{n.actorName}</strong>
                              </Text>
                              <Badge
                                variant={typeCfg.variant}
                                label={typeCfg.label}
                                icon={<Icon icon={typeCfg.icon} size="xsm" />}
                              />
                            </HStack>

                            <HStack gap={2} vAlign="center">
                              <Text type="supporting" color="secondary">
                                {formatTimestamp(n.createdAt)}
                              </Text>
                              {!n.read && (
                                <span
                                  data-testid={`unread-dot-${n.id}`}
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--astryx-color-primary, #1877F2)',
                                    display: 'inline-block',
                                  }}
                                  title="Unread"
                                />
                              )}
                            </HStack>
                          </HStack>

                          <div style={{ paddingLeft: 36 }}>
                            <Text type="body">{n.message}</Text>
                          </div>

                          {!n.read && (
                            <HStack hAlign="end">
                              <Button
                                data-testid={`mark-read-btn-${n.id}`}
                                label="Mark as read"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(n.id);
                                }}
                              />
                            </HStack>
                          )}
                        </VStack>
                      </div>
                    );
                  })}
                </VStack>
              )}
            </div>
          </LayoutContent>
        }
      />
    </Drawer>
  );
};
