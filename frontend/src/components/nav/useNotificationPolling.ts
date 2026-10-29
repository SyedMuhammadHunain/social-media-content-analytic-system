// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Polling Hook (Dynamic for Every User)

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, type Notification, type NotificationType } from '../../api/notificationsApi.ts';
import type { UserProfile } from '../../types/social.ts';

const NOTIF_STORAGE_PREFIX = 'social_notifications_store_';

export interface CandidateActor {
  id: string;
  name: string;
  avatar?: string;
  handle?: string;
}

export const BASE_PLATFORM_ACTORS: CandidateActor[] = [
  {
    id: 'user_hunain',
    name: 'Syed Muhammad Hunain',
    handle: 'hunain',
    avatar: 'https://avatars.githubusercontent.com/u/108502392?v=4',
  },
  {
    id: 'user_afzal',
    name: 'Afzal Khan (Verified Lead)',
    handle: 'afzal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user_alice',
    name: 'Alice Walker',
    handle: 'alice',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'user_bob',
    name: 'Bob Creator',
    handle: 'bob',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Davis',
    handle: 'charlie',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  },
];

export function normalizeIdentity(idOrName?: string): string {
  if (!idOrName) return '';
  return idOrName.toLowerCase().replace(/^(user_|usr_)/, '').trim();
}

export function isSelfActor(
  actor: CandidateActor,
  user: { id?: string; name?: string; username?: string }
): boolean {
  const normUserRawId = (user.id || '').toLowerCase().trim();
  const normUserId = normalizeIdentity(user.id);
  const normUserName = (user.name || '').toLowerCase().trim();
  const normUserHandle = normalizeIdentity(user.username || user.name);

  const normActorRawId = actor.id.toLowerCase().trim();
  const normActorId = normalizeIdentity(actor.id);
  const normActorName = actor.name.toLowerCase().trim();
  const normActorHandle = normalizeIdentity(actor.handle || actor.name);

  if (normUserRawId && normActorRawId === normUserRawId) return true;
  if (normUserId && normActorId === normUserId) return true;
  if (normUserName && normActorName === normUserName) return true;
  if (normUserHandle && (normActorHandle === normUserHandle || normActorId === normUserHandle)) return true;

  return false;
}

export function getAvailableActorsForUser(
  user: { id?: string; name?: string; username?: string },
  additionalActors?: Array<{ id: string; name?: string; username?: string; avatarUrl?: string; avatar?: string }>
): CandidateActor[] {
  const pool: CandidateActor[] = [...BASE_PLATFORM_ACTORS];

  if (additionalActors && Array.isArray(additionalActors)) {
    for (const add of additionalActors) {
      if (!add?.id) continue;
      const exists = pool.some((p) => normalizeIdentity(p.id) === normalizeIdentity(add.id));
      if (!exists) {
        pool.push({
          id: add.id,
          name: add.name || add.username || 'Creator',
          avatar: add.avatarUrl || add.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          handle: add.username,
        });
      }
    }
  }

  const filtered = pool.filter((actor) => !isSelfActor(actor, user));

  if (filtered.length >= 2) {
    return filtered;
  }

  return [
    ...filtered,
    {
      id: 'usr_meta_dev',
      name: 'Dev Community Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      handle: 'community',
    },
    {
      id: 'usr_cloud_arch',
      name: 'Cloud Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      handle: 'architect',
    },
  ];
}

