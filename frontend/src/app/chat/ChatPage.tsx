// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Main Chat & Direct Messaging Page

'use client';

import { useEffect } from 'react';
import type { UserProfile } from '../../types/social';
import { useChatState } from './useChatState';
import { ChatContactList } from './ChatContactList';
import { ChatThreadView } from './ChatThreadView';

interface ChatPageProps {
  currentUser?: UserProfile;
  onViewProfile?: (user: UserProfile) => void;
  onToggleFollow?: (user: UserProfile) => void;
  initialTargetUser?: UserProfile;
}

export function ChatPage({
  currentUser,
  onViewProfile,
  onToggleFollow,
  initialTargetUser,
}: ChatPageProps) {
  const {
    conversations,
    activeConversation,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    filteredContacts,
    openChatWithUser,
    sendMessage,
  } = useChatState(currentUser);

  // If instructed to start a conversation with a specific user, open it automatically
  useEffect(() => {
    if (initialTargetUser) {
      openChatWithUser(initialTargetUser);
    }
  }, [initialTargetUser, openChatWithUser]);

  return (
    <div
      data-testid="chat-page-root"
      className="chat-page-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        height: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {activeConversation ? (
        <ChatThreadView
          conversation={activeConversation}
          currentUserId={currentUser?.id}
          onSendMessage={sendMessage}
          onBack={() => setActiveConversationId(null)}
          onViewProfile={onViewProfile}
          onToggleFollow={onToggleFollow}
        />
      ) : (
        <ChatContactList
          conversations={conversations}
          contacts={filteredContacts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectContact={openChatWithUser}
          onSelectConversation={(id) => setActiveConversationId(id)}
        />
      )}
    </div>
  );
}

export default ChatPage;
