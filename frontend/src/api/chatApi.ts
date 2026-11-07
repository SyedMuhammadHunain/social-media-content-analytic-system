// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Direct Chat & Messaging API Client

import { api } from './client.ts';

export interface SendMessagePayload {
  recipientId: string;
  conversationId?: string;
  clientMessageId?: string;
  text?: string;
  media?: Array<{ url: string; type: string; name?: string; size?: number }>;
}

export interface BackendChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  media?: Array<{ url: string; type: string; name?: string; size?: number }>;
  read: boolean;
  createdAt: string;
}

export interface BackendConversationSummary {
  conversationId: string;
  partnerId: string;
  partnerUsername: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage?: BackendChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export const chatApi = {
  sendMessage(payload: SendMessagePayload): Promise<BackendChatMessage> {
    return api.post<BackendChatMessage>('/v1/chat/messages', payload);
  },

  getConversationMessages(withUserId: string): Promise<BackendChatMessage[]> {
    const encoded = encodeURIComponent(withUserId);
    return api.get<BackendChatMessage[]>(`/v1/chat/messages?with=${encoded}`);
  },

  getConversations(): Promise<BackendConversationSummary[]> {
    return api.get<BackendConversationSummary[]>('/v1/chat/conversations');
  },

  markConversationAsRead(conversationId: string): Promise<void> {
    const encoded = encodeURIComponent(conversationId);
    return api.put<void>(`/v1/chat/conversations/${encoded}/read`);
  },
};
