// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chat Thread View

'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatLayoutScrollButton,
} from '@astryxdesign/core/Chat';
import { Avatar } from '@astryxdesign/core/Avatar';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { TextInput } from '@astryxdesign/core/TextInput';
import { HStack } from '@astryxdesign/core/Layout';
import { PlusNavIcon } from '../feed/astryxMobileIcons';
import type { UserProfile } from '../../types/social';
import type { ChatConversation, ChatMediaAttachment, DirectChatMessage } from '../../types/chat';
import { ChatRecipientHeader, ChatProfilePresentation } from './ChatRecipientHeader';
import { ChatMediaAttachmentMenu } from './ChatMediaAttachmentMenu';

interface ChatThreadViewProps {
  conversation: ChatConversation;
  currentUserId?: string;
  onSendMessage: (payload: { text?: string; media?: ChatMediaAttachment[] }) => void;
  onBack?: () => void;
  onViewProfile?: (user: UserProfile) => void;
  onToggleFollow?: (user: UserProfile) => void;
}

export function ChatThreadView({
  conversation,
  currentUserId = 'user_hunain',
  onSendMessage,
  onBack,
  onViewProfile,
  onToggleFollow,
}: ChatThreadViewProps) {
  const [inputText, setInputText] = useState('');
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [stagedAttachments, setStagedAttachments] = useState<ChatMediaAttachment[]>([]);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottom(isScrolledUp);
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [conversation.id, conversation.messages.length]);

  const handleSend = () => {
    if (isSendingRef.current) return;
    const trimmedText = inputText.trim();
    const media = stagedAttachments.length > 0 ? stagedAttachments : undefined;
    if (!trimmedText && !media) return;

    isSendingRef.current = true;
    setInputText('');
    setStagedAttachments([]);
    setIsMediaMenuOpen(false);

    try {
      onSendMessage({
        text: trimmedText || undefined,
        media,
      });
    } finally {
      setTimeout(() => {
        isSendingRef.current = false;
      }, 150);
    }

    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachMedia = (attachment: ChatMediaAttachment) => {
    setStagedAttachments((prev) => [...prev, attachment]);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => `${prev}${emoji}`);
  };

  const handleRemoveStagedAttachment = (index: number) => {
    setStagedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      data-testid="chat-thread-view"
      className="chat-thread-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '600px',
        backgroundColor: 'var(--color-background-body, #111111)',
        borderRadius: 0,
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Recipient Header (top identity bar + pinned center profile card) */}
      <ChatRecipientHeader
        participant={conversation.participant}
        onBack={onBack}
        onViewProfile={onViewProfile}
      />

      {/* 2. Messages Log Area */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        data-testid="chat-messages-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Scrollable Center Profile Presentation */}
        <ChatProfilePresentation
          participant={conversation.participant}
          onViewProfile={onViewProfile}
          onToggleFollow={onToggleFollow}
        />

        <div style={{ paddingBottom: 16 }}>
          <ChatSystemMessage variant="default">
            Direct conversation with {conversation.participant.name}
          </ChatSystemMessage>
        </div>

        <ChatMessageList>
          {conversation.messages.map((message: DirectChatMessage) => {
            const isUserSender = message.senderId === currentUserId;
            return (
              <ChatMessage
                key={message.id}
                sender={isUserSender ? 'user' : 'assistant'}
                avatar={
                  !isUserSender ? (
                    <Avatar
                      name={conversation.participant.name}
                      src={conversation.participant.avatarUrl}
                      size="sm"
                    />
                  ) : undefined
                }
              >
                <ChatMessageBubble variant="filled">
                  {/* Media attachments */}
                  {message.media && message.media.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        marginBottom: message.text ? 8 : 0,
                      }}
                    >
                      {message.media.map((item, idx) => (
                        <div
                          key={`${item.url}-${idx}`}
                          style={{
                            borderRadius: 8,
                            overflow: 'hidden',
                            maxWidth: 280,
                            border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
                          }}
                        >
                          {item.type === 'video' ? (
                            <video
                              src={item.url}
                              controls
                              style={{ width: '100%', maxHeight: 200, aspectRatio: '16 / 9', display: 'block' }}
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name || 'attachment'}
                              loading="lazy"
                              style={{ width: '100%', maxHeight: 200, aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text body */}
                  {message.text && (
                    <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </div>
                  )}
                </ChatMessageBubble>

                <ChatMessageMetadata
                  timestamp={formatMessageTime(message.timestamp)}
                  status={isUserSender ? 'sent' : undefined}
                />
              </ChatMessage>
            );
          })}
        </ChatMessageList>
        <div ref={messagesEndRef} />
      </div>

      {/* Floating scroll to bottom button (centered) */}
      <div
        data-testid="chat-scroll-bottom-container"
        style={{
          position: 'absolute',
          bottom: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          pointerEvents: showScrollBottom ? 'auto' : 'none',
        }}
      >
        <ChatLayoutScrollButton
          isVisible={showScrollBottom}
          label="New messages"
          onClick={() => scrollToBottom('smooth')}
        />
      </div>

      {/* 3. Bottom Composer Toolbar (Seamless, no divider line or enter hint) */}
      <div
        data-testid="chat-composer-container"
        style={{
          position: 'sticky',
          bottom: 0,
          border: 'none',
          backgroundColor: 'var(--color-background-body, #111111)',
          padding: '8px 16px 16px',
          zIndex: 10,
        }}
      >
        {/* Attachment menu popover */}
        <ChatMediaAttachmentMenu
          isOpen={isMediaMenuOpen}
          onClose={() => setIsMediaMenuOpen(false)}
          onAttachMedia={handleAttachMedia}
          onInsertEmoji={handleInsertEmoji}
        />

        {/* Staged attachments preview tray */}
        {stagedAttachments.length > 0 && (
          <div
            data-testid="chat-staged-attachments-tray"
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {stagedAttachments.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                style={{
                  position: 'relative',
                  width: 56,
                  height: 56,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.2))',
                }}
              >
                <img
                  src={item.url}
                  alt="staged attachment"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStagedAttachment(idx)}
                  aria-label="Remove attachment"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <HStack gap={2} align="center">
          {/* Plus action button on the left */}
          <IconButton
            variant={isMediaMenuOpen ? 'primary' : 'ghost'}
            size="sm"
            label="Add media or emoji"
            data-testid="chat-plus-menu-btn"
            onClick={() => setIsMediaMenuOpen((prev) => !prev)}
            icon={<Icon icon={PlusNavIcon} size="sm" />}
          />

          <div style={{ flex: 1 }}>
            <TextInput
              label="Message"
              isLabelHidden
              data-testid="chat-message-input"
              value={inputText}
              placeholder="Message..."
              onChange={setInputText}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Send button on the right */}
          <IconButton
            variant="primary"
            size="sm"
            label="Send message"
            data-testid="chat-send-btn"
            onClick={handleSend}
            isDisabled={!inputText.trim() && stagedAttachments.length === 0}
            icon={<Icon icon="arrowUp" size="sm" />}
          />
        </HStack>
      </div>
    </div>
  );
}

export default ChatThreadView;
