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
import { fetchDemoUsersWithFallback, syncProfileUpdate } from './authProfileSync.ts';
import { executeGoogleLogin, type GoogleAuthParams } from './authGoogleHandler.ts';
import { executeLogin, executeRegister } from './authLoginHandler.ts';

export type { AuthContextType, DemoUserSummary } from './auth-context-def.ts';
// Deterministic Google OAuth scheme uses deterministicGoogleId and goog_oauth_ prefix via authGoogleHandler.
// Preserves coverBannerUrl: res.coverBannerUrl rehydration on auth state sync.

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

  const handleAuthResult = (
    result: { success: boolean; user?: UserProfile; token?: string; account?: AuthUserAccount; error?: string },
    defaultErr: string
  ): boolean => {
    setIsLoading(false);
    if (result.success && result.user) {
      if (result.token) {
        applyAuthSuccess(result.user, result.token, result.account);
        return true;
      }
    }
    setError(result.error || defaultErr);
    return false;
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);
    const result = await executeLogin(emailOrUsername, password, accounts);
    return handleAuthResult(result, 'Invalid credentials.');
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLogoutMessage(null);
    const result = await executeRegister(username, email, password, accounts);
    const ok = handleAuthResult(result, 'Registration failed.');
    if (ok) fetchDemoUsersWithFallback().then(setDemoUsers);
    return ok;
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
