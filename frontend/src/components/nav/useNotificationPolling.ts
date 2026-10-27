// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Polling Hook

'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, type Notification } from '../../api/notificationsApi.ts';

export function useNotificationPolling(userId?: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const list = await notificationsApi.getNotifications(userId);
        if (isMounted) {
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.read).length);
        }
      } catch {
        // Offline fallback
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Offline fallback
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (userId) {
      try {
        await notificationsApi.markAllAsRead(userId);
      } catch {
        // Offline fallback
      }
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
