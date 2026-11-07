// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Center Column Notifications View

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { useAuth } from '../../context/useAuth';
import { notificationsApi, type Notification } from '../../api/notificationsApi';
import { MessagesNavIcon } from '../feed/astryxMobileIcons';

export interface NotificationListPageProps {
  onOpenChatWithUser?: (actorUserId: string, actorName?: string, actorAvatar?: string) => void;
}

function formatNotificationDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotificationListPage({ onOpenChatWithUser }: NotificationListPageProps = {}) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        if (!currentUser?.id) {
          if (mounted) setIsLoading(false);
          return;
        }
        const items = await notificationsApi.getNotifications(currentUser.id);
        if (mounted) {
          setNotifications(items);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        if (mounted) setIsLoading(false);
      }
    };
    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    try {
      await notificationsApi.markAllAsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    const upper = type.toUpperCase();
    switch (upper) {
      case 'LIKE':
        return <Icon icon="check" size="xsm" color="secondary" />;
      case 'COMMENT':
        return <Icon icon="info" size="xsm" color="secondary" />;
      case 'FOLLOW':
        return <Icon icon="checkDouble" size="xsm" color="secondary" />;
      case 'MESSAGE':
        return <Icon icon={MessagesNavIcon} size="xsm" color="primary" />;
      default:
        return <Icon icon="info" size="xsm" color="secondary" />;
    }
  };

  return (
    <Card padding={5} style={{ width: '100%', minWidth: 0 }}>
      <VStack gap={4}>
        {/* Header */}
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon="info" size="md" color="secondary" />
            <Heading level={3}>Notifications</Heading>
            {unreadCount > 0 && (
              <Badge variant="neutral" label={`${unreadCount} New`} />
            )}
          </HStack>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              label="Mark all as read"
              icon={<Icon icon="check" size="xsm" />}
              onClick={handleMarkAllRead}
            />
          )}
        </HStack>

        <Divider />

        {/* Notifications Stream */}
        {isLoading ? (
          <VStack gap={3}>
            <Text type="body" color="secondary">
              Loading notifications...
            </Text>
          </VStack>
        ) : notifications.length === 0 ? (
          <VStack gap={2} hAlign="center" style={{ padding: '32px 0' }}>
            <Icon icon="info" size="lg" color="secondary" />
            <Text type="body" weight="semibold">
              No notifications yet
            </Text>
            <Text type="supporting" color="secondary">
              When someone likes, comments, or follows you, you will see it here.
            </Text>
          </VStack>
        ) : (
          <VStack gap={2}>
            {notifications.map((item) => (
              <Card
                key={item.id}
                padding={3}
                style={{
                  width: '100%',
                  opacity: item.read ? 0.75 : 1,
                  cursor: item.read ? 'default' : 'pointer',
                }}
                onClick={() => {
                  if (!item.read) handleMarkRead(item.id);
                  if (item.type.toUpperCase() === 'MESSAGE') {
                    onOpenChatWithUser?.(item.actorUserId, item.actorName, item.actorAvatar);
                  }
                }}
              >
                <HStack gap={3} vAlign="center" hAlign="between">
                  <HStack gap={3} vAlign="center">
                    <Avatar
                      size="md"
                      name={item.actorName || 'User'}
                      src={item.actorAvatar || undefined}
                    />
                    <VStack gap={1}>
                      <HStack gap={1} vAlign="center">
                        {getNotificationIcon(item.type)}
                        <Text type="body" weight={item.read ? 'normal' : 'bold'}>
                          {item.message || `${item.actorName} interacted with your post`}
                        </Text>
                      </HStack>
                      <Text type="supporting" color="secondary">
                        {formatNotificationDate(item.createdAt)}
                      </Text>
                    </VStack>
                  </HStack>

                  {!item.read && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-text-primary, #FFFFFF)',
                      }}
                    />
                  )}
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
}

export default NotificationListPage;
