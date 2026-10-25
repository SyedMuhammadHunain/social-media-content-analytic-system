# Task List: News Feed 3-Column Social Discovery Architecture

## Task 1: Seed Data and Types for Trending Topics & Suggested Creators
**Description:** Add TypeScript interfaces for `TrendingTopic`, `SuggestedCreator`, and `FeedFilter` in `types/social.ts`. Export seed data for trending topics (with post volume) and suggested creators in `socialSeedData.ts`.
**Acceptance criteria:**
- [x] `TrendingTopic`, `SuggestedCreator`, and `FeedFilter` types exported from `types/social.ts`.
- [x] `TRENDING_TOPICS` (5 hashtags with volume) exported from `socialSeedData.ts`.
- [x] `SUGGESTED_CREATORS` (3 suggested creators with avatar, username, headline, isFollowed) exported from `socialSeedData.ts`.
- [x] Zero TypeScript or lint errors.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** None
**Files likely touched:**
- `frontend/src/types/social.ts`
- `frontend/src/mock/socialSeedData.ts`
**Estimated scope:** Small (2 files)

---

## Task 2: Implement Left Rail FeedShortcutsCard
**Description:** Create `FeedShortcutsCard.tsx` using Astryx components (`Card`, `VStack`, `HStack`, `Button`, `Badge`, `Text`, `Heading`). Render shortcuts for "All Posts", "Media Only", "Bookmarks", and "Creator Analytics" (with follower badge). Wire click handler to update active feed filter or navigate to analytics.
**Acceptance criteria:**
- [x] Renders all 4 shortcuts cleanly with Astryx typography and icons/badges.
- [x] Active shortcut is visually highlighted.
- [x] Emits filter change callback when shortcut is clicked.
- [x] Zero TypeScript or lint errors.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/app/feed/FeedShortcutsCard.tsx`
**Estimated scope:** Small (1 file)

---

## Task 3: Implement Right Rail Discovery Cards
**Description:** Create `TrendingTopicsCard.tsx`, `WhoToFollowCard.tsx`, and `PlatformInfoFooter.tsx` using Astryx components.
- `TrendingTopicsCard`: lists top 5 hashtags with post count badge; triggers hashtag filter on click.
- `WhoToFollowCard`: lists 3 suggested creators with avatar, headline, and interactive Follow/Following button.
- `PlatformInfoFooter`: lightweight card with course metadata ("OOAD Content Analysis System • Meta Astryx • Spring 2026").
**Acceptance criteria:**
- [x] `TrendingTopicsCard` displays hashtags and count pills; triggers `onSelectHashtag`.
- [x] `WhoToFollowCard` displays creators with interactive `Follow` button triggering `onToggleFollow`.
- [x] `PlatformInfoFooter` renders course metadata.
- [x] Zero TypeScript or lint errors.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/app/feed/TrendingTopicsCard.tsx`
- `frontend/src/app/feed/WhoToFollowCard.tsx`
- `frontend/src/app/feed/PlatformInfoFooter.tsx`
**Estimated scope:** Medium (3 files)

---

## Checkpoint 1: Foundation & Components Ready
- [x] All new types and components compile with zero TypeScript errors (`cd frontend && npx tsc -b`)
- [x] Existing 36/36 tests continue to pass (`cd frontend && npm test`)

---

## Task 4: Integrate 3-Column Layout, In-Place Filtering, and State Sync
**Description:** Update `NewsFeedPage.tsx` and `PostCard.tsx`:
1. Expand layout container to 3 columns on desktop (`280px` left rail, `680px` center, `320px` right rail).
2. Add media queries: hide right rail on `< 1280px`, stack left rail on `< 1024px`.
3. Add `activeFilter` state (`ALL`, `MEDIA`, `BOOKMARKS`, `HASHTAG`).
4. Display active filter indicator banner with post count and "Clear filter" button.
5. Compute filtered post list dynamically based on active filter.
6. Add bookmark toggle button on `PostCard` to save/unsave posts.
7. Connect `WhoToFollowCard` follow toggle to update both local recommended creators state, feed post authors state, and call `recordFollowToggle`.
**Acceptance criteria:**
- [x] 3 columns render side-by-side on wide screens.
- [x] Clicking hashtag or shortcut filters feed in-place without page reload.
- [x] "Clear filter" restores complete post feed.
- [x] Following creator in right rail updates button to "Following" and syncs follow status on their feed posts.
- [x] Bookmark toggle saves post and shows in "Bookmarks" filter.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 2, Task 3
**Files likely touched:**
- `frontend/src/app/feed/NewsFeedPage.tsx`
- `frontend/src/app/feed/PostCard.tsx`
**Estimated scope:** Medium (2 files)

---

## Checkpoint 2: Layout & State Verification
- [x] Responsive 3-column layout operational
- [x] Filter state and follow state fully synchronized

---

## Task 5: Native Test Suite & Chrome DevTools Visual Verification
**Description:** Implement `frontend/test/feed_3_column_layout.test.mjs` using `node:test` and Chrome DevTools Protocol (CDP) on port `9229` to verify:
1. Left rail shortcuts and profile card are visible on desktop.
2. Right rail trending topics and who-to-follow are visible on desktop.
3. Clicking trending hashtag filters feed posts to matching hashtag and displays active filter chip.
4. Clicking "Clear filter" resets feed to full list.
5. Clicking "Follow" in Who to Follow updates button state and syncs author state.
6. Capture high-resolution screenshot artifacts (`newsfeed_3_column_desktop.png`, `newsfeed_filtered_hashtag.png`, `newsfeed_tablet_responsive.png`).
**Acceptance criteria:**
- [ ] All tests in `feed_3_column_layout.test.mjs` pass cleanly (100% GREEN).
- [ ] All existing test suites continue to pass (now 7 suites).
- [ ] Screenshots captured in artifact directory.
- [ ] Production build succeeds (`cd frontend && npm run build`).
**Verification:**
- [ ] Run `cd frontend && npm test`
- [ ] Run `cd frontend && npm run build`
**Dependencies:** Task 4
**Files likely touched:**
- `frontend/test/feed_3_column_layout.test.mjs`
**Estimated scope:** Small (1 file)

---

## Checkpoint 3: Complete & Ready for Review
- [ ] 100% test pass rate across all 7 test suites
- [ ] TypeScript check and lint pass with 0 errors
- [ ] Clean build and verified layout
