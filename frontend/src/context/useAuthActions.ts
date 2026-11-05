// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Actions Hook

import { authApi } from '../api/authApi.ts';
import { setAuthToken } from '../api/client.ts';
import type { UserProfile } from '../types/social.ts';
import type { AuthUserAccount } from '../mock/authSeedData.ts';
import type { DemoUserSummary } from './auth-context-def.ts';
import {
  saveStoredUser,
  saveStoredAccounts,
  saveStoredToken,
  findAccount,
} from './authAccountStorage.ts';
import { fetchDemoUsersWithFallback, syncProfileUpdate } from './authProfileSync.ts';
import { executeGoogleLogin, type GoogleAuthParams } from './authGoogleHandler.ts';
import { executeLogin } from './authLoginHandler.ts';
import { executeRegister } from './authRegisterHandler.ts';

interface AuthActionStateSetters {
  setCurrentUser: (updater: (prev: UserProfile | null) => UserProfile | null) => void;
  setAccounts: (updater: (prev: AuthUserAccount[]) => AuthUserAccount[]) => void;
  setDemoUsers: (users: DemoUserSummary[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLogoutMessage: (msg: string | null) => void;
}

interface AuthActionContext {
  currentUser: UserProfile | null;
  accounts: AuthUserAccount[];
  demoUsers: DemoUserSummary[];
  setters: AuthActionStateSetters;
}

function buildDemoUserProfile(demo: DemoUserSummary): UserProfile {
  return {
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
}

function isAccountTarget(acc: AuthUserAccount, targetId: string, normTargetName: string): boolean {
  if (acc.user.id === targetId) return true;
  return acc.user.username.toLowerCase() === normTargetName;
}

function applyAccountPatch(
  accounts: AuthUserAccount[],
  targetUser: UserProfile,
  partial: Partial<UserProfile>
): AuthUserAccount[] {
  const normTargetName = targetUser.username.toLowerCase();
  return accounts.map((acc) => {
    if (isAccountTarget(acc, targetUser.id, normTargetName)) {
      return { ...acc, user: { ...acc.user, ...partial } };
    }
    return acc;
  });
}

export function createAuthActions(ctx: AuthActionContext) {
  const { currentUser, accounts, demoUsers, setters } = ctx;

  const applyAuthSuccess = (user: UserProfile, token: string, account?: AuthUserAccount) => {
    setAuthToken(token);
    saveStoredToken(token);
    setters.setCurrentUser(() => user);
    saveStoredUser(user);
    if (account) {
      setters.setAccounts((prev) => {
        const normAccount = account.email.toLowerCase();
        const filtered = prev.filter(
          (a) => a.user.id !== user.id && a.email.toLowerCase() !== normAccount
        );
        const updated = [...filtered, account];
        saveStoredAccounts(updated);
        return updated;
      });
    }
  };

  const handleResult = (
    result: { success: boolean; user?: UserProfile; token?: string; account?: AuthUserAccount; error?: string },
    defaultErr: string
  ): boolean => {
    setters.setIsLoading(false);
    if (result.success) {
      if (result.user && result.token) {
        applyAuthSuccess(result.user, result.token, result.account);
        return true;
      }
    }
    setters.setError(result.error || defaultErr);
    return false;
  };

  const login = async (...creds: [emailOrUsername: string, password: string]): Promise<boolean> => {
    const [emailOrUsername, password] = creds;
    setters.setIsLoading(true);
    setters.setError(null);
    setters.setLogoutMessage(null);
    const result = await executeLogin({ emailOrUsername, password, accounts });
    return handleResult(result, 'Invalid credentials.');
  };

  const register = async (...creds: [username: string, email: string, password: string]): Promise<boolean> => {
    const [username, email, password] = creds;
    setters.setIsLoading(true);
    setters.setError(null);
    setters.setLogoutMessage(null);
    const result = await executeRegister({ username, email, password, accounts });
    const ok = handleResult(result, 'Registration failed.');
    if (ok) fetchDemoUsersWithFallback().then(setters.setDemoUsers);
    return ok;
  };

  const loginWithGoogle = async (googleAccount?: GoogleAuthParams): Promise<boolean> => {
    setters.setIsLoading(true);
    setters.setError(null);
    setters.setLogoutMessage(null);
    try {
      const result = await executeGoogleLogin(googleAccount, accounts);
      applyAuthSuccess(result.user, result.token, result.account);
      fetchDemoUsersWithFallback().then(setters.setDemoUsers);
      setters.setIsLoading(false);
      return true;
    } catch (e: any) {
      setters.setIsLoading(false);
      setters.setError(e?.message || 'Google authentication failed.');
      return false;
    }
  };

  const updateUser = async (partial: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;
    const targetUser: UserProfile = { ...currentUser, ...partial };
    setters.setCurrentUser(() => targetUser);
    saveStoredUser(targetUser);

    setters.setAccounts((prev) => {
      const updated = applyAccountPatch(prev, targetUser, partial);
      saveStoredAccounts(updated);
      return updated;
    });

    const updatedDemos = await syncProfileUpdate(targetUser);
    if (updatedDemos) setters.setDemoUsers(updatedDemos);
  };

  const switchUser = async (userId: string): Promise<boolean> => {
    setters.setLogoutMessage(null);
    const matched = findAccount(accounts, userId);
    if (matched) {
      applyAuthSuccess(matched.user, `token_${matched.user.id}`);
      return true;
    }
    const demo = demoUsers.find((d) => d.id === userId || d.username === userId);
    if (demo) {
      applyAuthSuccess(buildDemoUserProfile(demo), `token_${demo.id}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    authApi.logout();
    setters.setCurrentUser(() => null);
    setters.setError(null);
    setters.setLogoutMessage('You have been logged out successfully.');
    saveStoredUser(null);
    saveStoredToken(null);
  };

  return { login, register, loginWithGoogle, updateUser, switchUser, logout };
}
