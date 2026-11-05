// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dynamic Profile Activity & Viewers Store

export interface ProfileViewer {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  headline?: string;
  viewedAt: string;
}

export interface ProfileActivityData {
  connections: number;
  views: number;
  viewers: ProfileViewer[];
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  headline?: string;
}

interface UserIdentity {
  userId?: string;
  username?: string;
}

interface BaselineQuery {
  id: string;
  username: string;
  followingCount: number;
}

const STORAGE_PREFIX = 'smcas_profile_activity_';

const BASELINE_ACTIVITY: Record<string, { connections: number; views: number }> = {
  usr_me_01: { connections: 149, views: 73 },
  user_hunain: { connections: 149, views: 73 },
  hunain_creator: { connections: 149, views: 73 },
  hunain: { connections: 149, views: 73 },
  user_alice: { connections: 94, views: 42 },
  alice: { connections: 94, views: 42 },
  user_bob: { connections: 230, views: 118 },
  bob: { connections: 230, views: 118 },
  user_charlie: { connections: 68, views: 29 },
  charlie: { connections: 68, views: 29 },
  afzal: { connections: 85, views: 36 },
  afzal_user: { connections: 85, views: 36 },
};

const DEFAULT_COMMUNITY_VIEWERS: ProfileViewer[] = [
  {
    id: 'user_hunain',
    name: 'Syed Muhammad Hunain',
    username: 'hunain_creator',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'Staff Infrastructure Architect',
    viewedAt: '12m ago',
  },
  {
    id: 'user_alice',
    name: 'Alice Walker',
    username: 'alice_growth',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'Product Growth Lead',
    viewedAt: '1h ago',
  },
  {
    id: 'user_bob',
    name: 'Bob Martin',
    username: 'bob_infra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior Cloud Architect',
    viewedAt: '3h ago',
  },
];

function resolveStorageKey(identity: UserIdentity): string {
  const cleanId = (identity.userId || '').trim().toLowerCase();
  const cleanUsername = (identity.username || '').trim().toLowerCase();
  const suffix = cleanId || cleanUsername;
  return `${STORAGE_PREFIX}${suffix}`;
}

function readStoredActivity(key: string): ProfileActivityData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.connections !== 'number') return null;
    if (typeof parsed?.views !== 'number') return null;
    return {
      connections: parsed.connections,
      views: parsed.views,
      viewers: Array.isArray(parsed.viewers) ? parsed.viewers : [],
    };
  } catch {
    return null;
  }
}

function persistActivity(storageKey: string, data: ProfileActivityData, eventUserId?: string): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (eventUserId) {
      window.dispatchEvent(
        new CustomEvent('profile-activity-updated', { detail: { userId: eventUserId } })
      );
    }
  } catch {}
}

function resolveBaselineActivity(query: BaselineQuery): ProfileActivityData {
  const baseline = BASELINE_ACTIVITY[query.id] || BASELINE_ACTIVITY[query.username];
  if (baseline) {
    return {
      connections: baseline.connections,
      views: baseline.views,
      viewers: DEFAULT_COMMUNITY_VIEWERS,
    };
  }
  return {
    connections: query.followingCount,
    views: 0,
    viewers: [],
  };
}

function isSelfView(
  target: UserSummary,
  viewer?: UserSummary | null
): boolean {
  if (!viewer) return false;
  if (viewer.id === target.id) return true;
  return viewer.username === target.username;
}

function prependViewer(viewers: ProfileViewer[], viewer: UserSummary): ProfileViewer[] {
  const filtered = viewers.filter((v) => v.id !== viewer.id && v.username !== viewer.username);
  const newEntry: ProfileViewer = {
    id: viewer.id,
    name: viewer.name,
    username: viewer.username,
    avatarUrl: viewer.avatarUrl,
    headline: viewer.headline || 'Active Member',
    viewedAt: 'Just now',
  };
  return [newEntry, ...filtered].slice(0, 20);
}

export function getProfileActivity(
  userId: string,
  username?: string,
  followingCount: number = 0
): ProfileActivityData {
  if (typeof window === 'undefined') {
    return { connections: followingCount, views: 0, viewers: [] };
  }

  const cleanId = (userId || '').trim().toLowerCase();
  const cleanUsername = (username || '').trim().toLowerCase();
  const storageKey = resolveStorageKey({ userId: cleanId, username: cleanUsername });

  const existing = readStoredActivity(storageKey);
  if (existing) {
    return existing;
  }

  const initialData = resolveBaselineActivity({
    id: cleanId,
    username: cleanUsername,
    followingCount,
  });
  persistActivity(storageKey, initialData);
  return initialData;
}

export function recordProfileView(
  targetUser: UserSummary,
  viewerUser?: UserSummary | null
): ProfileActivityData {
  if (typeof window === 'undefined') {
    return { connections: 0, views: 0, viewers: [] };
  }

  const current = getProfileActivity(targetUser.id, targetUser.username);

  if (isSelfView(targetUser, viewerUser)) {
    return current;
  }

  const newViewers = viewerUser ? prependViewer(current.viewers, viewerUser) : current.viewers;

  const updated: ProfileActivityData = {
    connections: current.connections,
    views: current.views + 1,
    viewers: newViewers,
  };

  const storageKey = resolveStorageKey({ userId: targetUser.id, username: targetUser.username });
  persistActivity(storageKey, updated, targetUser.id);
  return updated;
}

export function recordConnectionChange(userId: string, delta: number, username?: string): void {
  if (typeof window === 'undefined') return;
  const current = getProfileActivity(userId, username);
  const updated: ProfileActivityData = {
    ...current,
    connections: Math.max(0, current.connections + delta),
  };

  const storageKey = resolveStorageKey({ userId, username });
  persistActivity(storageKey, updated, userId);
}
