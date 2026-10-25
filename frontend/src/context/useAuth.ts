// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - useAuth Hook

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from './auth-context-def';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
