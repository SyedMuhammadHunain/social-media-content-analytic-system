// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Account Storage

import type { UserProfile } from '../types/social.ts';
import { SEED_ACCOUNTS, type AuthUserAccount } from '../mock/authSeedData.ts';
import type { DemoUserSummary } from './auth-context-def.ts';

export const AUTH_STORAGE_KEY = 'smcas_session_user';
export const TOKEN_STORAGE_KEY = 'smcas_auth_token';
export const ACCOUNTS_STORAGE_KEY = 'social_accounts_v1';

export const DEFAULT_DEMO_USERS: DemoUserSummary[] = [
  {
    id: 'user_hunain',
    username: 'hunain',
    name: 'Syed Muhammad Hunain',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'Staff Infrastructure Architect • Distributed Media Systems',
  },
  {
    id: 'user_alice',
    username: 'alice',
    name: 'Alice Walker',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'Distributed Systems & Cloud Lead',
  },
  {
    id: 'user_bob',
    username: 'bob',
    name: 'Bob Creator',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Creative Media Director & Video Producer',
  },
  {
    id: 'user_charlie',
    username: 'charlie',
    name: 'Charlie Dev',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'Full-Stack Engineer & Reactive Microservices Dev',
  },
  {
    id: 'usr_alex_01',
    username: 'alex_chen_ai',
    name: 'Alex Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'AI Systems Architect & LLM Engineer',
  },
  {
    id: 'usr_alex_02',
    username: 'alex_distrib',
    name: 'Alex Rivera',
    avatarUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    headline: 'Principal Distributed Systems Engineer',
  },
];

export function loadStoredUser(): UserProfile | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function saveStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {}
}

export function loadStoredAccounts(): AuthUserAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const storedIds = new Set(parsed.map((p) => p.user.id));
        const missingSeeds = SEED_ACCOUNTS.filter((s) => !storedIds.has(s.user.id));
        return [...parsed, ...missingSeeds];
      }
    }
  } catch {}
  return SEED_ACCOUNTS;
}

export function saveStoredAccounts(accounts: AuthUserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

export function loadStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {}
  return null;
}

export function saveStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

export function findAccount(
  accounts: AuthUserAccount[],
  identifier: string,
  password?: string
): AuthUserAccount | undefined {
  const normalized = identifier.trim().toLowerCase();
  return accounts.find((a) => {
    const matchesId =
      a.email.toLowerCase() === normalized ||
      a.user.username.toLowerCase() === normalized ||
      a.user.id.toLowerCase() === normalized;
    return password !== undefined ? matchesId && a.passwordHash === password : matchesId;
  });
}
