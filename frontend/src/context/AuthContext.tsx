// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Authentication Context

'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/social.ts';
import { SEED_ACCOUNTS, type AuthUserAccount } from '../mock/authSeedData.ts';
import { AuthContext, type DemoUserSummary } from './auth-context-def.ts';
import { authApi } from '../api/authApi.ts';
import { setAuthToken } from '../api/client.ts';

export type { AuthContextType, DemoUserSummary } from './auth-context-def.ts';

const AUTH_STORAGE_KEY = 'smcas_session_user';
const TOKEN_STORAGE_KEY = 'smcas_auth_token';

const DEFAULT_DEMO_USERS: DemoUserSummary[] = [
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
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [accounts, setAccounts] = useState<AuthUserAccount[]>(SEED_ACCOUNTS);
  const [demoUsers, setDemoUsers] = useState<DemoUserSummary[]>(DEFAULT_DEMO_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  // Restore stored token if present
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        setAuthToken(token);
      }
    } catch {}
  }, []);

  // Fetch demo users from API Gateway with graceful fallback
  useEffect(() => {
    let isMounted = true;
    authApi
      .getDemoUsers()
      .then((users) => {
        if (!isMounted || !users || users.length === 0) return;
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
        setDemoUsers(mapped);
      })
      .catch(() => {
        // Gateway offline: silently retain DEFAULT_DEMO_USERS
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clearError = () => setError(null);
  const clearLogoutMessage = () => setLogoutMessage(null);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);

    const normalized = emailOrUsername.trim().toLowerCase();

    // 1. Attempt API Gateway login first
    try {
      const res = await authApi.login({ usernameOrEmail: normalized, password });
      if (res && res.token) {
        setAuthToken(res.token);
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        } catch {}

        const seedMatch = accounts.find(
          (a) =>
            a.user.id === res.userId ||
            a.user.username.toLowerCase() === res.username.toLowerCase() ||
            a.email.toLowerCase() === normalized
        );

        const profile: UserProfile = seedMatch
          ? {
              ...seedMatch.user,
              id: res.userId,
              username: res.username,
              name: res.fullName || seedMatch.user.name,
              avatarUrl: res.avatarUrl || seedMatch.user.avatarUrl,
            }
          : {
              id: res.userId,
              username: res.username,
              name: res.fullName || res.username,
              avatarUrl:
                res.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              isFollowed: false,
              headline: 'Social Media Creator',
              tags: ['Creator', 'Meta Astryx'],
              bio: 'Active creator on Social Media Content Analysis System',
              followerCount: 0,
              followingCount: 0,
            };

        setCurrentUser(profile);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        } catch {}

        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.name === 'ApiError') {
        const localAccount = accounts.find(
          (a) =>
            (a.email.toLowerCase() === normalized ||
              a.user.username.toLowerCase() === normalized ||
              a.user.id.toLowerCase() === normalized) &&
            a.passwordHash === password
        );
        if (!localAccount) {
          setIsLoading(false);
          setError(err?.message || 'Invalid username/email or password. Please try again.');
          return false;
        }
      }
      // Gateway unreachable -> continue to offline fallback check below
    }

    // 2. Offline fallback check against seed accounts
    const localAccount = accounts.find(
      (a) =>
        (a.email.toLowerCase() === normalized ||
          a.user.username.toLowerCase() === normalized ||
          a.user.id.toLowerCase() === normalized) &&
        a.passwordHash === password
    );

    setIsLoading(false);

    if (localAccount) {
      setCurrentUser(localAccount.user);
      const mockToken = `mock_token_${localAccount.user.id}`;
      setAuthToken(mockToken);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localAccount.user));
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      } catch {}
      return true;
    }

    setError('Invalid username/email or password. Please try again.');
    return false;
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !password) {
      setIsLoading(false);
      setError('All fields are required.');
      return false;
    }

    // 1. Attempt API Gateway registration
    try {
      const res = await authApi.register({
        username: cleanUsername,
        email: cleanEmail,
        password,
        fullName: cleanUsername,
      });

      if (res && res.token) {
        setAuthToken(res.token);
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        } catch {}

        const newUser: UserProfile = {
          id: res.userId,
          username: res.username,
          name: res.fullName || res.username,
          avatarUrl:
            res.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isFollowed: false,
          headline: 'Social Media Creator',
          tags: ['Creator', 'Meta Astryx'],
          bio: 'Excited to join the Social Media Content Analysis System platform!',
          followerCount: 0,
          followingCount: 0,
        };

        setCurrentUser(newUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        } catch {}

        // Refresh demo users so user appears in dropdown
        authApi.getDemoUsers().then((users) => {
          if (users && users.length > 0) {
            setDemoUsers(users.map((u) => ({
              id: u.id,
              username: u.username,
              name: u.name,
              avatarUrl: u.avatarUrl,
            })));
          }
        }).catch(() => {});

        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      // If server explicitly returned an error (e.g. 409 Conflict, duplicate email), do NOT fall back to offline mode
      if (err?.status === 409 || err?.status === 400 || err?.name === 'ApiError') {
        setIsLoading(false);
        setError(err.message || 'Account with this email or username already exists.');
        return false;
      }
      // Offline fallback only for genuine connectivity failure
    }

    // 2. Offline fallback registration
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

  const updateUser = async (partial: Partial<UserProfile>): Promise<void> => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser?.id) {
      try {
        await authApi.updateProfile({
          userId: currentUser.id,
          fullName: partial.name,
          avatarUrl: partial.avatarUrl,
          bio: partial.bio,
          coverBannerUrl: partial.coverBannerUrl,
        });

        const users = await authApi.getDemoUsers();
        if (users && users.length > 0) {
          setDemoUsers(users.map((u) => ({
            id: u.id,
            username: u.username,
            name: u.name,
            avatarUrl: u.avatarUrl,
          })));
        }
      } catch (e) {
        console.warn('Failed to sync profile update to backend:', e);
      }
    }
  };

  const switchUser = async (userId: string): Promise<boolean> => {
    setLogoutMessage(null);
    const matchedAccount = accounts.find(
      (a) => a.user.id === userId || a.user.username.toLowerCase() === userId.toLowerCase()
    );

    if (matchedAccount) {
      setCurrentUser(matchedAccount.user);
      const token = `token_${matchedAccount.user.id}`;
      setAuthToken(token);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedAccount.user));
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } catch {}
      return true;
    }

    const matchedDemo = demoUsers.find((d) => d.id === userId || d.username === userId);
    if (matchedDemo) {
      const userProfile: UserProfile = {
        id: matchedDemo.id,
        username: matchedDemo.username,
        name: matchedDemo.name,
        avatarUrl: matchedDemo.avatarUrl,
        isFollowed: false,
        headline: matchedDemo.headline || 'Social Media Creator',
        tags: ['Creator', 'Meta Astryx'],
        bio: 'Creator on Social Media Content Analysis System',
        followerCount: 1000,
        followingCount: 100,
      };
      setCurrentUser(userProfile);
      const token = `token_${matchedDemo.id}`;
      setAuthToken(token);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } catch {}
      return true;
    }

    return false;
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    setError(null);
    setLogoutMessage('You have been logged out successfully.');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        logoutMessage,
        demoUsers,
        login,
        register,
        logout,
        switchUser,
        updateUser,
        clearError,
        clearLogoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
