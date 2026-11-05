// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Login Handlers

import { authApi } from '../api/authApi.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import type { UserProfile } from '../types/social.ts';
import { findAccount } from './authAccountStorage.ts';
import { executeRegister, type RegisterParams } from './authRegisterHandler.ts';

export { executeRegister, type RegisterParams };

export interface AuthOperationResult {
  success: boolean;
  user?: UserProfile;
  token?: string;
  account?: AuthUserAccount;
  error?: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  accounts: AuthUserAccount[];
}

interface LoginAttemptContext {
  normalized: string;
  password: string;
  accounts: AuthUserAccount[];
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

const DEFAULT_BIO = 'Active creator on Social Media Content Analysis System';

function resolveProfileTemplate(seedMatch?: AuthUserAccount): Partial<UserProfile> {
  if (seedMatch) return seedMatch.user;
  return {
    isFollowed: false,
    headline: 'Social Media Creator',
    tags: ['Creator', 'Meta Astryx'],
    followerCount: 0,
    followingCount: 0,
  };
}

interface GatewayResponseLike {
  userId: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  coverBannerUrl?: string;
  bio?: string;
}

function pickText(primary?: string, secondary?: string, def = ''): string {
  if (primary) return primary;
  if (secondary) return secondary;
  return def;
}

function buildGatewayProfile(res: GatewayResponseLike, seedMatch?: AuthUserAccount): UserProfile {
  const seedUser = seedMatch ? seedMatch.user : undefined;
  const base = resolveProfileTemplate(seedMatch);

  return {
    ...base,
    id: res.userId,
    username: res.username,
    name: pickText(res.fullName, seedUser ? seedUser.name : undefined, res.username),
    avatarUrl: pickText(res.avatarUrl, seedUser ? seedUser.avatarUrl : undefined, DEFAULT_AVATAR),
    coverBannerUrl: pickText(res.coverBannerUrl, seedUser ? seedUser.coverBannerUrl : undefined, ''),
    bio: pickText(res.bio, seedUser ? seedUser.bio : undefined, DEFAULT_BIO),
  } as UserProfile;
}

function isAuthenticationError(err: any): boolean {
  if (err?.status === 401) return true;
  return err?.name === 'ApiError';
}

function findMatchingAccount(accounts: AuthUserAccount[], normalized: string, userId: string) {
  const byName = findAccount(accounts, normalized);
  if (byName) return byName;
  return findAccount(accounts, userId);
}

function handleLoginError(err: any, ctx: LoginAttemptContext): AuthOperationResult | null {
  const localMatch = findAccount(ctx.accounts, ctx.normalized, ctx.password);
  if (!isAuthenticationError(err)) return null;
  if (localMatch) return null;
  return {
    success: false,
    error: err?.message || 'Invalid username/email or password. Please try again.',
  };
}

async function attemptGatewayLogin(ctx: LoginAttemptContext): Promise<AuthOperationResult | null> {
  try {
    const res = await authApi.login({ usernameOrEmail: ctx.normalized, password: ctx.password });
    if (res?.token) {
      const seedMatch = findMatchingAccount(ctx.accounts, ctx.normalized, res.userId);
      const user = buildGatewayProfile(res, seedMatch);
      const email = seedMatch ? seedMatch.email : ctx.normalized;
      return {
        success: true,
        user,
        token: res.token,
        account: { user, email, passwordHash: ctx.password },
      };
    }
  } catch (err: any) {
    return handleLoginError(err, ctx);
  }
  return null;
}

function attemptLocalFallbackLogin(ctx: LoginAttemptContext): AuthOperationResult | null {
  const localAccount = findAccount(ctx.accounts, ctx.normalized, ctx.password);
  if (localAccount) {
    return {
      success: true,
      user: localAccount.user,
      token: `mock_token_${localAccount.user.id}`,
    };
  }
  return null;
}

export async function executeLogin(credentials: LoginCredentials): Promise<AuthOperationResult> {
  const ctx: LoginAttemptContext = {
    normalized: credentials.emailOrUsername.trim().toLowerCase(),
    password: credentials.password,
    accounts: credentials.accounts,
  };

  const gatewayResult = await attemptGatewayLogin(ctx);
  if (gatewayResult) {
    return gatewayResult;
  }

  const localResult = attemptLocalFallbackLogin(ctx);
  if (localResult) {
    return localResult;
  }

  return { success: false, error: 'Invalid username/email or password. Please try again.' };
}
