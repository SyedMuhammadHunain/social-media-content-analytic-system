// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Authentication Context

'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/social.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import { AuthContext, type DemoUserSummary } from './auth-context-def.ts';
import { setAuthToken } from '../api/client.ts';
import {
  DEFAULT_DEMO_USERS,
  loadStoredUser,
  loadStoredAccounts,
  loadStoredToken,
} from './authAccountStorage.ts';
import { fetchDemoUsersWithFallback } from './authProfileSync.ts';
import { createAuthActions } from './useAuthActions.ts';

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

  const actions = useMemo(() => {
    return createAuthActions({
      currentUser,
      accounts,
      demoUsers,
      setters: {
        setCurrentUser,
        setAccounts,
        setDemoUsers,
        setIsLoading,
        setError,
        setLogoutMessage,
      },
    });
  }, [currentUser, accounts, demoUsers]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        logoutMessage,
        demoUsers,
        login: actions.login,
        register: actions.register,
        loginWithGoogle: actions.loginWithGoogle,
        logout: actions.logout,
        switchUser: actions.switchUser,
        updateUser: actions.updateUser,
        clearError,
        clearLogoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
