// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Mock Chat & Direct Messaging Data

import type { UserProfile } from '../types/social.ts';
import type { ChatConversation } from '../types/chat.ts';

export const HOWARD_LE_USER: UserProfile = {
  id: 'user_howard_le',
  username: 'uxui_howard.le',
  name: 'Howard Le',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isFollowed: false,
  headline: 'Howard Le • UXUI',
  tags: ['Design Systems', 'UX/UI', 'Astryx', 'Prototyping'],
  bio: 'Product Designer focusing on design systems, human interfaces, and multi-device interaction models.',
  followerCount: 42800,
  followingCount: 312,
  coverBannerUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
};

export const ALICE_WALKER_USER: UserProfile = {
  id: 'user_alice',
  username: 'alice',
  name: 'Alice Walker',
  avatarUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  isFollowed: true,
  headline: 'Distributed Systems & Cloud Lead',
  tags: ['Distributed Systems', 'Fan-out Architecture', 'NoSQL'],
  bio: 'Scaling real-time architectures with reactive stream processing.',
  followerCount: 8900,
  followingCount: 240,
  coverBannerUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
};

export const SARAH_JENKINS_USER: UserProfile = {
  id: 'user_sarah',
  username: 'sarah_j',
  name: 'Sarah Jenkins',
  avatarUrl:
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  isFollowed: true,
  headline: 'Principal Frontend Architect • Meta Astryx',
  tags: ['Meta Astryx', 'Accessibility', 'React 19', 'WCAG AAA'],
  bio: 'Obsessed with keyboard navigation, screen reader ergonomics, and sub-16ms layout trees.',
  followerCount: 22400,
  followingCount: 180,
  coverBannerUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
};

export const INITIAL_SUGGESTED_CONTACTS: UserProfile[] = [
  HOWARD_LE_USER,
  ALICE_WALKER_USER,
  SARAH_JENKINS_USER,
];

export const INITIAL_SEED_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_howard_le',
    participant: HOWARD_LE_USER,
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    lastMessage: {
      id: 'msg_howard_1',
      conversationId: 'conv_howard_le',
      senderId: HOWARD_LE_USER.id,
      recipientId: 'current_user',
      text: 'Hey! Loved your recent post on distributed telemetry. Let me know if you want to collaborate on the Astryx UI.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'delivered',
    },
    messages: [
      {
        id: 'msg_howard_1',
        conversationId: 'conv_howard_le',
        senderId: HOWARD_LE_USER.id,
        recipientId: 'current_user',
        text: 'Hey! Loved your recent post on distributed telemetry. Let me know if you want to collaborate on the Astryx UI.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'delivered',
      },
    ],
  },
  {
    id: 'conv_alice',
    participant: ALICE_WALKER_USER,
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastMessage: {
      id: 'msg_alice_2',
      conversationId: 'conv_alice',
      senderId: 'current_user',
      recipientId: ALICE_WALKER_USER.id,
      text: 'Sounds great! I pushed the updated storage schema to git.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: 'read',
    },
    messages: [
      {
        id: 'msg_alice_1',
        conversationId: 'conv_alice',
        senderId: ALICE_WALKER_USER.id,
        recipientId: 'current_user',
        text: 'Are we syncing the real-time events today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: 'read',
      },
      {
        id: 'msg_alice_2',
        conversationId: 'conv_alice',
        senderId: 'current_user',
        recipientId: ALICE_WALKER_USER.id,
        text: 'Sounds great! I pushed the updated storage schema to git.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'read',
      },
    ],
  },
];
