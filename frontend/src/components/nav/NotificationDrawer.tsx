// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Drawer (CT-263 Gap 1)

'use client';

import { useState, type FC } from 'react';
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
  onSimulateNotification?: () => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; variant: BadgeVariant; icon: any }
> = {
  LIKE: { label: 'Like', variant: 'pink', icon: HeartIcon },
  COMMENT: { label: 'Comment', variant: 'blue', icon: ChatBubbleBottomCenterTextIcon },
  FOLLOW: { label: 'Follow', variant: 'teal', icon: UserPlusIcon },
};

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return 'Recent';
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
  onSimulateNotification,
}) => {
  const [filter, setFilter] = useState<'ALL' | NotificationType>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const likesCount = notifications.filter((n) => n.type === 'LIKE').length;
  const commentsCount = notifications.filter((n) => n.type === 'COMMENT').length;
  const followsCount = notifications.filter((n) => n.type === 'FOLLOW').length;

  return (
    <Drawer
      data-testid="notifications-drawer"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      label="Notifications"
      side="end"
      width={440}
    >
      <Layout
        header={
          <DrawerHeader
            title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            subtitle="Real-time dynamic alerts for likes, comments, and follows"
            onOpenChange={onOpenChange}
            endContent={
              <HStack gap={2} vAlign="center">
                {onSimulateNotification && (
                  <Button
                    data-testid="simulate-notif-btn"
                    label="+ Alert"
                    variant="secondary"
                    size="sm"
                    onClick={onSimulateNotification}
                  />
                )}
                {unreadCount > 0 && (
                  <Button
                    data-testid="mark-all-read-btn"
                    label="Mark all read"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={CheckIcon} size="xsm" />}
                    onClick={onMarkAllAsRead}
                  />
                )}
              </HStack>
            }
          />
        }
        content={
          <LayoutContent>
            <div style={{ padding: '16px' }}>
              {/* Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  data-testid="filter-all"
                  onClick={() => setFilter('ALL')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: filter === 'ALL' ? 'var(--color-primary, #1877F2)' : 'rgba(255, 255, 255, 0.06)',
                    color: filter === 'ALL' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  data-testid="filter-likes"
                  onClick={() => setFilter('LIKE')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: filter === 'LIKE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: filter === 'LIKE' ? '#FB7185' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Likes ({likesCount})
                </button>
                <button
                  type="button"
                  data-testid="filter-comments"
                  onClick={() => setFilter('COMMENT')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: filter === 'COMMENT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: filter === 'COMMENT' ? '#60A5FA' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Comments ({commentsCount})
                </button>
                <button
                  type="button"
                  data-testid="filter-follows"
                  onClick={() => setFilter('FOLLOW')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: filter === 'FOLLOW' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: filter === 'FOLLOW' ? '#2DD4BF' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Follows ({followsCount})
                </button>
              </div>

              {filteredNotifications.length === 0 ? (
                <VStack gap={4} hAlign="center" style={{ padding: '32px 0' }}>
                  <EmptyState
                    icon={<Icon icon={BellIcon} size="lg" color="secondary" />}
                    title={filter === 'ALL' ? 'No notifications yet' : `No ${filter.toLowerCase()} notifications`}
                    description="When users interact with your content, real-time alerts will appear here."
                  />
                  {onSimulateNotification && (
                    <Button
                      data-testid="simulate-empty-btn"
                      label="Simulate Alert"
                      variant="primary"
                      size="sm"
                      onClick={onSimulateNotification}
                    />
                  )}
                </VStack>
              ) : (
                <VStack gap={3}>
                  {filteredNotifications.map((n) => {
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
                                {formatRelativeTime(n.createdAt)}
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
