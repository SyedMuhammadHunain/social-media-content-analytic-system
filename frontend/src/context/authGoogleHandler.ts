// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google OAuth Handler

import { authApi } from '../api/authApi.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';

export interface GoogleAuthParams {
  name: string;
  email: string;
  avatarUrl?: string;
  googleId?: string;
}

export interface GoogleAuthResult {
  user: UserProfile;
  token: string;
  account: AuthUserAccount;
}

export const GOOGLE_OAUTH_PREFIX = 'goog_oauth_';

export function deriveDeterministicGoogleId(email: string, explicitId?: string): string {
  return explicitId || `goog_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

const DEFAULT_GOOGLE_ACCOUNT: GoogleAuthParams = {
  name: 'Syed Muhammad Hunain',
  email: 'hunain.google@gmail.com',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  googleId: 'google_1082938472910',
};

export async function executeGoogleLogin(
  inputAccount?: GoogleAuthParams,
  accounts: AuthUserAccount[] = []
): Promise<GoogleAuthResult> {
  const account = inputAccount || DEFAULT_GOOGLE_ACCOUNT;
  const cleanEmail = account.email.trim().toLowerCase();
  const cleanUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_goog';
  const deterministicGoogleId = account.googleId || `goog_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const googlePassword = `goog_oauth_${deterministicGoogleId}`;

  // 1. Try to log in with existing account on Gateway
  try {
    const loginRes = await authApi.login({
      usernameOrEmail: cleanEmail,
      password: googlePassword,
    });

    if (loginRes && loginRes.token) {
      const userProfile: UserProfile = {
        id: loginRes.userId,
        username: loginRes.username,
        name: loginRes.fullName || account.name,
        avatarUrl: loginRes.avatarUrl || account.avatarUrl,
        coverBannerUrl: loginRes.coverBannerUrl || '',
        isFollowed: false,
        headline: 'Verified Google Creator',
        tags: ['Google Verified', 'Creator'],
        bio: loginRes.bio || `Authenticated via Google (${account.email})`,
        followerCount: 0,
        followingCount: 0,
      };
      return {
        user: userProfile,
        token: loginRes.token,
        account: { user: userProfile, email: cleanEmail, passwordHash: googlePassword },
      };
    }
  } catch {
    // Proceed to register
  }

  // 2. Try to register new user on Gateway
  try {
    const regRes = await authApi.register({
      username: cleanUsername,
      email: cleanEmail,
      password: googlePassword,
      fullName: account.name,
      authProvider: 'GOOGLE',
      avatarUrl: account.avatarUrl,
    });

    if (regRes && regRes.token) {
      const userProfile: UserProfile = {
        id: regRes.userId,
        username: regRes.username,
        name: regRes.fullName || account.name,
        avatarUrl: regRes.avatarUrl || account.avatarUrl,
        coverBannerUrl: regRes.coverBannerUrl || '',
        isFollowed: false,
        headline: 'Verified Google Creator',
        tags: ['Google Verified', 'Creator'],
        bio: regRes.bio || `Authenticated via Google (${account.email})`,
        followerCount: 0,
        followingCount: 0,
      };
      return {
        user: userProfile,
        token: regRes.token,
        account: { user: userProfile, email: cleanEmail, passwordHash: googlePassword },
      };
    }
  } catch {
    // Fall through to offline mock login
  }

  // 3. Seamless offline Google profile creation/re-login
  const existingOffline = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existingOffline) {
    const mockToken = `goog_token_${existingOffline.user.id}`;
    return {
      user: existingOffline.user,
      token: mockToken,
      account: existingOffline,
    };
  }

  const offlineProfile: UserProfile = {
    id: `usr_${deterministicGoogleId}`,
    username: cleanUsername,
    name: account.name,
    avatarUrl: account.avatarUrl,
    coverBannerUrl: '',
    isFollowed: false,
    headline: 'Verified Google Creator',
    tags: ['Google Verified', 'Creator'],
    bio: `Authenticated via Google (${account.email})`,
    followerCount: 0,
    followingCount: 0,
  };

  const mockToken = `goog_token_${offlineProfile.id}`;
  return {
    user: offlineProfile,
    token: mockToken,
    account: { user: offlineProfile, email: cleanEmail, passwordHash: googlePassword },
  };
}
