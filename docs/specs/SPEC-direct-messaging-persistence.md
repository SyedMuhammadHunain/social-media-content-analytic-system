# Spec: Direct Messaging Persistence & Receiver Synchronization

## Objective
Enable full end-to-end direct messaging persistence in MongoDB Atlas and synchronization between sender and receiver users:
1. When User A sends a message to User B, it is persisted to a dedicated MongoDB collection (`chat_messages`).
2. User B sees the message in their conversation thread when active or via periodic background polling (every 3 seconds), without requiring a page refresh.
3. Spring Boot REST API endpoints, DTOs, reactive repositories, and service layer are provided in `backend/api-gateway` and `backend/common-models`.
4. The React frontend (`chatApi.ts`, `useChatState.ts`) connects to the Gateway API while maintaining an offline localStorage fallback so offline testing and seed accounts remain unbroken.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3.3.4, Spring WebFlux (Reactive), Spring Data MongoDB, Lombok, Maven.
- **Database:** MongoDB Atlas (ReactiveMongoTemplate, ReactiveMongoRepository), collection `chat_messages`.
- **Frontend:** React 19, TypeScript 5.8, Meta Astryx (`@astryxdesign/core`), Vite 8, native `fetch`.

## Commands
- **Backend Build & Test:**
  `mvn -DskipTests clean compile` (root or per service)
  `cd backend/api-gateway && mvn test`
- **Frontend Build & Test:**
  `cd frontend && npx tsc -b`
  `cd frontend && npm run lint`
  `cd frontend && node --test test/chat_messaging.test.mjs`
  `cd frontend && npm run build`

## Project Structure
```
backend/
  common-models/src/main/java/com/social/common/
    model/
      ChatMessage.java                  # Mongo Document in "chat_messages"
      ChatMediaItem.java                # Nested media attachment model
    dto/
      SendMessageRequest.java           # DTO for sending a message
  api-gateway/src/main/java/com/social/gateway/
    repository/
      ReactiveChatMessageRepository.java # Reactive Mongo queries
    service/
      GatewayChatMessageService.java     # Message creation, retrieval & read state
    controller/
      ChatMessageController.java         # /v1/chat/messages REST endpoints
frontend/
  src/
    api/
      chatApi.ts                        # Gateway client with auth token headers
    app/chat/
      useChatState.ts                   # Polling synchronization & optimistic updates
    utils/
      chatStorage.ts                    # Local persistence & offline fallback cache
  test/
    chat_messaging.test.mjs             # Node native test runner suite
```

## Data Model & API Contracts

### MongoDB Collection: `chat_messages`
```java
@Document(collection = "chat_messages")
@CompoundIndex(name = "convo_created_idx", def = "{'conversationId': 1, 'createdAt': 1}")
@CompoundIndex(name = "recipient_read_idx", def = "{'recipientId': 1, 'read': 1}")
public class ChatMessage {
    @Id
    private String id;
    @Indexed
    private String conversationId; // deterministic or hash of sorted {userA, userB}
    @Indexed
    private String senderId;
    @Indexed
    private String recipientId;
    private String text;
    private List<ChatMediaItem> media;
    private boolean read;
    private Instant createdAt;
}
```

### Deterministic Conversation ID
To ensure both User A and User B always map to the exact same thread:
`conversationId = "conv_" + (senderId.compareTo(recipientId) < 0 ? senderId + "_" + recipientId : recipientId + "_" + senderId)`

### REST Endpoints (`ChatMessageController.java`):
- `POST /v1/chat/messages`
  - Body: `SendMessageRequest` (`recipientId`, `text`, `media`)
  - Auth: Bearer Token or extracted `senderId` from JWT/session header
  - Response: `ApiResponse<ChatMessage>`
- `GET /v1/chat/messages?with={userId}`
  - Retrieves chronological messages for conversation between authenticated user and target `userId`
  - Response: `ApiResponse<List<ChatMessage>>`
- `GET /v1/chat/conversations`
  - Retrieves distinct conversations for the authenticated user with latest message and unread count
  - Response: `ApiResponse<List<ChatConversationSummary>>`
- `PUT /v1/chat/conversations/{conversationId}/read`
  - Marks incoming messages from the partner as read
  - Response: `ApiResponse<Void>`

## Code Style
```java
@RestController
@RequestMapping("/v1/chat/messages")
public class ChatMessageController {
    private final GatewayChatMessageService chatMessageService;

    public ChatMessageController(GatewayChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<ChatMessage>>> sendMessage(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody SendMessageRequest request) {
        return chatMessageService.sendMessage(headerUserId, request)
                .map(msg -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success(msg, "Message sent successfully.")));
    }
}
```

## Testing Strategy
- **Backend Unit & Integration Tests:**
  - Mock repository in `GatewayChatMessageServiceTest.java`.
  - Validate deterministic conversation ID generation.
  - Test message ordering by `createdAt ASC`.
- **Frontend Automated Tests:**
  - `frontend/test/chat_messaging.test.mjs` verifies `chatApi` client methods, polling hook behavior, and offline fallback compatibility.
  - Full end-to-end typecheck (`npx tsc -b`) and build (`npm run build`).

## Boundaries
- **Always:** Use deterministic conversation IDs so both parties point to identical thread IDs.
- **Always:** Provide transparent offline fallback to localStorage when the Spring Boot backend or MongoDB Atlas is unreachable.
- **Ask first:** Modifying other microservices outside `api-gateway` and `common-models`.
- **Never:** Use raw ad-hoc WebSockets without Fallback or remove existing demo users/conversations.

## Success Criteria
1. `POST /v1/chat/messages` creates a record in `chat_messages` collection with valid `conversationId`, `senderId`, `recipientId`, and timestamp.
2. `GET /v1/chat/messages?with={userId}` returns messages between the two users sorted chronologically.
3. When User A sends a message in the browser, User B's polling hook fetches it within 3 seconds when viewing that thread.
4. If Gateway backend is stopped, direct messaging falls back gracefully to `chatStorage` with 0 UI errors.
5. All automated tests (`node --test test/chat_messaging.test.mjs`), `npx tsc -b`, and `npm run build` pass with 0 errors.

## Open Questions
- None. Polling interval, database collection name, and reactive architecture are aligned with existing project conventions.
