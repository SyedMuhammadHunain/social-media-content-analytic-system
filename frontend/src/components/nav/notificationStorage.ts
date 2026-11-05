// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Local Storage

import type { Notification } from '../../api/notificationsApi.ts';

export const NOTIF_STORAGE_PREFIX = 'social_notifications_store_';

export function loadStoredNotifications(userId?: string): Notification[] {
  if (!userId) return [];
  try {
    const cached = localStorage.getItem(`${NOTIF_STORAGE_PREFIX}${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached) as Notification[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

export function loadStoredUnreadCount(userId?: string): number {
  if (!userId) return 0;
  try {
    const cached = localStorage.getItem(`${NOTIF_STORAGE_PREFIX}${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached) as Notification[];
      if (Array.isArray(parsed)) return parsed.filter((n) => !n.read).length;
    }
  } catch {}
  return 0;
}

export function saveStoredNotifications(userId: string, items: Notification[]): void {
  try {
    localStorage.setItem(`${NOTIF_STORAGE_PREFIX}${userId}`, JSON.stringify(items));
  } catch {}
}
