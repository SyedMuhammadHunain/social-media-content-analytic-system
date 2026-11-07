// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Direct Chat Local Persistence Helpers

import type { UserProfile } from '../types/social.ts';
import type { ChatConversation, DirectChatMessage } from '../types/chat.ts';
import { INITIAL_SEED_CONVERSATIONS } from '../mock/mockChatData.ts';

const CHAT_STORAGE_KEY = 'social_media_direct_chat_conversations_v1';
const CHAT_UPDATE_EVENT = 'social:chat-updated';

export function loadStoredConversations(): ChatConversation[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [...INITIAL_SEED_CONVERSATIONS];
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_SEED_CONVERSATIONS));
      return [...INITIAL_SEED_CONVERSATIONS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...INITIAL_SEED_CONVERSATIONS];
  } catch (error) {
    console.warn('Failed to parse chat conversations from localStorage:', error);
    return [...INITIAL_SEED_CONVERSATIONS];
  }
}

export function saveStoredConversations(conversations: ChatConversation[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
    window.dispatchEvent(
      new CustomEvent(CHAT_UPDATE_EVENT, {
        detail: {
          conversations,
          totalUnread: getTotalUnreadCount(conversations),
        },
      })
    );
  } catch (error) {
    console.warn('Failed to save chat conversations to localStorage:', error);
  }
}

export function getTotalUnreadCount(conversations?: ChatConversation[]): number {
  const list = conversations || loadStoredConversations();
  return list.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
}

export function getOrCreateConversation(
  conversations: ChatConversation[],
  participant: UserProfile
): { conversation: ChatConversation; updatedList: ChatConversation[] } {
  const existingIndex = conversations.findIndex(
    (c) => c.participant.id === participant.id || c.participant.username === participant.username
  );

  if (existingIndex >= 0) {
    return {
      conversation: conversations[existingIndex],
      updatedList: conversations,
    };
  }

  const newConv: ChatConversation = {
    id: `conv_${participant.id}_${Date.now()}`,
    participant,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
    messages: [],
  };

  const updatedList = [newConv, ...conversations];
  saveStoredConversations(updatedList);
  return { conversation: newConv, updatedList };
}

export function appendMessage(
  conversations: ChatConversation[],
  conversationId: string,
  message: DirectChatMessage
): { updatedList: ChatConversation[]; updatedConversation: ChatConversation | null } {
  const targetIndex = conversations.findIndex((c) => c.id === conversationId);

  if (targetIndex === -1) {
    return { updatedList: conversations, updatedConversation: null };
  }

  const existing = conversations[targetIndex];

  // Prevent duplicate messages if already present with identical ID
  if (existing.messages.some((m) => m.id === message.id)) {
    return { updatedList: conversations, updatedConversation: existing };
  }

  const updatedConversation: ChatConversation = {
    ...existing,
    messages: [...existing.messages, message],
    lastMessage: message,
    updatedAt: message.timestamp,
  };

  const updatedList = [...conversations];
  updatedList.splice(targetIndex, 1);
  updatedList.unshift(updatedConversation);

  saveStoredConversations(updatedList);
  return { updatedList, updatedConversation };
}

export function markConversationAsRead(
  conversations: ChatConversation[],
  conversationId: string
): ChatConversation[] {
  const targetIndex = conversations.findIndex((c) => c.id === conversationId);
  if (targetIndex === -1 || conversations[targetIndex].unreadCount === 0) {
    return conversations;
  }

  const updatedList = conversations.map((conv) => {
    if (conv.id === conversationId) {
      return { ...conv, unreadCount: 0 };
    }
    return conv;
  });

  saveStoredConversations(updatedList);
  return updatedList;
}

export function subscribeToChatUpdates(callback: (totalUnread: number) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ totalUnread: number }>;
    if (customEvent.detail && typeof customEvent.detail.totalUnread === 'number') {
      callback(customEvent.detail.totalUnread);
    } else {
      callback(getTotalUnreadCount());
    }
  };

  window.addEventListener(CHAT_UPDATE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(CHAT_UPDATE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
