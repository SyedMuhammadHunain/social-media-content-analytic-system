# Active Tasks: Direct Messaging Persistence & Receiver Synchronization

Plan: `tasks/plan.md`

- [x] Task 1: Create ChatMessage document model and DTOs in `common-models`
  - **Description:** Implement `ChatMessage.java` (@Document collection "chat_messages"), `ChatMediaItem.java`, `SendMessageRequest.java`, and `ChatConversationSummary.java` in `com.social.common`.
  - **Acceptance criteria:**
    - [x] `ChatMessage.java` maps to MongoDB collection `chat_messages` with compound indexes.
    - [x] `SendMessageRequest.java` validates recipient and text/media content.
    - [x] `common-models` compiles cleanly via Maven.
  - **Verification:**
    - [x] `cd backend/common-models && mvn clean compile`
  - **Dependencies:** None
  - **Files likely touched:**
    - `backend/common-models/src/main/java/com/social/common/model/ChatMessage.java`
    - `backend/common-models/src/main/java/com/social/common/model/ChatMediaItem.java`
    - `backend/common-models/src/main/java/com/social/common/dto/SendMessageRequest.java`
    - `backend/common-models/src/main/java/com/social/common/dto/ChatConversationSummary.java`
  - **Estimated scope:** S (4 files)

- [x] Task 2: Implement Reactive repository, Service, and REST Controller in `api-gateway`
  - **Description:** Implement `ReactiveChatMessageRepository.java` for MongoDB reactive queries, `GatewayChatMessageService.java` for business logic (deterministic conversation ID, send, query, mark as read), and `ChatMessageController.java` with endpoints: `POST /v1/chat/messages`, `GET /v1/chat/messages?with={userId}`, `GET /v1/chat/conversations`, and `PUT /v1/chat/conversations/{id}/read`.
  - **Acceptance criteria:**
    - [x] Controller exposes `/v1/chat/messages` endpoints returning standard `ApiResponse` envelope.
    - [x] Service implements deterministic conversation ID logic so both participants share the same thread.
    - [x] `api-gateway` compiles cleanly via Maven.
  - **Verification:**
    - [x] `cd backend/api-gateway && mvn clean compile`
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `backend/api-gateway/src/main/java/com/social/gateway/repository/ReactiveChatMessageRepository.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayChatMessageService.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/controller/ChatMessageController.java`
  - **Estimated scope:** M (3 files)

- [x] Task 3: Create `chatApi.ts` and integrate 3s polling synchronization in `useChatState.ts`
  - **Description:** Build `frontend/src/api/chatApi.ts` for calling `/v1/chat/messages` endpoints with auth tokens. Update `useChatState.ts` to poll messages every 3 seconds for active conversations, update local storage cache, and fall back gracefully if backend is offline.
  - **Acceptance criteria:**
    - [x] `chatApi.ts` supports sending, fetching conversation messages, and marking read.
    - [x] `useChatState.ts` synchronizes messages every 3 seconds while thread is active.
    - [x] Transparent fallback to `chatStorage` if backend returns an error or is unreachable.
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
  - **Dependencies:** Task 2
  - **Files likely touched:**
    - `frontend/src/api/chatApi.ts`
    - `frontend/src/api/index.ts`
    - `frontend/src/app/chat/useChatState.ts`
  - **Estimated scope:** S (3 files)

- [x] Task 4: Automated unit & integration tests and quality gates
  - **Description:** Update `frontend/test/chat_messaging.test.mjs` to test `chatApi` client methods, deterministic ID generation, polling synchronization, and offline fallback. Run full quality gates (tsc, lint, tests, build).
  - **Acceptance criteria:**
    - [x] `node --test test/chat_messaging.test.mjs` passes all tests.
    - [x] `npx tsc -b` passes with 0 errors.
    - [x] `npm run lint` passes with 0 errors.
    - [x] `npm run build` succeeds cleanly.
  - **Verification:**
    - [x] `cd frontend && npm run lint && npx tsc -b && node --test test/chat_messaging.test.mjs && npm run build`
  - **Dependencies:** Task 1, Task 2, Task 3
  - **Files likely touched:**
    - `frontend/test/chat_messaging.test.mjs`
  - **Estimated scope:** S (1 file)

- [x] Task 5: Live Browser Testing with Chrome DevTools Protocol
  - **Description:** Run CDP automated testing script `frontend/scripts/run-devtools-chat-test.mjs` to verify desktop rendering, mobile edge-to-edge responsiveness, profile navigation, and message deduplication.
  - **Acceptance criteria:**
    - [x] Desktop chat navigation, profile presentation in scroll area, top identity bar fixed outside scroll area.
    - [x] Composer centered scroll button and clutter-free input verified.
    - [x] Sent message appears exactly 1 time (no duplicate).
    - [x] Mobile viewport 390x844 verifies 100% full width and 100dvh coverage.
    - [x] "View profile" button navigates cleanly to user profile.
    - [x] 0 fatal runtime console errors.
  - **Verification:**
    - [x] `cd frontend && node scripts/run-devtools-chat-test.mjs`
  - **Dependencies:** Task 1-4
  - **Files touched:**
    - `frontend/scripts/run-devtools-chat-test.mjs`
    - `docs/reports/DEVTOOLS_CHAT_VERIFICATION.md`

