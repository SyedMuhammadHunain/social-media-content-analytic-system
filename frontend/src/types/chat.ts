// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Direct Chat & Messaging Types

'use client';

import type { UserProfile } from './social';

export type ChatMediaType = 'image' | 'gif' | 'video';

export interface ChatMediaAttachment {
  type: ChatMediaType;
  url: string;
  name?: string;
  thumbnailUrl?: string;
}

export type DirectChatMessageStatus = 'sent' | 'delivered' | 'read';

export interface DirectChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  media?: ChatMediaAttachment[];
  timestamp: string; // ISO 8601
  status?: DirectChatMessageStatus;
}

export interface ChatConversation {
  id: string;
  participant: UserProfile;
  lastMessage?: DirectChatMessage;
  unreadCount: number;
  updatedAt: string; // ISO 8601
  messages: DirectChatMessage[];
}
