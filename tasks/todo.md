# Active Tasks: Center Feed Independent Scroll Container (SPEC-center-feed-scroll)

Spec: `docs/specs/SPEC-center-feed-scroll.md`
Plan: `tasks/plan.md`

## Phase 1: Layout & Scroll Architecture

- [x] Task 1: Lock Outer App Viewport at 100vh
  - Acceptance: Root container in `frontend/src/App.tsx` has `height: '100vh'`, `overflow: 'hidden'`. Outer page body does not scroll.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/App.tsx`
  - Scope: XS

- [x] Task 2: Configure Independent Center Scroll Container in NewsFeedPage
  - Acceptance: Center `<main>` container has class `.newsfeed-center-scroll` and `data-testid="newsfeed-center-container"`. Height is `calc(100vh - 48px)`, `overflow-y: auto`, with scrollbars completely hidden. Left and right sidebars remain fixed at `top: 24px`.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

### Checkpoint: Layout Architecture
- [x] `npx tsc -b` clean
- [x] `npx oxlint .` clean
- [x] Center column scrolls independently while outer frame remains static

## Phase 2: Automated Verification & Quality Gates

- [x] Task 3: Automated E2E CDP Verification & Quality Gates
  - Acceptance: Automated test in headless Chrome proves:
    1. `window.scrollY === 0` after mouse wheel / scroll action.
    2. Center container `scrollTop > 0` (inner content moves up).
    3. Left and right sidebars retain exact bounding box positions.
    4. `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build` pass with zero errors.
  - Verify: Run test script.
  - Files: `frontend/test/center_feed_scroll_e2e.test.mjs`, `tasks/plan.md`, `tasks/todo.md`
  - Scope: S

### Checkpoint: Complete
- [x] `window.scrollY` remains 0 (viewport static)
- [x] Inner center feed content scrolls up smoothly
- [x] All 67 unit tests pass
- [x] Production build succeeds

## Phase 3: Refine 3 UI Improvements

- [x] Task 6: Remove duplicate "Change Photo" button at name line in `ProfileMetaDetails.tsx` (Commit `1a08a25`)
- [x] Task 7: Remove green "0.0k" badge on "Creator Analytics" in `FeedShortcutsCard.tsx` (Commit `f7603da`)
- [x] Task 8: Notification Page: Strictly Meta Astryx only, no Heroicons, neutral monochrome color scheme (Commit `8decc8f`)
- [x] Task 9: Saved Posts: Only show saved posts, hide "What's New" composer box, hide "Clear Filter" card (Commit `850d169`)
- [x] Task 10: Analytical Dashboard Page: Astryx only, concise descriptions, remove "Current Engagement Index: 0.0%", replace all Heroicons with Astryx semantic icons (Commit `37e27fd`)
- [x] Task 11: Remove 24H, 7D, 30D, and Refresh controls from DashboardHeader (Commit `7199304`)
- [x] Task 12: Photo Icon in Main Profile Avatar - ensure proper contrast in light mode (Commit pending)
