// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Actor Resolver

import {
  type CandidateActor,
  type AdditionalActor,
  BASE_PLATFORM_ACTORS,
  FALLBACK_ACTORS,
} from './notificationActorData.ts';

export type { CandidateActor, AdditionalActor };
export { BASE_PLATFORM_ACTORS };

export interface TargetUserIdentity {
  id?: string;
  name?: string;
  username?: string;
}

export function normalizeIdentity(idOrName?: string): string {
  if (!idOrName) return '';
  return idOrName.toLowerCase().replace(/^(user_|usr_)/, '').trim();
}

function matchesId(actor: CandidateActor, user: TargetUserIdentity): boolean {
  if (!user.id) return false;
  if (actor.id.toLowerCase().trim() === user.id.toLowerCase().trim()) return true;
  return normalizeIdentity(actor.id) === normalizeIdentity(user.id);
}

function matchesName(actor: CandidateActor, user: TargetUserIdentity): boolean {
  if (!user.name) return false;
  return actor.name.toLowerCase().trim() === user.name.toLowerCase().trim();
}

function matchesHandle(actor: CandidateActor, user: TargetUserIdentity): boolean {
  const targetHandle = normalizeIdentity(user.username || user.name);
  if (!targetHandle) return false;
  const actorHandle = normalizeIdentity(actor.handle || actor.name);
  if (actorHandle === targetHandle) return true;
  return normalizeIdentity(actor.id) === targetHandle;
}

export function isSelfActor(
  actor: CandidateActor,
  user: TargetUserIdentity
): boolean {
  if (matchesId(actor, user)) return true;
  if (matchesName(actor, user)) return true;
  return matchesHandle(actor, user);
}

function createExtraActor(item: AdditionalActor): CandidateActor {
  return {
    id: item.id,
    name: item.name || item.username || 'Creator',
    avatar: item.avatarUrl || item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    handle: item.username,
  };
}

function appendExtraActors(pool: CandidateActor[], additional?: AdditionalActor[]) {
  if (!additional) return;
  const existing = new Set(pool.map((p) => normalizeIdentity(p.id)));
  for (const item of additional) {
    if (!item?.id) continue;
    const norm = normalizeIdentity(item.id);
    if (!existing.has(norm)) {
      existing.add(norm);
      pool.push(createExtraActor(item));
    }
  }
}

export function getAvailableActorsForUser(
  user: TargetUserIdentity,
  additionalActors?: AdditionalActor[]
): CandidateActor[] {
  const pool = [...BASE_PLATFORM_ACTORS];
  appendExtraActors(pool, additionalActors);

  const filtered = pool.filter((actor) => !isSelfActor(actor, user));
  if (filtered.length >= 2) return filtered;

  return [...filtered, ...FALLBACK_ACTORS];
}
