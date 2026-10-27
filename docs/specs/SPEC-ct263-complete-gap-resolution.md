# Spec: CT-263 Complete PDF Gap Resolution

## Objective
Achieve 100% complete implementation fidelity against the 41-page NED University CT-263 Course Project document (`Social Media Content Analysis System.pdf`). Resolve all 4 identified gaps across Section 6 (API Design), Section 8.1 (Database Decisions), Section 10.1 (Use Case Diagram), Section 10.3 (Class Diagram), Section 10.4 (Communication Diagram), and Section 10.6 (Activity Diagram).

---

## The 4 Target Gaps & Requirements

### Gap 1: Real-Time Notification Alert System (§10.1, §10.3, §10.4, §10.6)
- **Specification:**
  - Class Diagram (p. 34): `Notification` entity with `notificationId: string`, `message: string`, `timeStamp: date`, `sendNotification()`.
  - Communication Diagram (p. 35): Message 3.3 `triggerNotification(userId)` from `InteractionController` to `NotificationService`.
  - Activity Diagram (p. 37): `Notify User (if required)` on comments, `Notify Followers (if required)` on post creation, and like/follow alerts.
- **Backend Architecture:**
  - `Notification` model:
    ```java
    public class Notification {
        private String id;
        private String recipientUserId;
        private String actorUserId;
        private String actorName;
        private String actorAvatar;
        private NotificationType type; // LIKE, COMMENT, FOLLOW
        private String targetPostId;
        private String message;
        private boolean read;
        private Instant createdAt;
    }
    ```
  - Endpoints routed via API Gateway (Port 8080):
    - `GET /v1/notifications/{userId}`: Retrieve recent notifications.
    - `PUT /v1/notifications/{id}/read`: Mark notification as read.
    - `POST /v1/notifications`: Internal trigger from interaction services.
- **Frontend Architecture:**
  - `AppTopNav.tsx`: Add Astryx Notification Bell with unread badge count next to User Switcher.
  - Interactive Notification Drawer / Menu showing timestamped notifications:
    - `"Alice liked your post"`
    - `"Bob commented on your post: 'Great analysis!'"`
    - `"Charlie started following you"`
  - Clicking notification marks it as read.

### Gap 2: Nested Comment Replies (§10.3 & §8.1)
- **Specification:**
  - Class Diagram (p. 34): `Comment.reply()`, `CommentService.replyComment()`.
  - Section 8.1 (p. 27): `CommentsDB supports nested comments / replies`.
- **Backend Architecture:**
  - Add optional `parentCommentId` field to `Comment` entity and `CommentRequest` DTO in `backend/common-models`.
  - `comment-service` stores `parentCommentId` in `CommentsDB`.
  - `GET /v1/comment/{postId}` preserves nested child comments or hierarchical mapping.
- **Frontend Architecture:**
  - `PostCard.tsx`: Add "Reply" button under individual comments.
  - Clicking "Reply" opens an indented reply composer citing the author's handle.
  - Renders nested replies indented with visual hierarchy under the parent comment.

### Gap 3: REST HTTP Method Alignment (§6, Page 15)
- **Specification:**
  - Table on Page 15 explicitly specifies `DELETE /v1/unlike` and `DELETE /v1/unfollow`.
- **Backend Architecture:**
  - `LikeController.java`: Support both `@PostMapping("/unlike")` and `@DeleteMapping("/unlike")`.
  - `FollowController.java`: Support both `@PostMapping("/unfollow")` and `@DeleteMapping("/unfollow")`.
  - Gateway CORS: Ensure `DELETE` method is permitted and routed cleanly.
  - Update `socialApi.ts` to support both `DELETE` and `POST` calls.

### Gap 4: Logout Confirmation Feedback (§10.6, Page 37)
- **Specification:**
  - Activity Diagram (p. 37): `Log Out -> Invalidate Session -> Clear Session Data -> Showed Logout Message`.
- **Frontend Architecture:**
  - In `AuthContext.tsx` or `AppTopNav.tsx`, when logging out, record flash message `"You have been logged out successfully."`.
  - Render confirmation banner / alert toast on the Auth login screen.

---

## Tech Stack
- **Frontend:** React 19, TypeScript 5.8, Meta Astryx (`@astryxdesign/core`), Vite 8.
- **Backend:** Java 21, Spring Boot 3.4.2, Spring Cloud Gateway, Reactive WebFlux, MongoDB Atlas.
- **Design Tokens:** Strictly Meta Astryx components (`Button`, `Badge`, `Card`, `Text`, `Heading`, `Avatar`, `Divider`, `Layout`).

---

## Commands
```bash
# Frontend
cd frontend && npx tsc -b
cd frontend && npm run lint
cd frontend && npm run test:unit
cd frontend && npm run build

# Backend
cd backend && mvn test
cd backend && mvn test -pl api-gateway,like-unlike-service,comment-service,follow-service

# E2E Headless Chrome CDP Verification
node tests/e2e-azure-upload.test.mjs
node tests/e2e-gateway-integration.test.mjs
```

---

## Project Structure
```text
backend/common-models/src/main/java/com/social/common/
  ├── dto/NotificationDto.java
  ├── model/Notification.java
backend/api-gateway/src/main/java/com/social/gateway/
  ├── controller/NotificationController.java
  ├── service/NotificationService.java
backend/like-unlike-service/src/main/java/com/social/like/
  └── controller/LikeController.java (add DELETE mapping)
backend/follow-service/src/main/java/com/social/follow/
  └── controller/FollowController.java (add DELETE mapping)
backend/comment-service/src/main/java/com/social/comment/
  └── controller/CommentController.java (add parentCommentId)
frontend/src/api/
  ├── notificationsApi.ts
  └── socialApi.ts
frontend/src/components/nav/
  ├── AppTopNav.tsx (add Notification Bell & Drawer)
  └── NotificationDrawer.tsx
frontend/src/app/feed/
  └── PostCard.tsx (add reply composer & nested replies)
```

---

## Testing Strategy
1. **Unit Tests:**
   - `NotificationServiceTest.java`: Trigger and retrieve notifications.
   - `LikeControllerTest.java` & `FollowControllerTest.java`: Verify HTTP `DELETE` verb.
   - `frontend/test/notifications.test.mjs`: Test notification API client & unread counter.
   - `frontend/test/nested_comments.test.mjs`: Test parent/child comment hierarchy.
2. **E2E Browser Test:**
   - Chrome CDP test: Trigger like from user Alice -> switch to user Hunain -> verify notification bell badge reads "1", open drawer, click notification.

---

## Boundaries
- **Always do:** Preserve Astryx design tokens. Keep working directory clean. Validate all inputs.
- **Ask first:** Modifying core MongoDB cluster connection properties.
- **Never do:** Commit plain-text credentials. Introduce rogue CSS or third-party UI libraries.

---

## Success Criteria
1. Notification bell displayed in top navigation with live unread counter.
2. Liking, commenting, or following generates a notification for the recipient user.
3. Replying to a comment creates an indented child reply in the post card.
4. `DELETE /v1/unlike` and `DELETE /v1/unfollow` return HTTP 200 SUCCESS.
5. Logging out displays the "Showed Logout Message" confirmation banner.
6. All existing 31 frontend unit tests, backend reactor tests, and E2E CDP tests pass.

---

## Open Questions
None. Requirements directly extracted from PDF diagrams and tables.
