# Active Tasks: Center Feed Independent Scroll Container (SPEC-center-feed-scroll)

Spec: `docs/specs/SPEC-center-feed-scroll.md`
Plan: `tasks/plan.md`

## Phase 1: Layout & Scroll Architecture

- [ ] Task 1: Lock Outer App Viewport at 100vh
  - Acceptance: Root container in `frontend/src/App.tsx` has `height: '100vh'`, `overflow: 'hidden'`. Outer page body does not scroll.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/App.tsx`
  - Scope: XS

- [ ] Task 2: Configure Independent Center Scroll Container in NewsFeedPage
  - Acceptance: Center `<main>` container has class `.newsfeed-center-scroll` and `data-testid="newsfeed-center-container"`. Height is `calc(100vh - 48px)`, `overflow-y: auto`, with scrollbars completely hidden. Left and right sidebars remain fixed at `top: 24px`.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

### Checkpoint: Layout Architecture
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] Center column scrolls independently while outer frame remains static

## Phase 2: Automated Verification & Quality Gates

- [ ] Task 3: Automated E2E CDP Verification & Quality Gates
  - Acceptance: Automated test in headless Chrome proves:
    1. `window.scrollY === 0` after mouse wheel / scroll action.
    2. Center container `scrollTop > 0` (inner content moves up).
    3. Left and right sidebars retain exact bounding box positions.
    4. `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build` pass with zero errors.
  - Verify: Run test script.
  - Files: `frontend/test/center_feed_scroll_e2e.test.mjs`, `tasks/plan.md`, `tasks/todo.md`
  - Scope: S

### Checkpoint: Complete
- [ ] `window.scrollY` remains 0 (viewport static)
- [ ] Inner center feed content scrolls up smoothly
- [ ] All 67 unit tests pass
- [ ] Production build succeeds
