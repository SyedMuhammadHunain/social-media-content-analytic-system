// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Fetcher Subroutine

import { notificationsApi, type Notification } from '../../api/notificationsApi.ts';
import { generateDynamicNotificationsForUser, type TargetUserIdentity } from './notificationGenerator.ts';
import type { AdditionalActor } from './notificationActors.ts';

export async function fetchLiveOrDefaultNotifications(
  userId: string,
  user: TargetUserIdentity,
  availableUsers?: AdditionalActor[]
): Promise<Notification[]> {
  try {
    const list = await notificationsApi.getNotifications(userId);
    if (list && list.length > 0) return list;
  } catch {
    // Offline gateway fallback
  }
  return generateDynamicNotificationsForUser(user, availableUsers);
}
