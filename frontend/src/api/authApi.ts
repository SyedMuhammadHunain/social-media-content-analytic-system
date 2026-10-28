// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Authentication API

import { api, setAuthToken } from './client.ts';

export interface AuthRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  authProvider?: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  authProvider?: string;
  avatarUrl?: string;
  token: string;
}

export interface DemoUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  coverBannerUrl?: string;
}

export const authApi = {
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const auth = await api.post<AuthResponse>('/v1/auth/login', credentials, { skipAuth: true });
    if (auth.token) {
      setAuthToken(auth.token);
    }
    return auth;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const auth = await api.post<AuthResponse>('/v1/auth/register', payload, { skipAuth: true });
    if (auth.token) {
      setAuthToken(auth.token);
    }
    return auth;
  },

  getDemoUsers(): Promise<DemoUser[]> {
    return api.get<DemoUser[]>('/v1/auth/users', { skipAuth: true });
  },

  updateProfile(payload: UpdateProfileRequest): Promise<any> {
    return api.put<any>('/v1/auth/profile', payload);
  },

  logout(): void {
    setAuthToken(null);
  },
};
