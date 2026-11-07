# Implementation Plan: Direct Messaging Full-Stack Enhancements & UX Fixes

## Overview
Address and verify the 8 user-reported messaging, persistence, profile connection, notification, and layout requirements:
1. Follow button in chat updates connections & profile following count.
2. Verified message persistence in MongoDB collection `chat_messages`.
3. Saved message rehydration on page refresh/initial load from MongoDB.
4. Bidirectional message synchronization between sender and receiver.
5. In-app and backend notification generation for incoming messages in recipient's Notification tab.
6. "Message" action button on visited user profiles navigating to chat thread.
7. Desktop horizontal alignment of the Messages center panel with left & right sidebars (level with `top: 24px`).
8. Clean Android mobile viewport styling (full-width edge-to-edge, sticky composer, no top gap or navbar collisions).

## Architecture Decisions
- **Spring Boot Gateway Restart & Mongo Live Verification:**
  Recompile and start the live Spring Boot API Gateway process on port 8080 so `/v1/chat/messages` and `/v1/notifications` endpoints persist to MongoDB Atlas.
- **Notification Type Extension:**
  Add `MESSAGE` enum constant to `NotificationType.java`. `GatewayChatMessageService.sendMessage` will trigger a notification record in MongoDB for `recipientId`.
- **Message Notification UI:**
  Update `NotificationListPage.tsx` to handle `MESSAGE` notifications, rendering an Astryx chat/message icon and allowing direct navigation to that conversation.
- **Unified Follow Graph State:**
  Wire `ChatProfilePresentation` to trigger `recordConnectionChange` and update `followingCount` via an `onToggleFollow` prop originating in `useFollowAction`.
- **Profile Visiting Message Action:**
  Update `ProfileMetaDetails.tsx` to render an Astryx secondary "Message" button alongside "Follow" when `isOwnProfile` is false.
- **Horizontal Desktop Alignment & Responsive Split:**
  Apply `padding-top: 24px` on desktop (`min-width: 768px`) for `.newsfeed-center-scroll.is-messages` so it sits flush with the left and right fixed sidebars, while retaining `padding: 0` and 100dvh full width on Android mobile viewports (`max-width: 767px`).

## Task List

### Phase 1: Backend Persistence & Notification Integration (Items 2, 3, 4, 5)
- [x] Task 1: Extend `NotificationType` with `MESSAGE` and trigger notification on `sendMessage` in `GatewayChatMessageService`.
- [x] Task 2: Recompile and restart Spring Boot `api-gateway` on port 8080, verify MongoDB Atlas `chat_messages` collection saves and retrieves messages.

### Checkpoint: Backend Persistence
- [x] `POST /v1/chat/messages` persists to MongoDB and returns 200 OK.
- [x] `GET /v1/chat/messages?with={userId}` returns persisted transcript.
- [x] `GET /v1/notifications?userId={recipientId}` returns message notification.

### Phase 2: Frontend Message Sync, Refresh Rehydration & Notifications (Items 2, 3, 4, 5)
- [x] Task 3: Implement initial transcript rehydration on refresh/mount in `useChatState.ts`.
- [x] Task 4: Add `MESSAGE` notification handling and chat navigation in `NotificationListPage.tsx`.

### Phase 3: Profile Connection & Message Button Integration (Items 1, 6)
- [x] Task 5: Wire Follow button in `ChatProfilePresentation` to update connections and profile following count.
- [x] Task 6: Add "Message" action button in `ProfileMetaDetails.tsx` for visited profiles, navigating to chat.

### Phase 4: Desktop Horizontal Alignment & Android Responsiveness (Items 7, 8)
- [x] Task 7: Level Message page horizontally with sidebars (`top: 24px`) on desktop; maintain clean edge-to-edge layout on Android viewports.

### Phase 5: Verification & End-to-End DevTools Testing
- [x] Task 8: Automated unit tests, Maven backend tests, and Chrome DevTools Protocol verification with screenshots.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Gateway process port conflict on 8080 | Medium | Gracefully stop PID 98480 before restarting compiled Spring Boot gateway JAR. |
| StrictMode double-triggering follow connection count | Low | Use idempotent connection updates keyed by target userId in `profileActivityStore`. |
| Mobile viewport 100dvh scrollbar regression | Medium | DevTools CDP test on Android mobile preset (390x844) to verify sticky composer and full width. |
