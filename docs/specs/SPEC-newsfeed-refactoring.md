# Spec: NewsFeedPage CodeScene Code Health Optimization to 10.0 / 10.0

## Objective
Elevate [`NewsFeedPage.tsx`](../../frontend/src/app/feed/NewsFeedPage.tsx) from its current CodeScene Code Health score of **9.38 💡** to **10.0 / 10.0 ✅**, while keeping [`PostCard.tsx`](../../frontend/src/app/feed/PostCard.tsx) at **10.0 / 10.0 ✅** and maintaining 100% test pass rates across the 43 unit tests and Chrome CDP end-to-end suites.

---

## Tech Stack
- **UI Framework:** React 19, TypeScript 5.8, Vite 8
- **Design System:** Strictly Meta Astryx (`@astryxdesign/core`)
- **Code Health Engine:** CodeScene CLI `cs` v1.0.55
- **Testing:** Node.js native test runner (`node:test`, `node:assert`), Chrome DevTools Protocol (CDP)

---

## Commands
```bash
# Build & Typecheck
cd frontend && npx tsc -b

# Unit Tests (43 tests)
cd frontend && npm run test:unit

# CodeScene CLI Review
cs review frontend/src/app/feed/NewsFeedPage.tsx frontend/src/app/feed/PostCard.tsx

# End-to-End CDP Test
node tests/e2e-final-compliance.test.mjs
```

---

## Project Structure
```text
frontend/src/app/feed/
├── NewsFeedPage.tsx            # Main newsfeed page container (orchestrator < 140 lines)
├── useFeedMutations.ts         # Extracted custom hook for optimistic CRUD & social mutations
├── FeedPostList.tsx            # Extracted post list renderer with PostCard mappings
├── PostCard.tsx                # Post card presentation (10.0 / 10.0)
├── PostCardActionBar.tsx       # Post action buttons (10.0 / 10.0)
├── postCommentUtils.ts         # Remote comments fetch & mapper utility (10.0 / 10.0)
├── PostComposer.tsx            # Post publisher with Azure Blob upload
├── FeedFilterBar.tsx           # Category & hashtag filter bar
└── ...
```

---

## Current Smells & CodeScene Diagnostics

Running `cs review frontend/src/app/feed/NewsFeedPage.tsx` flagged:
1. **Complex Conditional (Line 73):**
   ```ts
   // Code smell: 3 conditions chained with ||
   if (!isMounted || !feedPosts || feedPosts.length === 0) return;
   ```
   **Fix:** Extract `hasValidFeedItems(isMounted: boolean, posts?: Post[] | null): boolean`.

2. **Large Method / High Complexity in `NewsFeedPage`:**
   - 516 lines combining feed fetching, filter state, 7 social mutation handlers, profile view routing, and 3-column layout.
   **Fix:** Extract `useFeedMutations(user, backendUserId, setPosts, setSuggestedCreators, setUser)` and `FeedPostList.tsx`.

---

## Code Style & Conventions
- ASD-STE100 active, concise TypeScript syntax.
- Strictly `@astryxdesign/core` design tokens.
- Maintain existing test ID contracts:
  - `data-testid="post-card-${post.id}"`
  - `data-testid="post-like-btn"`
  - `data-testid="post-comment-btn"`
  - `data-testid="post-bookmark-btn-${post.id}"`

---

## Testing Strategy
1. **Static Analysis:** `cs review` must report **10.0 / 10.0 ✅** for `NewsFeedPage.tsx`, `useFeedMutations.ts`, and `FeedPostList.tsx`.
2. **Type Safety:** `npx tsc -b` must report zero compilation errors.
3. **Unit Tests:** `npm run test:unit` must pass all 43 tests (including `newsfeed_social_sync.test.mjs`).
4. **Integration:** Live Chrome CDP verification (`tests/e2e-final-compliance.test.mjs`).

---

## Boundaries
- **Always:** Preserve all existing `PostCardProps` callbacks and test IDs.
- **Ask First:** Changing backend REST contracts or altering visual layout grid dimensions.
- **Never:** Re-introduce `localhost:8080` (must use `127.0.0.1:8080` to prevent Linux IPv6 timeouts).
- **Never:** Introduce non-Astryx CSS frameworks.

---

## Success Criteria
- [ ] `cs review frontend/src/app/feed/NewsFeedPage.tsx` yields **10.0 / 10.0 ✅**.
- [ ] `cs review frontend/src/app/feed/PostCard.tsx` remains **10.0 / 10.0 ✅**.
- [ ] All new subcomponents score **10.0 / 10.0 ✅**.
- [ ] `npm run test:unit` runs 43/43 tests passing.
- [ ] `npx tsc -b` finishes with exit code 0.

---

## Open Questions
None. The contracts and behavior are clearly defined.
