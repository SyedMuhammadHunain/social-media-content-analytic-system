// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Generator

import type { Notification, NotificationType } from '../../api/notificationsApi.ts';
import {
  type CandidateActor,
  type TargetUserIdentity,
  type AdditionalActor,
  BASE_PLATFORM_ACTORS,
  normalizeIdentity,
  isSelfActor,
  getAvailableActorsForUser,
} from './notificationActors.ts';

export type { CandidateActor, AdditionalActor, TargetUserIdentity };
export {
  BASE_PLATFORM_ACTORS,
  normalizeIdentity,
  isSelfActor,
  getAvailableActorsForUser,
};

export function generateDynamicNotificationsForUser(
  user: TargetUserIdentity,
  availableUsers?: AdditionalActor[]
): Notification[] {
  const normId = user.id || 'usr_default';
  const actors = getAvailableActorsForUser(user, availableUsers);
  const now = Date.now();

  const [a1, a2, a3, a4] = [
    actors[0],
    actors[1 % actors.length],
    actors[2 % actors.length],
    actors[3 % actors.length],
  ];

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

function resolveAlertMessage(chosenType: NotificationType, actorName: string): string {
  if (chosenType === 'LIKE') return `${actorName} liked your recent post!`;
  if (chosenType === 'COMMENT') return `${actorName} commented: "Brilliant real-time analytics implementation!"`;
  return `${actorName} started following you.`;
}

export function buildSimulatedAlert(
  userId: string,
  user: TargetUserIdentity,
  availableUsers?: AdditionalActor[]
): Notification {
  const actors = getAvailableActorsForUser(user, availableUsers);
  const actor = actors[Math.floor(Math.random() * actors.length)];
  const types: NotificationType[] = ['LIKE', 'COMMENT', 'FOLLOW'];
  const chosenType = types[Math.floor(Math.random() * types.length)];

  return {
    id: `sim_${Date.now()}`,
    recipientUserId: userId,
    actorUserId: actor.id,
    actorName: actor.name,
    actorAvatar: actor.avatar,
    type: chosenType,
    message: resolveAlertMessage(chosenType, actor.name),
    read: false,
    createdAt: new Date().toISOString(),
  };
}
