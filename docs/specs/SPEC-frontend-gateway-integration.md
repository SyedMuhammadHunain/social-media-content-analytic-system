# Spec: Frontend-to-Backend Gateway Integration & Real-time Sync

## 1. Assumptions Surface
1. **API Gateway Base URL:** Standardizing on `VITE_API_GATEWAY_URL` defaulting to `http://localhost:8080`.
2. **REST Endpoints:** Strictly aligned with Course PDF Section 3 & 4:
   - `/v1/auth/login` & `/v1/auth/register`
   - `/v1/feeds/{userId}` (Newsfeed read from `FeedDB`)
   - `/v1/posts` (Post creation, soft delete, update in `PostsDB`)
   - `/v1/like` & `/v1/unlike` (`LikesDB` ledger + atomic counter)
   - `/v1/comment` (`CommentsDB` + atomic counter)
   - `/v1/follow` & `/v1/unfollow` (`FollowDB` relationship graph)
   - `/v1/media/presign` (Azure Blob SAS / simulated URL)
3. **Graceful Offline Fallback:** If the API Gateway is unreachable, the client displays an Astryx notification and seamlessly falls back to offline in-memory data (`socialSeedData.ts`) so tests and demos never crash.
4. **Design System:** Strictly Meta Astryx (`@astryxdesign/core`) components and tokens. Zero ad-hoc CSS.
5. **Sub-2s Eventual Consistency:** Mutations update the local UI optimistically, while syncing asynchronously with the gateway to satisfy the course sub-2-second latency requirement.

---

## 2. Objective
Replace static mock data arrays in the React 19 frontend with a typed HTTP API client connected to the Spring Cloud API Gateway (`http://localhost:8080`):
- Users view live posts seeded from MongoDB Atlas cluster `SMCAS` (`SocialMediaContentAnalysisSystem`).
- Creating a post persists into MongoDB Atlas and triggers fan-out newsfeed generation.
- Liking, commenting, and following synchronize with cloud MongoDB collections and update Creator Analytics metrics in real-time.

---

## 3. Tech Stack & Dependencies
- **Frontend Framework:** React 19, TypeScript 5.8, Vite 8
- **Design System:** Meta Astryx (`@astryxdesign/core`)
- **HTTP Client:** Native `fetch` with typed TypeScript API wrapper (`frontend/src/api/`)
- **Backend Edge:** Spring Cloud Gateway (Port 8080)
- **Testing:** Node.js native test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP)

---

## 4. Commands
- **Start Backend Services:**
  ```bash
  ./scripts/start-backend.sh
  ```
- **Start Frontend Client:**
  ```bash
  cd frontend && npm run dev -- --host 127.0.0.1 --port 5173
  ```
- **Run Frontend Tests:**
  ```bash
  cd frontend && npm test
  ```
- **Verify End-to-End Integration:**
  ```bash
  node tests/e2e-gateway-integration.test.mjs
  ```

---

## 5. Project Structure
```text
frontend/src/
├── api/
│   ├── client.ts             # Base HTTP fetch wrapper with error handling & timeouts
│   ├── authApi.ts            # /v1/auth/login and /v1/auth/register
│   ├── feedApi.ts            # /v1/feeds/{userId}
│   ├── postsApi.ts           # /v1/posts (create, update, delete)
│   ├── socialApi.ts          # /v1/like, /v1/unlike, /v1/comment, /v1/follow
│   └── mediaApi.ts           # /v1/media/presign
├── context/
│   ├── AuthContext.tsx       # Updated to use authApi with fallback
│   └── SocialContext.tsx     # Feed state management wired to feedApi/postsApi
├── app/
│   └── feed/
│       ├── NewsFeedPage.tsx  # Loads posts from gateway, hooks up actions
│       ├── PostComposer.tsx  # Requests presigned URL for media, submits post
│       └── PostCard.tsx      # Executes like and comment API calls
└── types/
    └── social.ts             # Domain contracts matching backend DTOs
```

---

## 6. Code Style & API Contracts

### Unified API Request Wrapper
```typescript
// frontend/src/api/client.ts
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GATEWAY_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}
```

### Feed DTO Mapping
```typescript
// Transforms backend FeedPostDto from /v1/feeds/{userId} into frontend Post model
export function mapBackendPostToUi(dto: BackendFeedPostDto): Post {
  return {
    id: dto.postId,
    userId: dto.authorId,
    author: {
      id: dto.authorId,
      name: dto.authorName || 'Anonymous',
      handle: dto.authorHandle || dto.authorId,
      avatarUrl: dto.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: dto.text,
    mediaUrl: dto.mediaUrl,
    mediaType: dto.mediaType as 'TEXT' | 'IMAGE' | 'VIDEO',
    hashtags: dto.hashtags || [],
    likesCount: dto.likeCount,
    commentsCount: dto.commentCount,
    hasLiked: false,
    createdAt: dto.createdAt,
  };
}
```

---

## 7. Testing & Verification Strategy
1. **Unit & Contract Tests:**
   - Test `frontend/src/api/*` client functions using Node test runner.
   - Verify request formatting and DTO transformation.
2. **Browser Runtime Verification (CDP):**
   - Boot Vite dev server and Spring Cloud Gateway with MongoDB Atlas.
   - Using Chrome DevTools Protocol (CDP), load `http://127.0.0.1:5173`.
   - Verify network panel registers `GET http://localhost:8080/v1/feeds/user_alice` and renders 9 Atlas seeded posts.
   - Click like button on `post_001` and verify `POST http://localhost:8080/v1/like` fires and updates like counter.
3. **Console & Error Zero-Tolerance:**
   - Zero uncaught exceptions or React console errors in browser DevTools.

---

## 8. Boundaries
- **Always:**
  - Maintain offline fallback to local mock data if the backend gateway is offline.
  - Follow Meta Astryx design tokens strictly (`@astryxdesign/core`).
  - Run `npm test` and CDP browser verification before finalizing.
- **Ask First:**
  - Changing authentication token storage model (e.g. from state to HTTP cookies).
- **Never:**
  - Introduce third-party CSS or non-Astryx styling libraries (e.g. Tailwind, Bootstrap).
  - Hardcode backend URLs inside UI components (use `client.ts` central configuration).

---

## 9. Success Criteria
- [ ] Central API client layer created in `frontend/src/api/`.
- [ ] Gateway Auth endpoints (`/v1/auth/login`, `/v1/auth/register`) operational and hooked to `AuthContext.tsx`.
- [ ] Newsfeed loads live posts from `GET /v1/feeds/{userId}` through Gateway.
- [ ] Creating a new post from `PostComposer` sends `POST /v1/posts` and shows in feed.
- [ ] Liking a post calls `POST /v1/like` and updates counter on MongoDB Atlas.
- [ ] Commenting on a post calls `POST /v1/comment` and updates counter on MongoDB Atlas.
- [ ] Creator Analytics dashboard reflects live engagement changes within 2 seconds.
- [ ] All 43 frontend unit tests pass without regression.

---

## 10. Resolved Design Decisions
1. **Gateway Auth Service:** Confirmed. `api-gateway` hosts reactive `/v1/auth/login` and `/v1/auth/register` endpoints authenticating against MongoDB Atlas `UsersDB`.
2. **Demo User Switcher:** Confirmed. `AppTopNav` includes an Astryx dropdown allowing rapid switching between seeded accounts (`user_hunain`, `user_alice`, `user_bob`, `user_charlie`) to demonstrate personalized follower feeds.
