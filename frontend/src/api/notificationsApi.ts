// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notifications API Client (CT-263 Section 10.1, 10.3, 10.4, 10.6)

import { api } from './client.ts';

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW';

export interface Notification {
  id: string;
  recipientUserId: string;
  actorUserId: string;
  actorName: string;
  actorAvatar?: string;
  type: NotificationType;
  targetPostId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationRequest {
  recipientUserId: string;
  actorUserId: string;
  actorName?: string;
  actorAvatar?: string;
  type: NotificationType;
  targetPostId?: string;
  message: string;
}

export const notificationsApi = {
  getNotifications(userId: string): Promise<Notification[]> {
    const encoded = encodeURIComponent(userId);
    return api.get<Notification[]>(`/v1/notifications/${encoded}`);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const encoded = encodeURIComponent(userId);
    const res = await api.get<{ userId: string; unreadCount: number }>(
      `/v1/notifications/${encoded}/unread-count`
    );
    return res.unreadCount;
  },

  markAsRead(id: string): Promise<Notification> {
    const encoded = encodeURIComponent(id);
    return api.put<Notification>(`/v1/notifications/${encoded}/read`);
  },

  async markAllAsRead(userId: string): Promise<number> {
    const encoded = encodeURIComponent(userId);
    const res = await api.put<{ userId: string; markedCount: number }>(
      `/v1/notifications/${encoded}/read-all`
    );
    return res.markedCount;
  },

  triggerNotification(request: NotificationRequest): Promise<Notification> {
    return api.post<Notification>('/v1/notifications', request);
  },
};
