// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - AuthContext definition

import { createContext } from 'react';
import type { UserProfile } from '../types/social';

export interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
