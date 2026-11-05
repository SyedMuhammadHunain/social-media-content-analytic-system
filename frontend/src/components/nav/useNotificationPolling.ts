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

export {
  generateDynamicNotificationsForUser,
  getAvailableActorsForUser,
  isSelfActor,
  normalizeIdentity,
  BASE_PLATFORM_ACTORS,
  type CandidateActor,
};

export function useNotificationPolling(
  userOrId?: UserProfile | string | null,
  availableUsers?: Array<{ id: string; name?: string; username?: string; avatarUrl?: string; avatar?: string }>
) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  const userName = typeof userOrId === 'object' && userOrId ? userOrId.name : undefined;
  const userUsername = typeof userOrId === 'object' && userOrId ? userOrId.username : undefined;

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

    const fetchNotifications = async () => {
      try {
        const list = await notificationsApi.getNotifications(userId);
        if (!isMounted || activeUserIdRef.current !== userId) return;

        if (list && list.length > 0) {
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.read).length);
          saveToStorage(userId, list);
        } else {
          const dynamicList = generateDynamicNotificationsForUser(
            { id: userId, name: userName, username: userUsername },
            availableUsers
          );
          if (activeUserIdRef.current === userId) {
            setNotifications(dynamicList);
            setUnreadCount(dynamicList.filter((n) => !n.read).length);
            saveToStorage(userId, dynamicList);
          }
        }
      } catch {
        if (isMounted && activeUserIdRef.current === userId) {
          setNotifications((prev) => {
            if (prev.length > 0 && prev[0]?.recipientUserId === userId) return prev;
            const dynamicList = generateDynamicNotificationsForUser(
              { id: userId, name: userName, username: userUsername },
              availableUsers
            );
            saveToStorage(userId, dynamicList);
            return dynamicList;
          });
          setUnreadCount((prev) => (prev > 0 ? prev : 3));
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    const handleNewInteraction = (e: Event) => {
      const customEvt = e as CustomEvent<{
        recipientUserId: string;
        notification?: Notification;
        actorName?: string;
        type?: NotificationType;
      }>;
      if (!customEvt.detail || customEvt.detail.recipientUserId !== userId) return;
      const newNotif: Notification = customEvt.detail.notification || {
        id: `live_${Date.now()}`,
        recipientUserId: userId,
        actorUserId: 'actor_live',
        actorName: customEvt.detail.actorName || 'A creator',
        type: customEvt.detail.type || 'LIKE',
        message: `${customEvt.detail.actorName || 'A creator'} interacted with your content.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
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
