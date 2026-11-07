# Spec: Direct Messaging & Chat Feature

## Objective
Implement a responsive 1-on-1 direct messaging and chat interface in the Social Media Content Analysis System web application. When a user navigates to "Messages" from the left sidebar ("Feeds & Shortcuts") or mobile navigation, the center view switches from the newsfeed to a direct messaging workspace. Users can search and select contacts, view conversation history with a Threads-style pinned recipient summary, and send text, emojis, preset GIFs, and media attachments rendered with native Meta Astryx chat components and icons.

## Tech Stack
- Frontend: React 19, TypeScript 5.8, Vite 8
- UI Design System: Strictly Meta Astryx (`@astryxdesign/core`)
- Chat Components: `@astryxdesign/core/Chat` (`ChatLayout`, `ChatMessageList`, `ChatMessage`, `ChatMessageBubble`, `ChatMessageMetadata`, `ChatComposer`, `ChatComposerInput`, `ChatSendButton`, `useChatStreamScroll`)
- Iconography: Astryx Icons only (`<Icon name="..." />` string-mode / Astryx icon registry)
- Storage: Client-side local storage (`localStorage`) with in-memory fallback for instant persistence across tab navigations

## Commands
```bash
# Build
cd frontend && npm run build

# Unit & Integration Tests
cd frontend && npm test

# Specific Chat Integration Test
cd frontend && node --test test/chat_messaging.test.mjs

# Typecheck
cd frontend && npx tsc -b

# Lint
cd frontend && npx oxlint .

# Local Dev Server
cd frontend && npm run dev
```

## Project Structure
```
frontend/src/
├── app/
│   ├── chat/
│   │   ├── ChatPage.tsx                  → Main messaging view (center column workspace)
│   │   ├── ChatContactList.tsx           → Search bar + suggested/recent user contacts list
│   │   ├── ChatThreadView.tsx            → Active conversation thread + header + composer
│   │   ├── ChatRecipientHeader.tsx       → Threads-style pinned contact card (avatar, bio, follow)
│   │   ├── ChatMediaAttachmentMenu.tsx   → Popover for Photos, GIFs, Emojis triggered by "+"
│   │   └── useChatState.ts               → State hook for conversations, active contact, message sending
│   └── feed/
│       ├── FeedShortcutsCard.tsx         → Adds "Messages" item with unread badge to left rail
│       ├── NewsFeedLeftSidebar.tsx       → Passes messaging selection handlers
│       ├── NewsFeedPage.tsx              → Mounts ChatPage in center column when activeTab === 'messages'
│       ├── MobileBottomNav.tsx           → Adds Messages icon/tab to mobile bottom nav
│       └── MobileNavigationDrawer.tsx     → Adds Messages item to mobile slide drawer
├── mock/
│   └── mockChatData.ts                   → Seed conversations, initial direct messages, active contacts
├── types/
│   └── chat.ts                           → TypeScript contracts (ChatMessageItem, ChatConversation, MediaAttachment)
└── utils/
    └── chatStorage.ts                    → Local persistence helpers for chat threads and unread counts

test/
└── chat_messaging.test.mjs               → Node.js native integration test suite for chat workflows
```

## Data Contracts & Type Definitions

```typescript
// frontend/src/types/chat.ts
import type { UserProfile } from './social';

export type ChatMediaType = 'image' | 'gif' | 'video';

export interface ChatMediaAttachment {
  type: ChatMediaType;
  url: string;
  name?: string;
  thumbnailUrl?: string;
}

export interface DirectChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text?: string;
  media?: ChatMediaAttachment[];
  timestamp: string; // ISO 8601
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  participant: UserProfile;
  lastMessage?: DirectChatMessage;
  unreadCount: number;
  updatedAt: string;
  messages: DirectChatMessage[];
}
```

## Code Style & Conventions

