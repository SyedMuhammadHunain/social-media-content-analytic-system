// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Register Handler

import { authApi } from '../api/authApi.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';
import type { AuthOperationResult } from './authLoginHandler.ts';

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  accounts: AuthUserAccount[];
}

function buildNewUserProfile(id: string, username: string, fullName?: string, avatarUrl?: string): UserProfile {
  return {
    id,
    username,
    name: fullName || username,
    avatarUrl: avatarUrl || '',
    coverBannerUrl: '',
    isFollowed: false,
    headline: 'Social Media Creator',
    tags: ['Creator', 'Meta Astryx'],
    bio: 'Excited to join the Social Media Content Analysis System platform!',
    followerCount: 0,
    followingCount: 0,
  };
}

function hasMissingFields(username: string, email: string, password: string): boolean {
  if (!username) return true;
  if (!email) return true;
  return !password;
}

function isConflictError(err: any): boolean {
  if (err?.status === 409) return true;
  if (err?.status === 400) return true;
  return err?.name === 'ApiError';
}

function isAccountDuplicate(accounts: AuthUserAccount[], email: string, username: string): boolean {
  const normEmail = email.toLowerCase();
  const normUser = username.toLowerCase();
  const emailTaken = accounts.some((a) => a.email.toLowerCase() === normEmail);
  const userTaken = accounts.some((a) => a.user.username.toLowerCase() === normUser);
  return emailTaken || userTaken;
}

async function attemptGatewayRegister(cleanUsername: string, cleanEmail: string, password: string): Promise<AuthOperationResult | null> {
  try {
    const res = await authApi.register({
      username: cleanUsername,
      email: cleanEmail,
      password,
      fullName: cleanUsername,
    });
    if (res?.token) {
      const newUser = buildNewUserProfile(res.userId, res.username, res.fullName, res.avatarUrl);
      return {
        success: true,
        user: newUser,
        token: res.token,
        account: { user: newUser, email: cleanEmail, passwordHash: password },
      };
    }
  } catch (err: any) {
    if (isConflictError(err)) {
      return { success: false, error: err.message || 'Account with this email or username already exists.' };
    }
  }
  return null;
}

export async function executeRegister(params: RegisterParams): Promise<AuthOperationResult> {
  const { username, email, password, accounts } = params;
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  if (hasMissingFields(cleanUsername, cleanEmail, password)) {
    return { success: false, error: 'All fields are required.' };
  }

  const gatewayResult = await attemptGatewayRegister(cleanUsername, cleanEmail, password);
  if (gatewayResult) {
    return gatewayResult;
  }

  if (isAccountDuplicate(accounts, cleanEmail, cleanUsername)) {
    return { success: false, error: 'Account with this email or username already exists.' };
  }

  const fallbackUser = buildNewUserProfile(`usr_${Date.now()}`, cleanUsername);
  return {
    success: true,
    user: fallbackUser,
    token: `mock_token_${fallbackUser.id}`,
    account: { user: fallbackUser, email: cleanEmail, passwordHash: password },
  };
}
