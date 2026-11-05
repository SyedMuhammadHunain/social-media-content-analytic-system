// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Login & Register Handlers

import { authApi } from '../api/authApi.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';
import { findAccount } from './authAccountStorage.ts';

export interface AuthOperationResult {
  success: boolean;
  user?: UserProfile;
  token?: string;
  account?: AuthUserAccount;
  error?: string;
}

export async function executeLogin(
  emailOrUsername: string,
  password: string,
  accounts: AuthUserAccount[]
): Promise<AuthOperationResult> {
  const normalized = emailOrUsername.trim().toLowerCase();

  try {
    const res = await authApi.login({ usernameOrEmail: normalized, password });
    if (res && res.token) {
      const seedMatch = findAccount(accounts, normalized) || findAccount(accounts, res.userId);
      const profile: UserProfile = {
        ...(seedMatch ? seedMatch.user : {
          isFollowed: false,
          headline: 'Social Media Creator',
          tags: ['Creator', 'Meta Astryx'],
          followerCount: 0,
          followingCount: 0,
        }),
        id: res.userId,
        username: res.username,
        name: res.fullName || seedMatch?.user.name || res.username,
        avatarUrl: res.avatarUrl || seedMatch?.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        coverBannerUrl: res.coverBannerUrl || seedMatch?.user.coverBannerUrl || '',
        bio: res.bio || seedMatch?.user.bio || 'Active creator on Social Media Content Analysis System',
      };
      return {
        success: true,
        user: profile,
        token: res.token,
        account: { user: profile, email: seedMatch?.email || normalized, passwordHash: password },
      };
    }
  } catch (err: any) {
    const isAuthErr = err?.status === 401 || err?.name === 'ApiError';
    const localMatch = findAccount(accounts, normalized, password);
    if (isAuthErr && !localMatch) {
      return { success: false, error: err?.message || 'Invalid username/email or password. Please try again.' };
    }
  }

  const localAccount = findAccount(accounts, normalized, password);
  if (localAccount) {
    return {
      success: true,
      user: localAccount.user,
      token: `mock_token_${localAccount.user.id}`,
    };
  }

  return { success: false, error: 'Invalid username/email or password. Please try again.' };
}

export async function executeRegister(
  username: string,
  email: string,
  password: string,
  accounts: AuthUserAccount[]
): Promise<AuthOperationResult> {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  if (!cleanUsername || !cleanEmail || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const res = await authApi.register({ username: cleanUsername, email: cleanEmail, password, fullName: cleanUsername });
    if (res && res.token) {
      const newUser: UserProfile = {
        id: res.userId,
        username: res.username,
        name: res.fullName || res.username,
        avatarUrl: res.avatarUrl || '',
        coverBannerUrl: '',
        isFollowed: false,
        headline: 'Social Media Creator',
        tags: ['Creator', 'Meta Astryx'],
        bio: 'Excited to join the Social Media Content Analysis System platform!',
        followerCount: 0,
        followingCount: 0,
      };
      return {
        success: true,
        user: newUser,
        token: res.token,
        account: { user: newUser, email: cleanEmail, passwordHash: password },
      };
    }
  } catch (err: any) {
    const isConflict = err?.status === 409 || err?.status === 400 || err?.name === 'ApiError';
    if (isConflict) {
      return { success: false, error: err.message || 'Account with this email or username already exists.' };
    }
  }

  const emailTaken = accounts.some((a) => a.email.toLowerCase() === cleanEmail.toLowerCase());
  const userTaken = accounts.some((a) => a.user.username.toLowerCase() === cleanUsername.toLowerCase());
  if (emailTaken || userTaken) {
    return { success: false, error: 'Account with this email or username already exists.' };
  }

  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    username: cleanUsername,
    name: cleanUsername,
    avatarUrl: '',
    coverBannerUrl: '',
    isFollowed: false,
    headline: 'Social Media Creator',
    tags: ['Creator', 'Meta Astryx'],
    bio: 'Excited to join the Social Media Content Analysis System platform!',
    followerCount: 0,
    followingCount: 0,
  };

  return {
    success: true,
    user: newUser,
    token: `mock_token_${newUser.id}`,
    account: { user: newUser, email: cleanEmail, passwordHash: password },
  };
}
