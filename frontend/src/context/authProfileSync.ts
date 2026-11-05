// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Profile & Demo Users Sync

import { authApi } from '../api/authApi.ts';
import { normalizeBackendUserId, SEED_ACCOUNTS } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';
import type { DemoUserSummary } from './auth-context-def.ts';
import { DEFAULT_DEMO_USERS } from './authAccountStorage.ts';

function matchSeedAccount(id: string, username: string) {
  const normUser = username.toLowerCase();
  return SEED_ACCOUNTS.find((a) => a.user.id === id || a.user.username.toLowerCase() === normUser);
}

function mapRawUserToDemoSummary(u: { id: string; username: string; name?: string; avatarUrl?: string }): DemoUserSummary {
  const matched = matchSeedAccount(u.id, u.username);
  const name = u.name || matched?.user.name || u.username;
  const avatarUrl = u.avatarUrl || matched?.user.avatarUrl;
  return {
    id: u.id,
    username: u.username,
    name,
    avatarUrl,
    headline: matched?.user.headline,
  };
}

export async function fetchDemoUsersWithFallback(): Promise<DemoUserSummary[]> {
  try {
    const users = await authApi.getDemoUsers();
    if (!users || users.length === 0) return DEFAULT_DEMO_USERS;

    const mapped = users.map(mapRawUserToDemoSummary);
    const existingIds = new Set(mapped.map((m) => m.id));
    const preserved = DEFAULT_DEMO_USERS.filter((d) => !existingIds.has(d.id));
    return [...mapped, ...preserved];
  } catch {
    return DEFAULT_DEMO_USERS;
  }
}

export async function syncProfileUpdate(activeUser: UserProfile): Promise<DemoUserSummary[] | null> {
  try {
    const backendUserId = normalizeBackendUserId(activeUser.id);
    await authApi.updateProfile({
      userId: backendUserId,
      fullName: activeUser.name,
      avatarUrl: activeUser.avatarUrl,
      bio: activeUser.bio,
      coverBannerUrl: activeUser.coverBannerUrl,
    });

    const users = await authApi.getDemoUsers();
    if (users && users.length > 0) {
      return users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        avatarUrl: u.avatarUrl,
      }));
    }
  } catch (e) {
    console.warn('Failed to sync profile update to backend:', e);
  }
  return null;
}
