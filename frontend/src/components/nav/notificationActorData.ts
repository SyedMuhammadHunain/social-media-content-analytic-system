// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Notification Actor Types

export interface CandidateActor {
  id: string;
  name: string;
  avatar?: string;
  handle?: string;
}

export type AdditionalActor = {
  id: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  avatar?: string;
};

export const BASE_PLATFORM_ACTORS: CandidateActor[] = [
  {
    id: 'user_hunain',
    name: 'Syed Muhammad Hunain',
    handle: 'hunain',
    avatar: 'https://avatars.githubusercontent.com/u/108502392?v=4',
  },
  {
    id: 'user_afzal',
    name: 'Afzal Khan (Verified Lead)',
    handle: 'afzal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user_alice',
    name: 'Alice Walker',
    handle: 'alice',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'user_bob',
    name: 'Bob Creator',
    handle: 'bob',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Davis',
    handle: 'charlie',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  },
];

export const FALLBACK_ACTORS: CandidateActor[] = [
  {
    id: 'usr_meta_dev',
    name: 'Dev Community Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    handle: 'community',
  },
  {
    id: 'usr_cloud_arch',
    name: 'Cloud Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    handle: 'architect',
  },
];
