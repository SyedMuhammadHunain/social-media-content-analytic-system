// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Seed Accounts

import { CURRENT_USER } from './socialSeedData';
import type { UserProfile } from '../types/social';

export interface AuthUserAccount {
  user: UserProfile;
  email: string;
  passwordHash: string;
}

export const SEED_ACCOUNTS: AuthUserAccount[] = [
  {
    user: CURRENT_USER,
    email: 'hunain@example.com',
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'usr_alex_02',
      username: 'alex_distrib',
      name: 'Alex Rivera',
      avatarUrl:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isFollowed: true,
      headline: 'Principal Distributed Systems Engineer',
      tags: ['Distributed Systems', 'Fan-out Architecture', 'NoSQL'],
      bio: 'Architecting high-scale event driven backends.',
      followerCount: 8400,
      followingCount: 312,
      coverBannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    },
    email: 'alex@example.com',
    passwordHash: 'password123',
  },
];
