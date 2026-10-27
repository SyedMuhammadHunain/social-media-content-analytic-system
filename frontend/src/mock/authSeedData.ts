// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Seed Accounts (Atlas Seeded Users)

import { CURRENT_USER } from './socialSeedData.ts';
import type { UserProfile } from '../types/social.ts';

export interface AuthUserAccount {
  user: UserProfile;
  email: string;
  passwordHash: string;
}

/**
 * Normalizes legacy or mock user IDs to backend Atlas user IDs.
 */
export function normalizeBackendUserId(userId?: string | null): string {
  if (!userId || userId === 'usr_me_01') {
    return 'user_hunain';
  }
  if (userId === 'usr_alex_02') {
    return 'user_alice';
  }
  return userId;
}

export const SEED_ACCOUNTS: AuthUserAccount[] = [
  {
    user: {
      id: 'user_hunain',
      username: 'hunain',
      name: 'Syed Muhammad Hunain',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
      headline: 'Staff Infrastructure Architect • Distributed Media Systems',
      tags: ['Systems Architecture', 'Distributed Systems', 'Meta Astryx', '500M DAU'],
      bio: 'Building large-scale content processing pipelines and real-time social telemetry. Passionate about sub-second fan-out, cache hierarchies, and accessible design system engineering.',
      followerCount: 14200,
      followingCount: 486,
      coverBannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    },
    email: 'hunain@example.com',
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'user_alice',
      username: 'alice',
      name: 'Alice Walker',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
      headline: 'Distributed Systems & Cloud Lead',
      tags: ['Distributed Systems', 'Fan-out Architecture', 'NoSQL'],
      bio: 'Scaling real-time architectures with reactive stream processing.',
      followerCount: 8900,
      followingCount: 240,
      coverBannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    },
    email: 'alice@example.com',
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'user_bob',
      username: 'bob',
      name: 'Bob Creator',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
      headline: 'Creative Media Director & Video Producer',
      tags: ['Media Systems', 'Creator Economy', '4K Video'],
      bio: 'Visual storyteller exploring 4K streaming pipelines and creator engagement.',
      followerCount: 23100,
      followingCount: 180,
      coverBannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    },
    email: 'bob@example.com',
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'user_charlie',
      username: 'charlie',
      name: 'Charlie Dev',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
      headline: 'Full-Stack Engineer & Reactive Microservices Dev',
      tags: ['Full-Stack', 'Spring Cloud', 'React 19'],
      bio: 'Building low-latency feeds with Spring Cloud Gateway and React 19.',
      followerCount: 5400,
      followingCount: 95,
      coverBannerUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    },
    email: 'charlie@example.com',
    passwordHash: 'password123',
  },
  // Legacy mock accounts for test compatibility
  {
    user: CURRENT_USER,
    email: 'hunain_creator@example.com',
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
