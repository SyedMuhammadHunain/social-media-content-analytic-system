// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Authentication Context

'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/social.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import { AuthContext, type DemoUserSummary } from './auth-context-def.ts';
import { authApi } from '../api/authApi.ts';
import { setAuthToken } from '../api/client.ts';
import {
  DEFAULT_DEMO_USERS,
  loadStoredUser,
  saveStoredUser,
  loadStoredAccounts,
  saveStoredAccounts,
  loadStoredToken,
  saveStoredToken,
  findAccount,
} from './authAccountStorage.ts';
import {
  fetchDemoUsersWithFallback,
  syncProfileUpdate,
} from './authProfileSync.ts';
import { executeGoogleLogin, type GoogleAuthParams } from './authGoogleHandler.ts';

export type { AuthContextType, DemoUserSummary } from './auth-context-def.ts';
// Deterministic Google OAuth scheme uses deterministicGoogleId and goog_oauth_ prefix via authGoogleHandler.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(loadStoredUser);
  const [accounts, setAccounts] = useState<AuthUserAccount[]>(loadStoredAccounts);
  const [demoUsers, setDemoUsers] = useState<DemoUserSummary[]>(DEFAULT_DEMO_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = loadStoredToken();
    if (token) setAuthToken(token);
    fetchDemoUsersWithFallback().then(setDemoUsers);
  }, []);

  const clearError = () => setError(null);
  const clearLogoutMessage = () => setLogoutMessage(null);

  const applyAuthSuccess = (user: UserProfile, token: string, account?: AuthUserAccount) => {
    setAuthToken(token);
    saveStoredToken(token);
    setCurrentUser(user);
    saveStoredUser(user);
    if (account) {
      setAccounts((prev) => {
        const updated = [...prev.filter((a) => a.user.id !== user.id && a.email.toLowerCase() !== account.email.toLowerCase()), account];
        saveStoredAccounts(updated);
        return updated;
      });
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);
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
        applyAuthSuccess(profile, res.token, { user: profile, email: seedMatch?.email || normalized, passwordHash: password });
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      if ((err?.status === 401 || err?.name === 'ApiError') && !findAccount(accounts, normalized, password)) {
        setIsLoading(false);
        setError(err?.message || 'Invalid username/email or password. Please try again.');
        return false;
      }
    }

    const localAccount = findAccount(accounts, normalized, password);
    setIsLoading(false);
    if (localAccount) {
      applyAuthSuccess(localAccount.user, `mock_token_${localAccount.user.id}`);
      return true;
    }
    setError('Invalid username/email or password. Please try again.');
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
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
        applyAuthSuccess(newUser, res.token, { user: newUser, email: cleanEmail, passwordHash: password });
        fetchDemoUsersWithFallback().then(setDemoUsers);
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      if (err?.status === 409 || err?.status === 400 || err?.name === 'ApiError') {
        setIsLoading(false);
        setError(err.message || 'Account with this email or username already exists.');
        return false;
      }
    }

    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail.toLowerCase() || a.user.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setIsLoading(false);
      setError('Account with this email or username already exists.');
      return false;
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
    applyAuthSuccess(newUser, `mock_token_${newUser.id}`, { user: newUser, email: cleanEmail, passwordHash: password });
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (googleAccount?: GoogleAuthParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);
    try {
      const result = await executeGoogleLogin(googleAccount, accounts);
      applyAuthSuccess(result.user, result.token, result.account);
      fetchDemoUsersWithFallback().then(setDemoUsers);
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setIsLoading(false);
      setError(e?.message || 'Google authentication failed.');
      return false;
    }
  };

  const updateUser = async (partial: Partial<UserProfile>): Promise<void> => {
    let activeUser: UserProfile | null = null;
    setCurrentUser((prev) => {
      if (!prev) return null;
      activeUser = { ...prev, ...partial };
      saveStoredUser(activeUser);
      return activeUser;
    });

    const targetUser = activeUser || (currentUser ? { ...currentUser, ...partial } : null);
    if (!targetUser?.id) return;

    setAccounts((prev) => {
      const updated = prev.map((acc) =>
        acc.user.id === targetUser.id || acc.user.username.toLowerCase() === targetUser.username.toLowerCase()
          ? { ...acc, user: { ...acc.user, ...partial } }
          : acc
      );
      saveStoredAccounts(updated);
      return updated;
    });

    const updatedDemos = await syncProfileUpdate(targetUser);
    if (updatedDemos) setDemoUsers(updatedDemos);
  };

  const switchUser = async (userId: string): Promise<boolean> => {
    setLogoutMessage(null);
    const matched = findAccount(accounts, userId);
    if (matched) {
      applyAuthSuccess(matched.user, `token_${matched.user.id}`);
      return true;
    }
    const demo = demoUsers.find((d) => d.id === userId || d.username === userId);
    if (demo) {
      const profile: UserProfile = {
        id: demo.id,
        username: demo.username,
        name: demo.name,
        avatarUrl: demo.avatarUrl,
        isFollowed: false,
        headline: demo.headline || 'Social Media Creator',
        tags: ['Creator', 'Meta Astryx'],
        bio: 'Creator on Social Media Content Analysis System',
        followerCount: 0,
        followingCount: 0,
      };
      applyAuthSuccess(profile, `token_${demo.id}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    setError(null);
    setLogoutMessage('You have been logged out successfully.');
    saveStoredUser(null);
    saveStoredToken(null);
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
        loginWithGoogle,
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
