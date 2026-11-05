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

interface GoogleContext {
  cleanEmail: string;
  cleanUsername: string;
  googlePassword: string;
  account: GoogleAuthParams;
}

interface ProfileFields {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
  coverBannerUrl?: string;
  bio?: string;
}

interface AuthResponseDto {
  userId: string;
  username: string;
  token: string;
  fullName?: string;
  avatarUrl?: string;
  coverBannerUrl?: string;
  bio?: string;
}

function buildGoogleUserProfile(fields: ProfileFields): UserProfile {
  return {
    id: fields.id,
    username: fields.username,
    name: fields.name,
    avatarUrl: fields.avatarUrl,
    coverBannerUrl: fields.coverBannerUrl || '',
    isFollowed: false,
    headline: 'Verified Google Creator',
    tags: ['Google Verified', 'Creator'],
    bio: fields.bio || `Authenticated via Google (${fields.email})`,
    followerCount: 0,
    followingCount: 0,
  };
}

function createGoogleAuthResult(res: AuthResponseDto, ctx: GoogleContext): GoogleAuthResult {
  const user = buildGoogleUserProfile({
    id: res.userId,
    username: res.username,
    name: res.fullName || ctx.account.name,
    email: ctx.account.email,
    avatarUrl: res.avatarUrl || ctx.account.avatarUrl,
    coverBannerUrl: res.coverBannerUrl,
    bio: res.bio,
  });
  return {
    user,
    token: res.token,
    account: { user, email: ctx.cleanEmail, passwordHash: ctx.googlePassword },
  };
}

function prepareGoogleContext(inputAccount?: GoogleAuthParams): GoogleContext {
  const account = inputAccount || DEFAULT_GOOGLE_ACCOUNT;
  const cleanEmail = account.email.trim().toLowerCase();
  const cleanUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_goog';
  const deterministicGoogleId = deriveDeterministicGoogleId(cleanEmail, account.googleId);
  const googlePassword = `${GOOGLE_OAUTH_PREFIX}${deterministicGoogleId}`;

  return { cleanEmail, cleanUsername, googlePassword, account };
}

async function attemptGoogleGatewayLogin(ctx: GoogleContext): Promise<GoogleAuthResult | null> {
  try {
    const res = await authApi.login({
      usernameOrEmail: ctx.cleanEmail,
      password: ctx.googlePassword,
    });

    if (res?.token) {
      return createGoogleAuthResult(res, ctx);
    }
  } catch {
    // Proceed to register
  }
  return null;
}

async function attemptGoogleGatewayRegister(ctx: GoogleContext): Promise<GoogleAuthResult | null> {
  try {
    const res = await authApi.register({
      username: ctx.cleanUsername,
      email: ctx.cleanEmail,
      password: ctx.googlePassword,
      fullName: ctx.account.name,
      authProvider: 'GOOGLE',
      avatarUrl: ctx.account.avatarUrl,
    });

    if (res?.token) {
      return createGoogleAuthResult(res, ctx);
    }
  } catch {
    // Fall through to offline mock login
  }
  return null;
}

function resolveOfflineGoogleLogin(ctx: GoogleContext, accounts: AuthUserAccount[]): GoogleAuthResult {
  const existingOffline = accounts.find((a) => a.email.toLowerCase() === ctx.cleanEmail);
  if (existingOffline) {
    return {
      user: existingOffline.user,
      token: `goog_token_${existingOffline.user.id}`,
      account: existingOffline,
    };
  }

  const deterministicId = deriveDeterministicGoogleId(ctx.cleanEmail, ctx.account.googleId);
  const offlineProfile = buildGoogleUserProfile({
    id: `usr_${deterministicId}`,
    username: ctx.cleanUsername,
    name: ctx.account.name,
    email: ctx.account.email,
    avatarUrl: ctx.account.avatarUrl,
  });

  return {
    user: offlineProfile,
    token: `goog_token_${offlineProfile.id}`,
    account: { user: offlineProfile, email: ctx.cleanEmail, passwordHash: ctx.googlePassword },
  };
}

export async function executeGoogleLogin(
  inputAccount?: GoogleAuthParams,
  accounts: AuthUserAccount[] = []
): Promise<GoogleAuthResult> {
  const ctx = prepareGoogleContext(inputAccount);

  const loginResult = await attemptGoogleGatewayLogin(ctx);
  if (loginResult) {
    return loginResult;
  }

  const registerResult = await attemptGoogleGatewayRegister(ctx);
  if (registerResult) {
    return registerResult;
  }

  return resolveOfflineGoogleLogin(ctx, accounts);
}