```tsx
// Example Astryx Chat usage in ChatThreadView.tsx
import { ChatLayout, ChatMessageList, ChatMessage, ChatMessageBubble, ChatComposer, ChatComposerInput, ChatSendButton } from '@astryxdesign/core/Chat';
import { Icon } from '@astryxdesign/core/Icon';
import { Button } from '@astryxdesign/core/Button';

export function ChatThreadView({ conversation, onSendMessage, onBack }: ChatThreadViewProps) {
  return (
    <div className="chat-thread-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatRecipientHeader participant={conversation.participant} onBack={onBack} />
      <ChatLayout>
        <ChatMessageList>
          {conversation.messages.map((msg) => (
            <ChatMessage key={msg.id} align={msg.senderId === currentUserId ? 'end' : 'start'}>
              <ChatMessageBubble variant={msg.senderId === currentUserId ? 'primary' : 'neutral'}>
                {msg.media?.map((m) => (
                  <img key={m.url} src={m.url} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8 }} />
                ))}
                {msg.text && <div>{msg.text}</div>}
              </ChatMessageBubble>
            </ChatMessage>
          ))}
        </ChatMessageList>
      </ChatLayout>
      <ChatInputComposer onSend={onSendMessage} />
    </div>
  );
}
```

## UI & Responsive Behavior
1. **Desktop (>= 1024px):**
   - Keeps Left Sidebar and Right Sidebar visible.
   - Replaces only the middle feed column with `ChatPage`.
   - In `ChatPage`: When no active conversation is selected, shows top Search Input + Suggested/Recent contacts list. When a contact is selected, shows back button to contacts, the pinned recipient profile card, message list, and composer.
2. **Mobile (< 768px) & Tablet:**
   - Adapts to full screen viewport height (`100dvh`).
   - Mobile bottom nav and top header retain "Messages" tab access.
   - Pinned profile card scales cleanly; composer sticks to bottom above virtual keyboard.
3. **Screenshot Fidelity (`Screenshot From 2026-11-07 09-30-24.png`):**
   - Includes: Top recipient identity bar (avatar, name, verified badge, title), pinned center recipient card with large avatar, name, follower count, "View profile" and "Follow" buttons.
   - Excludes: Top right three-dot menu, Threads-specific disclaimer copy.
   - Bottom composer: Includes `+` action button (media/GIF/emoji tray), text input, and send action using Astryx icons only.

## Testing Strategy
- Framework: Native `node:test` + `node:assert` (consistent with repo test suite).
- Location: `frontend/test/chat_messaging.test.mjs`.
- Test cases:
  1. Contact discovery: filtering users by username and display name.
  2. Conversation creation & retrieval: opening thread with a contact.
  3. Sending text message: appends message with correct sender and recipient.
  4. Sending media/GIF/emoji: validates attachment structure in message payload.
  5. Persistence: verifying messages and read status persist in localStorage.
  6. Navigation state: verifying switching between Feed and Messages preserves state.

## Boundaries
- **Always:**
  - Strictly use Astryx Design System (`@astryxdesign/core`) components.
  - Strictly use Astryx Design System icons via `<Icon name="..." />`.
  - Maintain type safety (`npx tsc -b` must pass with zero errors).
  - Run `npm test` and `npx oxlint .` before finalizing.
- **Ask First:**
  - Adding third-party UI or chat packages (strictly prohibited unless approved).
  - Changing global layout proportions outside the center workspace.
- **Never:**
  - Hardcode raw ad-hoc CSS stylesheets when Astryx primitives/tokens exist.
  - Introduce third-party icon libraries like lucide/fontawesome.
  - Break existing NewsFeed, Profile, or Analytics views.

## Success Criteria
- [ ] "Messages" tab appears in Left Sidebar "Feeds & Shortcuts" with unread badge counter.
- [ ] Clicking "Messages" mounts `ChatPage` in the center column without breaking the 3-column desktop shell.
- [ ] Top search input in `ChatPage` searches users in real-time.
- [ ] Selecting a contact displays the conversation thread with Threads-style recipient header.
- [ ] Users can send text, emoji, animated GIFs, and image attachments.
- [ ] Messages persist across tab switches via client storage.
- [ ] Responsive layout renders cleanly on Android viewport widths (< 450px).
- [ ] All unit/integration tests pass cleanly.

## Open Questions
None. All primary behavioral decisions resolved during interview.