export function generateDynamicNotificationsForUser(
  user: { id?: string; name?: string; username?: string },
  availableUsers?: Array<{ id: string; name?: string; username?: string; avatarUrl?: string; avatar?: string }>
): Notification[] {
  const normId = user.id || 'usr_default';
  const actors = getAvailableActorsForUser(user, availableUsers);
  const now = Date.now();

  const a1 = actors[0];
  const a2 = actors[1 % actors.length];
  const a3 = actors[2 % actors.length];
  const a4 = actors[3 % actors.length];

  return [
    {
      id: `notif_${normId}_1`,
      recipientUserId: normId,
      actorUserId: a1.id,
      actorName: a1.name,
      actorAvatar: a1.avatar,
      type: 'LIKE',
      targetPostId: 'post_dyn_1',
      message: `${a1.name} liked your latest post: 'Building scalable microservices with Meta Astryx.'`,
      read: false,
      createdAt: new Date(now - 6 * 60 * 1000).toISOString(),
    },
    {
      id: `notif_${normId}_2`,
      recipientUserId: normId,
      actorUserId: a2.id,
      actorName: a2.name,
      actorAvatar: a2.avatar,
      type: 'COMMENT',
      targetPostId: 'post_dyn_1',
      message: `${a2.name} commented: 'Excellent architecture and distributed system insights!'`,
      read: false,
      createdAt: new Date(now - 22 * 60 * 1000).toISOString(),
    },
    {
      id: `notif_${normId}_3`,
      recipientUserId: normId,
      actorUserId: a3.id,
      actorName: a3.name,
      actorAvatar: a3.avatar,
      type: 'FOLLOW',
      message: `${a3.name} started following you.`,
      read: false,
      createdAt: new Date(now - 55 * 60 * 1000).toISOString(),
    },
    {
      id: `notif_${normId}_4`,
      recipientUserId: normId,
      actorUserId: a4.id,
      actorName: a4.name,
      actorAvatar: a4.avatar,
      type: 'LIKE',
      targetPostId: 'post_dyn_2',
      message: `${a4.name} liked your post: 'High-Throughput Analytics & Real-Time Feed.'`,
      read: true,
      createdAt: new Date(now - 120 * 60 * 1000).toISOString(),
    },
  ];
}

export function useNotificationPolling(
  userOrId?: UserProfile | string | null,
  availableUsers?: Array<{ id: string; name?: string; username?: string; avatarUrl?: string; avatar?: string }>
) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  const userName = typeof userOrId === 'object' && userOrId ? userOrId.name : undefined;
  const userUsername = typeof userOrId === 'object' && userOrId ? userOrId.username : undefined;

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (!userId) return [];
    try {
      const cached = localStorage.getItem(`${NOTIF_STORAGE_PREFIX}${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached) as Notification[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    if (!userId) return 0;
    try {
      const cached = localStorage.getItem(`${NOTIF_STORAGE_PREFIX}${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached) as Notification[];
        if (Array.isArray(parsed)) return parsed.filter((n) => !n.read).length;
      }
    } catch {}
    return 0;
  });

  // Track user switch during render to immediately isolate state without cascading renders
  const [trackedUserId, setTrackedUserId] = useState(userId);
  if (userId !== trackedUserId) {
    setTrackedUserId(userId);
    let cachedItems: Notification[] = [];
    if (userId) {
      try {
        const cached = localStorage.getItem(`${NOTIF_STORAGE_PREFIX}${userId}`);
        if (cached) {
          const parsed = JSON.parse(cached) as Notification[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedItems = parsed;
          }
        }
      } catch {}
    }
    setNotifications(cachedItems);
    setUnreadCount(cachedItems.filter((n) => !n.read).length);
  }

  const activeUserIdRef = useRef<string | undefined>(userId);
  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

  const saveToStorage = useCallback((uid: string, items: Notification[]) => {
    try {
      localStorage.setItem(`${NOTIF_STORAGE_PREFIX}${uid}`, JSON.stringify(items));
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

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
          // If empty, generate dynamic personalized notifications for this user
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
        // Fallback to local dynamic generation
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

    // Listen for real-time interaction events from feed actions
    const handleNewInteraction = (e: Event) => {
      const customEvt = e as CustomEvent<{
        recipientUserId: string;
        notification?: Notification;
        actorName?: string;
        type?: NotificationType;
      }>;
      if (!customEvt.detail) return;
      if (customEvt.detail.recipientUserId === userId) {
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
      }
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
    const actors = getAvailableActorsForUser(
      { id: userId, name: userName, username: userUsername },
      availableUsers
    );
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const types: NotificationType[] = ['LIKE', 'COMMENT', 'FOLLOW'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let msg = '';
    if (chosenType === 'LIKE') {
      msg = `${actor.name} liked your recent post!`;
    } else if (chosenType === 'COMMENT') {
      msg = `${actor.name} commented: "Brilliant real-time analytics implementation!"`;
    } else {
      msg = `${actor.name} started following you.`;
    }

    const alertNotif: Notification = {
      id: `sim_${Date.now()}`,
      recipientUserId: userId,
      actorUserId: actor.id,
      actorName: actor.name,
      actorAvatar: actor.avatar,
      type: chosenType,
      message: msg,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const next = [alertNotif, ...prev];
      saveToStorage(userId, next);
      return next;
    });
    setUnreadCount((prev) => prev + 1);

    notificationsApi
      .triggerNotification({
        recipientUserId: userId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorAvatar: actor.avatar,
        type: chosenType,
        message: msg,
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
