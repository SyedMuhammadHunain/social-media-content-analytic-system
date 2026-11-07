// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chat Contact Discovery & Conversation List

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { Divider } from '@astryxdesign/core/Divider';
import type { UserProfile } from '../../types/social';
import type { ChatConversation } from '../../types/chat';

interface ChatContactListProps {
  conversations: ChatConversation[];
  contacts: UserProfile[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectContact: (user: UserProfile) => void;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatContactList({
  conversations,
  contacts,
  searchQuery,
  onSearchChange,
  onSelectContact,
  onSelectConversation,
}: ChatContactListProps) {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      data-testid="chat-contact-list-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
      }}
    >
      {/* 1. Top Search Header Card */}
      <Card padding={4}>
        <VStack gap={3}>
          <VStack gap={1}>
            <Heading level={2}>Messages</Heading>
            <Text type="supporting" color="secondary" size="sm">
              Search a user or choose an active contact below to start chatting
            </Text>
          </VStack>

          <TextInput
            label="Search users"
            isLabelHidden
            data-testid="chat-user-search-input"
            value={searchQuery}
            placeholder="Search by name, @username, or role..."
            onChange={onSearchChange}
            startIcon={<Icon icon="search" size="sm" />}
          />
        </VStack>
      </Card>

      {/* 2. Active / Recent Conversations (when not actively searching) */}
      {!isSearching && conversations.length > 0 && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={4}>Recent Conversations</Heading>
            <VStack gap={1}>
              {conversations.map((conv) => (
                <Item
                  key={conv.id}
                  data-testid={`chat-conversation-item-${conv.participant.username}`}
                  label={
                    <HStack gap={1} align="center">
                      <Text weight="bold" size="sm">
                        {conv.participant.name}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        @{conv.participant.username}
                      </Text>
                    </HStack>
                  }
                  description={
                    conv.lastMessage?.text ||
                    (conv.lastMessage?.media ? '[Media Attachment]' : 'No messages yet')
                  }
                  startContent={
                    <Avatar
                      name={conv.participant.name}
                      src={conv.participant.avatarUrl}
                      size="md"
                    />
                  }
                  endContent={
                    conv.unreadCount > 0 ? (
                      <Badge variant="neutral" label={conv.unreadCount} />
                    ) : undefined
                  }
                  onClick={() => onSelectConversation(conv.id)}
                />
              ))}
            </VStack>
          </VStack>
        </Card>
      )}

      {/* 3. Contacts / Directory */}
      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={4}>
            {isSearching ? `Search Results (${contacts.length})` : 'Suggested Contacts'}
          </Heading>

          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Text type="supporting" color="secondary" size="sm">
                No users found matching &quot;{searchQuery}&quot;
              </Text>
            </div>
          ) : (
            <VStack gap={1}>
              {contacts.map((user, idx) => (
                <div key={user.id}>
                  {idx > 0 && <Divider />}
                  <Item
                    data-testid={`chat-contact-item-${user.username}`}
                    label={
                      <HStack gap={1} align="center">
                        <Text weight="bold" size="sm">
                          {user.name}
                        </Text>
                        <Text type="supporting" color="secondary" size="xsm">
                          @{user.username}
                        </Text>
                      </HStack>
                    }
                    description={user.headline || user.bio || 'Social Media Creator'}
                    startContent={
                      <Avatar
                        name={user.name}
                        src={user.avatarUrl}
                        size="md"
                      />
                    }
                    endContent={
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--color-primary, #0084ff)',
                          fontWeight: 600,
                        }}
                      >
                        Message
                      </span>
                    }
                    onClick={() => onSelectContact(user)}
                  />
                </div>
              ))}
            </VStack>
          )}
        </VStack>
      </Card>
    </div>
  );
}

export default ChatContactList;
