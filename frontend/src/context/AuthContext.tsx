// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Authentication Context

'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/social';
import { SEED_ACCOUNTS, type AuthUserAccount } from '../mock/authSeedData';
import { AuthContext } from './auth-context-def';
export type { AuthContextType } from './auth-context-def';

const AUTH_STORAGE_KEY = 'smcas_session_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [accounts, setAccounts] = useState<AuthUserAccount[]>(SEED_ACCOUNTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate async network latency
    await new Promise((r) => setTimeout(r, 150));

    const normalized = emailOrUsername.trim().toLowerCase();
    const account = accounts.find(
      (a) =>
        (a.email.toLowerCase() === normalized ||
          a.user.username.toLowerCase() === normalized) &&
        a.passwordHash === password
    );

    setIsLoading(false);

    if (account) {
      setCurrentUser(account.user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account.user));
      } catch {}
      return true;
    } else {
      setError('Invalid username/email or password. Please try again.');
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 150));

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !password) {
      setIsLoading(false);
      setError('All fields are required.');
      return false;
    }

    if (
      accounts.some(
        (a) =>
          a.email.toLowerCase() === cleanEmail.toLowerCase() ||
          a.user.username.toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      setIsLoading(false);
      setError('Account with this email or username already exists.');
      return false;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      name: cleanUsername,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
      headline: 'Social Media Creator',
      tags: ['Creator', 'Meta Astryx'],
      bio: 'Excited to join the Social Media Content Analysis System platform!',
      followerCount: 0,
      followingCount: 0,
    };

    const newAccount: AuthUserAccount = {
      user: newUser,
      email: cleanEmail,
      passwordHash: password,
    };

    setAccounts((prev) => [...prev, newAccount]);
    setCurrentUser(newUser);
    setIsLoading(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

