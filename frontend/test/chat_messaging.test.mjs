// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Direct Chat & Messaging Test Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getOrCreateConversation,
  appendMessage,
  getTotalUnreadCount,
  markConversationAsRead,
} from '../src/utils/chatStorage.ts';
import {
  HOWARD_LE_USER,
  INITIAL_SEED_CONVERSATIONS,
} from '../src/mock/mockChatData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..');

test('Direct Chat & Messaging Unit & Integration Suite', async (t) => {
  await t.test('1. chatStorage: conversation creation, message append, and unread count', () => {
    let conversations = [...INITIAL_SEED_CONVERSATIONS];
    const initialUnread = getTotalUnreadCount(conversations);
    assert.strictEqual(typeof initialUnread, 'number', 'Initial unread count must be a number');

    // Create / get conversation with Howard Le
    const { conversation, updatedList } = getOrCreateConversation(conversations, HOWARD_LE_USER);
    assert.ok(conversation, 'Must return a conversation');
    assert.strictEqual(conversation.participant.username, 'uxui_howard.le');

    // Append a message with text and an image attachment
    const newMsg = {
      id: 'test_msg_101',
      conversationId: conversation.id,
      senderId: 'user_hunain',
      recipientId: HOWARD_LE_USER.id,
      text: 'Checking out the Astryx Chat layout!',
      media: [
        {
          type: 'image',
          url: 'https://example.com/mock-design.png',
          name: 'mock-design.png',
        },
      ],
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    const { updatedList: listAfterMsg, updatedConversation } = appendMessage(
      updatedList,
      conversation.id,
      newMsg
    );

    assert.ok(updatedConversation, 'Must update target conversation');
    assert.strictEqual(updatedConversation.messages.length, conversation.messages.length + 1);
    assert.strictEqual(updatedConversation.lastMessage?.text, 'Checking out the Astryx Chat layout!');
    assert.strictEqual(updatedConversation.lastMessage?.media?.[0].type, 'image');

    // Verify deduplication: re-appending the exact same message ID must NOT duplicate it
    const { updatedList: listAfterDupe, updatedConversation: dupeConv } = appendMessage(
      listAfterMsg,
      conversation.id,
      newMsg
    );
    assert.strictEqual(
      dupeConv?.messages.length,
      updatedConversation.messages.length,
      'Duplicate message ID must not be appended twice'
    );

    // Mark as read
    const readList = markConversationAsRead(listAfterDupe, conversation.id);
    const targetConv = readList.find((c) => c.id === conversation.id);
    assert.strictEqual(targetConv?.unreadCount, 0, 'Unread count must be cleared after marking read');
  });

  await t.test('2. ChatRecipientHeader.tsx strictly uses Astryx components and icons (no 3-dot menu or Threads copy)', () => {
    const headerPath = path.join(FRONTEND_DIR, 'src/app/chat/ChatRecipientHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'ChatRecipientHeader.tsx must exist');
    const content = fs.readFileSync(headerPath, 'utf8');

    assert.ok(
      content.includes('@astryxdesign/core/Avatar'),
      'Must import Astryx Avatar'
    );
    assert.ok(
      content.includes('@astryxdesign/core/Button'),
      'Must import Astryx Button'
    );
    assert.ok(
      content.includes('@astryxdesign/core/Icon'),
      'Must import Astryx Icon'
    );
    assert.ok(
      content.includes('chat-recipient-pinned-profile'),
      'Must include pinned center profile presentation matching screenshot'
    );
    assert.ok(
      content.includes('chat-view-profile-btn'),
      'Must include View profile button'
    );
    assert.ok(
      content.includes('onViewProfile(participant)'),
      'Must pass participant UserProfile object to onViewProfile callback'
    );
    assert.ok(
      !content.includes('verifiedBadge') && !content.includes('VerifiedNavIcon') && !content.includes('icon="check"'),
      'Must not include tick or check verified icon in chat header'
    );
    assert.ok(
      content.includes('chat-follow-toggle-btn'),
      'Must include Follow button'
    );
    assert.ok(
      !content.includes('You don\'t follow each other on Threads'),
      'Must not include Threads-specific copy'
    );
    assert.ok(
      !content.includes('moreHorizontal') && !content.includes('Dot Menu'),
      'Must not include top right 3-dot menu per instructions'
    );
  });

  await t.test('3. ChatMediaAttachmentMenu.tsx provides Photo/Video, GIF, and Emoji selections', () => {
    const menuPath = path.join(FRONTEND_DIR, 'src/app/chat/ChatMediaAttachmentMenu.tsx');
    assert.ok(fs.existsSync(menuPath), 'ChatMediaAttachmentMenu.tsx must exist');
    const content = fs.readFileSync(menuPath, 'utf8');

    assert.ok(
      content.includes('chat-action-photos'),
      'Must provide Photos & Video file picker'
    );
    assert.ok(
      content.includes('chat-action-gif'),
      'Must provide Animated GIF selection'
    );
    assert.ok(
      content.includes('chat-action-emoji'),
      'Must provide Emoji selection'
    );
    assert.ok(
      content.includes('PRESET_GIFS'),
      'Must use PRESET_GIFS from existing presetGifs module'
    );
  });

  await t.test('4. ChatThreadView.tsx integrates Astryx Chat primitives, PlusNavIcon, and seamless layout', () => {
    const threadPath = path.join(FRONTEND_DIR, 'src/app/chat/ChatThreadView.tsx');
    assert.ok(fs.existsSync(threadPath), 'ChatThreadView.tsx must exist');
    const content = fs.readFileSync(threadPath, 'utf8');

    assert.ok(
      content.includes('@astryxdesign/core/Chat'),
      'Must import from @astryxdesign/core/Chat'
    );
    assert.ok(
      content.includes('ChatMessageList'),
      'Must render ChatMessageList'
    );
    assert.ok(
      content.includes('ChatMessageBubble'),
      'Must render ChatMessageBubble'
    );
    assert.ok(
      content.includes('ChatMessageMetadata'),
      'Must render ChatMessageMetadata'
    );
    assert.ok(
      content.includes('ChatSystemMessage'),
      'Must integrate ChatSystemMessage'
    );
    assert.ok(
      content.includes('ChatLayoutScrollButton'),
      'Must integrate ChatLayoutScrollButton'
    );
    assert.ok(
      content.includes('chat-staged-attachments-tray'),
      'Must support previewing staged attachments before sending'
    );
    assert.ok(
      content.includes('PlusNavIcon'),
      'Must use PlusNavIcon for the left attachment button'
    );
    assert.ok(
      content.includes('chat-plus-menu-btn'),
      'Must include "+" action menu button on composer bar'
    );
    assert.ok(
      content.includes('chat-send-btn'),
      'Must include send button on opposite right side'
    );
    assert.ok(
      !content.includes('Press Enter to send'),
      'Must not include "Press Enter to send" line'
    );
  });

  await t.test('5. Shell Integration: Left Rail shortcut, NewsFeedPage switch, and Mobile Drawer', () => {
    const shortcutsPath = path.join(FRONTEND_DIR, 'src/app/feed/FeedShortcutsCard.tsx');
    const newsfeedPath = path.join(FRONTEND_DIR, 'src/app/feed/NewsFeedPage.tsx');
    const drawerPath = path.join(FRONTEND_DIR, 'src/app/feed/MobileNavigationDrawer.tsx');

    const shortcutsContent = fs.readFileSync(shortcutsPath, 'utf8');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');
    const drawerContent = fs.readFileSync(drawerPath, 'utf8');

    assert.ok(
      shortcutsContent.includes("type: 'MESSAGES'"),
      'FeedShortcutsCard must include MESSAGES tab'
    );
    assert.ok(
      shortcutsContent.includes('unreadMessages'),
      'FeedShortcutsCard must display unread count badge'
    );
    assert.ok(
      newsfeedContent.includes("activeTab === 'messages'"),
      'NewsFeedPage must mount ChatPage when activeTab is messages'
    );
    assert.ok(
      newsfeedContent.includes('ChatPage'),
      'NewsFeedPage must import ChatPage'
    );
    assert.ok(
      drawerContent.includes('drawer-messages-action'),
      'MobileNavigationDrawer must provide Messages navigation action'
    );
  });

  await t.test('6. Backend Persistence & Polling Integration: chatApi and useChatState', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/chatApi.ts');
    const hookPath = path.join(FRONTEND_DIR, 'src/app/chat/useChatState.ts');

    assert.ok(fs.existsSync(apiPath), 'chatApi.ts must exist');
    assert.ok(fs.existsSync(hookPath), 'useChatState.ts must exist');

    const apiContent = fs.readFileSync(apiPath, 'utf8');
    const hookContent = fs.readFileSync(hookPath, 'utf8');

    assert.ok(
      apiContent.includes('/v1/chat/messages'),
      'chatApi must target /v1/chat/messages endpoint'
    );
    assert.ok(
      apiContent.includes('/v1/chat/conversations'),
      'chatApi must target /v1/chat/conversations endpoint'
    );
    assert.ok(
      apiContent.includes('sendMessage'),
      'chatApi must export sendMessage'
    );
    assert.ok(
      apiContent.includes('getConversationMessages'),
      'chatApi must export getConversationMessages'
    );
    assert.ok(
      hookContent.includes('syncRemoteMessages'),
      'useChatState must include syncRemoteMessages'
    );
    assert.ok(
      hookContent.includes('setInterval(syncRemoteMessages, 3000)'),
      'useChatState must poll remote messages every 3 seconds'
    );
    assert.ok(
      hookContent.includes('chatApi') && hookContent.includes('sendMessage'),
      'useChatState must dispatch messages to backend chatApi'
    );
  });

  await t.test('7. ChatProfilePresentation and Follow connection integration', () => {
    const headerPath = path.join(FRONTEND_DIR, 'src/app/chat/ChatRecipientHeader.tsx');
    const threadPath = path.join(FRONTEND_DIR, 'src/app/chat/ChatThreadView.tsx');
    const chatPagePath = path.join(FRONTEND_DIR, 'src/app/chat/ChatPage.tsx');

    const headerContent = fs.readFileSync(headerPath, 'utf8');
    const threadContent = fs.readFileSync(threadPath, 'utf8');
    const chatPageContent = fs.readFileSync(chatPagePath, 'utf8');

    assert.ok(
      headerContent.includes('onToggleFollow'),
      'ChatProfilePresentation must accept onToggleFollow'
    );
    assert.ok(
      threadContent.includes('onToggleFollow'),
      'ChatThreadView must forward onToggleFollow'
    );
    assert.ok(
      chatPageContent.includes('onToggleFollow'),
      'ChatPage must accept onToggleFollow'
    );
  });

  await t.test('8. ProfileMetaDetails: Message button for visited profiles', () => {
    const metaPath = path.join(FRONTEND_DIR, 'src/components/profile/ProfileMetaDetails.tsx');
    const viewPath = path.join(FRONTEND_DIR, 'src/components/profile/UserProfileView.tsx');

    const metaContent = fs.readFileSync(metaPath, 'utf8');
    const viewContent = fs.readFileSync(viewPath, 'utf8');

    assert.ok(
      metaContent.includes('profile-header-message-btn'),
      'ProfileMetaDetails must render profile-header-message-btn'
    );
    assert.ok(
      metaContent.includes('onMessageUser'),
      'ProfileMetaDetails must accept onMessageUser'
    );
    assert.ok(
      viewContent.includes('onMessageUser'),
      'UserProfileView must accept onMessageUser'
    );
  });

  await t.test('9. NotificationListPage: MESSAGE notification rendering and chat navigation', () => {
    const notifPath = path.join(FRONTEND_DIR, 'src/app/notifications/NotificationListPage.tsx');
    const notifContent = fs.readFileSync(notifPath, 'utf8');

    assert.ok(
      notifContent.includes("'MESSAGE'"),
      'NotificationListPage must handle MESSAGE type'
    );
    assert.ok(
      notifContent.includes('MessagesNavIcon'),
      'NotificationListPage must use MessagesNavIcon for chat notifications'
    );
    assert.ok(
      notifContent.includes('onOpenChatWithUser'),
      'NotificationListPage must accept onOpenChatWithUser'
    );
  });

  await t.test('10. Desktop horizontal alignment and Android responsiveness in NewsFeedPage', () => {
    const newsfeedPath = path.join(FRONTEND_DIR, 'src/app/feed/NewsFeedPage.tsx');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');

    assert.ok(
      newsfeedContent.includes('.newsfeed-center-scroll.is-messages'),
      'NewsFeedPage must have .newsfeed-center-scroll.is-messages styling'
    );
    assert.ok(
      newsfeedContent.includes('margin-top: 24px') || newsfeedContent.includes('padding-top: 24px'),
      'Desktop message center scroll must have 24px offset for horizontal leveling'
    );
  });
});
