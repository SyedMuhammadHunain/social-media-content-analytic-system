// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chat State Management Hook

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile } from '../../types/social';
import type { ChatConversation, ChatMediaAttachment, DirectChatMessage } from '../../types/chat';
import {
  loadStoredConversations,
  saveStoredConversations,
  appendMessage,
  getOrCreateConversation,
  markConversationAsRead,
  subscribeToChatUpdates,
} from '../../utils/chatStorage';
import { INITIAL_SUGGESTED_CONTACTS } from '../../mock/mockChatData';
import { chatApi, type BackendChatMessage } from '../../api/chatApi';

function mergeRemoteMessages(
  localMessages: DirectChatMessage[],
  remoteMessages: BackendChatMessage[],
  conversationId: string
): DirectChatMessage[] | null {
  const existingIds = new Set(localMessages.map((m) => m.id));
  const newMessages: DirectChatMessage[] = [];

  for (const rm of remoteMessages) {
    if (!existingIds.has(rm.id)) {
      newMessages.push({
        id: rm.id,
        conversationId,
        senderId: rm.senderId,
        recipientId: rm.recipientId,
        text: rm.text,
        media: rm.media as any,
        timestamp: rm.createdAt,
        status: 'sent',
      });
    }
  }

  if (newMessages.length === 0) return null;

  return [...localMessages, ...newMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function useChatState(currentUser?: UserProfile) {
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    loadStoredConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to storage / update events across tabs
  useEffect(() => {
    const unsubscribe = subscribeToChatUpdates(() => {
      setConversations(loadStoredConversations());
    });
    return unsubscribe;
  }, []);

  // Initial rehydration from MongoDB Atlas conversations
  useEffect(() => {
    let isMounted = true;
    chatApi
      .getConversations()
      .then((summaries) => {
        if (!isMounted || !summaries || summaries.length === 0) return;
        setConversations((prev) => {
          let hasChanges = false;
          let list = [...prev];

          summaries.forEach((sum) => {
            const partner: UserProfile = {
              id: sum.partnerId,
              username: sum.partnerUsername,
              name: sum.partnerName,
              avatarUrl: sum.partnerAvatar || '',
              followerCount: 0,
              followingCount: 0,
              bio: '',
              tags: [],
              headline: 'Direct Contact',
              isFollowed: false,
            };

            const { conversation, updatedList } = getOrCreateConversation(list, partner);
            list = updatedList;

            if (sum.lastMessage) {
              const lm = sum.lastMessage;
              const directMsg: DirectChatMessage = {
                id: lm.id,
                conversationId: conversation.id,
                senderId: lm.senderId,
                recipientId: lm.recipientId,
                text: lm.text,
                media: lm.media as any,
                timestamp: lm.createdAt,
                status: 'sent',
              };
              const { updatedList: msgList } = appendMessage(list, conversation.id, directMsg);
              list = msgList;
              hasChanges = true;
            }
          });

          if (hasChanges) {
            saveStoredConversations(list);
            return list;
          }
          return prev;
        });
      })
      .catch(() => {
        // Offline fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Merge suggested contacts with conversation participants into a deduplicated directory
  const allContacts = useMemo(() => {
    const map = new Map<string, UserProfile>();
    const candidates = [
      ...INITIAL_SUGGESTED_CONTACTS,
      ...conversations.map((c) => c.participant),
    ];
    for (const user of candidates) {
      if (user.id !== currentUser?.id) {
        map.set(user.id, user);
      }
    }
    return Array.from(map.values());
  }, [conversations, currentUser]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.headline && c.headline.toLowerCase().includes(q))
    );
  }, [allContacts, searchQuery]);

  // Select or initiate chat with a user
  const openChatWithUser = useCallback((user: UserProfile) => {
    const { conversation, updatedList } = getOrCreateConversation(conversations, user);
    setActiveConversationId(conversation.id);
    const readList = markConversationAsRead(updatedList, conversation.id);
    saveStoredConversations(readList);
    setConversations(readList);
    chatApi.markConversationAsRead(conversation.id).catch(() => {});
  }, [conversations]);

  // Periodic 3s background polling to sync messages from receiver/backend
  useEffect(() => {
    if (!activeConversation) return;
    const partnerId = activeConversation.participant.id;
    const currentConvId = activeConversation.id;

    let isMounted = true;
    const syncRemoteMessages = async () => {
      try {
        const remoteMessages = await chatApi.getConversationMessages(partnerId);
        if (!isMounted || !remoteMessages || remoteMessages.length === 0) return;

        setConversations((prev) => {
          const targetIndex = prev.findIndex((c) => c.id === currentConvId);
          if (targetIndex === -1) return prev;

          const currentConv = prev[targetIndex];
          const merged = mergeRemoteMessages(currentConv.messages, remoteMessages, currentConv.id);
          if (!merged) return prev;

          const lastMessage = merged[merged.length - 1];
          const updatedConv: ChatConversation = {
            ...currentConv,
            messages: merged,
            lastMessage,
            updatedAt: lastMessage?.timestamp || currentConv.updatedAt,
          };

          const updatedList = [...prev];
          updatedList[targetIndex] = updatedConv;
          saveStoredConversations(updatedList);
          return updatedList;
        });
      } catch {
        // Graceful offline fallback: keep local conversation intact
      }
    };

    syncRemoteMessages();
    const interval = setInterval(syncRemoteMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConversation?.id, activeConversation?.participant.id]);

  // Send a message to active conversation
  const sendMessage = useCallback(
    ({ text, media }: { text?: string; media?: ChatMediaAttachment[] }) => {
      if (!activeConversationId) return;

      const senderId = currentUser?.id || 'user_hunain';
      const targetConv = conversations.find((c) => c.id === activeConversationId);
      if (!targetConv) return;

      const newMsg: DirectChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conversationId: activeConversationId,
        senderId,
        recipientId: targetConv.participant.id,
        text,
        media,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      // 1. Optimistic local update
      const { updatedList } = appendMessage(conversations, activeConversationId, newMsg);
      setConversations(updatedList);

      // 2. Dispatch to backend persistence in MongoDB Atlas
      chatApi
        .sendMessage({
          recipientId: targetConv.participant.id,
          conversationId: activeConversationId,
          clientMessageId: newMsg.id,
          text,
          media: media as any,
        })
        .catch(() => {
          // Fallback: local message already saved in offline storage
        });
    },
    [activeConversationId, conversations, currentUser]
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    allContacts,
    filteredContacts,
    openChatWithUser,
    sendMessage,
  };
}
