// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - AuthContext definition

import { createContext } from 'react';
import type { UserProfile } from '../types/social';

export interface DemoUserSummary {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logoutMessage: string | null;
  demoUsers: DemoUserSummary[];
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => Promise<boolean>;
  updateUser: (partial: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  clearLogoutMessage: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
