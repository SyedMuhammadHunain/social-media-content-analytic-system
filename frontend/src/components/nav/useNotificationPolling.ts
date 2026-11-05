// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Polling Hook (Dynamic for Every User)

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, type Notification, type NotificationType } from '../../api/notificationsApi.ts';
import type { UserProfile } from '../../types/social.ts';
import {
  loadStoredNotifications,
  loadStoredUnreadCount,
  saveStoredNotifications,
} from './notificationStorage.ts';
import {
  generateDynamicNotificationsForUser,
  buildSimulatedAlert,
  getAvailableActorsForUser,
  isSelfActor,
  normalizeIdentity,
  type CandidateActor,
  BASE_PLATFORM_ACTORS,
} from './notificationGenerator.ts';
import { fetchLiveOrDefaultNotifications } from './notificationFetcher.ts';

export {
  generateDynamicNotificationsForUser,
  getAvailableActorsForUser,
  isSelfActor,
  normalizeIdentity,
  BASE_PLATFORM_ACTORS,
  type CandidateActor,
};

function resolveUserIdentity(userOrId?: UserProfile | string | null) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  const userName = typeof userOrId === 'object' && userOrId ? userOrId.name : undefined;
  const userUsername = typeof userOrId === 'object' && userOrId ? userOrId.username : undefined;
  return { userId, userName, userUsername };
}

interface InteractionDetail {
  notification?: Notification;
  actorName?: string;
  type?: NotificationType;
  recipientUserId?: string;
}

function createLiveNotification(detail: InteractionDetail, userId: string): Notification {
  if (detail.notification) return detail.notification;
  return {
    id: `live_${Date.now()}`,
    recipientUserId: userId,
    actorUserId: 'actor_live',
    actorName: detail.actorName || 'A creator',
    type: detail.type || 'LIKE',
    message: `${detail.actorName || 'A creator'} interacted with your content.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function useNotificationPolling(
  userOrId?: UserProfile | string | null,
  availableUsers?: Array<{ id: string; name?: string; username?: string; avatarUrl?: string; avatar?: string }>
) {
  const { userId, userName, userUsername } = resolveUserIdentity(userOrId);
  const [notifications, setNotifications] = useState<Notification[]>(() => loadStoredNotifications(userId));
  const [unreadCount, setUnreadCount] = useState<number>(() => loadStoredUnreadCount(userId));

  const [trackedUserId, setTrackedUserId] = useState(userId);
  if (userId !== trackedUserId) {
    setTrackedUserId(userId);
    const cachedItems = loadStoredNotifications(userId);
    setNotifications(cachedItems);
    setUnreadCount(cachedItems.filter((n) => !n.read).length);
  }

  const activeUserIdRef = useRef<string | undefined>(userId);
  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

  const saveToStorage = useCallback((uid: string, items: Notification[]) => {
    saveStoredNotifications(uid, items);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const syncNotifications = async () => {
      const items = await fetchLiveOrDefaultNotifications(
        userId,
        { id: userId, name: userName, username: userUsername },
        availableUsers
      );
      if (!isMounted || activeUserIdRef.current !== userId) return;

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
      saveToStorage(userId, items);
    };

    syncNotifications();
    const interval = setInterval(syncNotifications, 10000);

    const handleNewInteraction = (e: Event) => {
      const customEvt = e as CustomEvent<{ recipientUserId: string }>;
      if (!customEvt.detail || customEvt.detail.recipientUserId !== userId) return;

      const newNotif = createLiveNotification(customEvt.detail, userId);
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        saveToStorage(userId, next);
        return next;
      });
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener('social:new-notification', handleNewInteraction);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('social:new-notification', handleNewInteraction);
    };
  }, [userId, userName, userUsername, availableUsers, saveToStorage]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(userId, next);
      return next;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsApi.markAsRead(id);
    } catch {}
  }, [userId, saveToStorage]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(userId, next);
      return next;
    });
    setUnreadCount(0);
    try {
      await notificationsApi.markAllAsRead(userId);
    } catch {}
  }, [userId, saveToStorage]);

  const simulateDynamicAlert = useCallback(() => {
    if (!userId) return;
    const alertNotif = buildSimulatedAlert(
      userId,
      { id: userId, name: userName, username: userUsername },
      availableUsers
    );

    setNotifications((prev) => {
      const next = [alertNotif, ...prev];
      saveToStorage(userId, next);
      return next;
    });
    setUnreadCount((prev) => prev + 1);

    notificationsApi
      .triggerNotification({
        recipientUserId: userId,
        actorUserId: alertNotif.actorUserId,
        actorName: alertNotif.actorName,
        actorAvatar: alertNotif.actorAvatar,
        type: alertNotif.type,
        message: alertNotif.message,
      })
      .catch(() => {});
  }, [userId, userName, userUsername, availableUsers, saveToStorage]);

  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    simulateDynamicAlert,
  };
}
