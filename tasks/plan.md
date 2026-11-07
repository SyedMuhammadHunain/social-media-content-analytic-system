# Implementation Plan: Direct Messaging Persistence & Receiver Synchronization

## Overview
Implement complete end-to-end direct messaging persistence in MongoDB Atlas and background polling synchronization between sender and receiver users:
1. Store messages in a dedicated MongoDB collection (`chat_messages`).
2. Provide Spring Boot 3 reactive domain models, repository, service, and controller endpoints in `backend/common-models` and `backend/api-gateway`.
3. Provide a frontend API client (`chatApi.ts`) and background polling synchronization in `useChatState.ts` so receivers see incoming messages without refreshing.
4. Maintain transparent fallback to local storage so offline tests and mock accounts continue to work seamlessly.

## Architecture Decisions
- **Deterministic Conversation ID:**
  Compute conversation ID as `conv_${min(userA, userB)}_${max(userA, userB)}`. Both sender and receiver always resolve and query the exact same conversation key.
- **Dedicated Mongo Collection (`chat_messages`):**
  Collection has compound indexes on `(conversationId, createdAt ASC)` for fast transcript retrieval, and `(recipientId, read)` for unread counts.
- **REST Polling over WebSockets:**
  Poll `/v1/chat/messages?with={userId}` every 3 seconds while viewing a conversation, matching the existing notifications polling design and eliminating unnecessary WebSocket broker dependencies.
- **Optimistic UI with Graceful Fallback:**
  Frontend displays messages optimistically and falls back to `chatStorage` if the backend Gateway is offline.

## Task List

### Phase 1: Backend Domain Models & DTOs
- [x] Task 1: Create ChatMessage document model and DTOs in `common-models`
  - **Files:** `backend/common-models/src/main/java/com/social/common/model/ChatMessage.java`, `backend/common-models/src/main/java/com/social/common/model/ChatMediaItem.java`, `backend/common-models/src/main/java/com/social/common/dto/SendMessageRequest.java`, `backend/common-models/src/main/java/com/social/common/dto/ChatConversationSummary.java`
  - **Scope:** S (4 files)

### Phase 2: Backend Repository, Service & Controller
- [x] Task 2: Implement Reactive repository, Service, and REST Controller in `api-gateway`
  - **Files:** `backend/api-gateway/src/main/java/com/social/gateway/repository/ReactiveChatMessageRepository.java`, `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayChatMessageService.java`, `backend/api-gateway/src/main/java/com/social/gateway/controller/ChatMessageController.java`
  - **Scope:** M (3 files)

### Phase 3: Frontend API Client & Polling Synchronization
- [x] Task 3: Create `chatApi.ts` and integrate 3s polling synchronization in `useChatState.ts`
  - **Files:** `frontend/src/api/chatApi.ts`, `frontend/src/api/index.ts`, `frontend/src/app/chat/useChatState.ts`
  - **Scope:** S (3 files)

### Phase 4: Automated Testing & Quality Gates
- [x] Task 4: Automated unit & integration tests and quality gates
  - **Files:** `frontend/test/chat_messaging.test.mjs`
  - **Scope:** S (1 file)

### Phase 5: Live Browser DevTools Verification
- [x] Task 5: Live Browser Testing with Chrome DevTools Protocol
  - **Files:** `frontend/scripts/run-devtools-chat-test.mjs`, `docs/reports/DEVTOOLS_CHAT_VERIFICATION.md`
  - **Scope:** S (2 files)

## Verification
- Backend compile: `cd backend/common-models && mvn clean compile` & `cd backend/api-gateway && mvn clean compile`
- Frontend typecheck: `cd frontend && npx tsc -b`
- Frontend lint: `cd frontend && npm run lint`
- Frontend unit & integration test: `cd frontend && node --test test/chat_messaging.test.mjs`
- Frontend build: `cd frontend && npm run build`
- DevTools live test: `cd frontend && node scripts/run-devtools-chat-test.mjs`
