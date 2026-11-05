// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Profile & Demo Users Sync

import { authApi } from '../api/authApi.ts';
import { normalizeBackendUserId, SEED_ACCOUNTS } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';
import type { DemoUserSummary } from './auth-context-def.ts';
import { DEFAULT_DEMO_USERS } from './authAccountStorage.ts';

export async function fetchDemoUsersWithFallback(): Promise<DemoUserSummary[]> {
  try {
    const users = await authApi.getDemoUsers();
    if (!users || users.length === 0) return DEFAULT_DEMO_USERS;

    const mapped: DemoUserSummary[] = users.map((u) => {
      const matchedSeed = SEED_ACCOUNTS.find(
        (a) => a.user.id === u.id || a.user.username.toLowerCase() === u.username.toLowerCase()
      );
      return {
        id: u.id,
        username: u.username,
        name: u.name || (matchedSeed ? matchedSeed.user.name : u.username),
        avatarUrl: u.avatarUrl || (matchedSeed ? matchedSeed.user.avatarUrl : undefined),
        headline: matchedSeed?.user.headline,
      };
    });

    const existingIds = new Set(mapped.map((m) => m.id));
    const preservedAdditional = DEFAULT_DEMO_USERS.filter((d) => !existingIds.has(d.id));
    return [...mapped, ...preservedAdditional];
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
