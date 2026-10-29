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
  const storageKey = `${STORAGE_PREFIX}${cleanId || cleanUsername}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.connections === 'number' && typeof parsed?.views === 'number') {
        return {
          connections: parsed.connections,
          views: parsed.views,
          viewers: Array.isArray(parsed.viewers) ? parsed.viewers : [],
        };
      }
    }
  } catch {}

  // Initial calculation for users without saved activity
  const baseline = BASELINE_ACTIVITY[cleanId] || BASELINE_ACTIVITY[cleanUsername];
  const initialConnections = baseline ? baseline.connections : (followingCount || 0);
  const initialViews = baseline ? baseline.views : 0;
  const initialViewers = baseline ? DEFAULT_COMMUNITY_VIEWERS : [];

  const initialData: ProfileActivityData = {
    connections: initialConnections,
    views: initialViews,
    viewers: initialViewers,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(initialData));
  } catch {}

  return initialData;
}

export function recordProfileView(
  targetUser: { id: string; name: string; username: string; avatarUrl?: string; headline?: string },
  viewerUser?: { id: string; name: string; username: string; avatarUrl?: string; headline?: string } | null
): ProfileActivityData {
  if (typeof window === 'undefined') {
    return { connections: 0, views: 0, viewers: [] };
  }

  const current = getProfileActivity(targetUser.id, targetUser.username);

  // If viewing own profile, return without adding self
  if (viewerUser && (viewerUser.id === targetUser.id || viewerUser.username === targetUser.username)) {
    return current;
  }

  const newViews = current.views + 1;
  const newViewers = [...current.viewers];

  if (viewerUser) {
    // Remove if previously in viewers to move to top
    const filtered = newViewers.filter((v) => v.id !== viewerUser.id && v.username !== viewerUser.username);
    filtered.unshift({
      id: viewerUser.id,
      name: viewerUser.name,
      username: viewerUser.username,
      avatarUrl: viewerUser.avatarUrl,
      headline: viewerUser.headline || 'Active Member',
      viewedAt: 'Just now',
    });
    // Keep max 20 viewers
    newViewers.length = 0;
    newViewers.push(...filtered.slice(0, 20));
  }

  const updated: ProfileActivityData = {
    connections: current.connections,
    views: newViews,
    viewers: newViewers,
  };

  const cleanId = (targetUser.id || '').trim().toLowerCase();
  const storageKey = `${STORAGE_PREFIX}${cleanId || (targetUser.username || '').toLowerCase()}`;

  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('profile-activity-updated', { detail: { userId: targetUser.id } }));
  } catch {}

  return updated;
}

export function recordConnectionChange(userId: string, delta: number, username?: string): void {
  if (typeof window === 'undefined') return;
  const current = getProfileActivity(userId, username);
  const updated: ProfileActivityData = {
    ...current,
    connections: Math.max(0, current.connections + delta),
  };

  const cleanId = (userId || '').trim().toLowerCase();
  const storageKey = `${STORAGE_PREFIX}${cleanId || (username || '').toLowerCase()}`;

  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('profile-activity-updated', { detail: { userId } }));
  } catch {}
}
