# Active Tasks: Astryx Static Gallery Hero Landing Page

Plan: `tasks/plan.md`

- [x] Task 1: Refactor `gallery-hero/page.tsx` with static Astryx Grid and 3 user photos
  - **Description:** Implement clean Astryx `<Layout>`, `<LayoutContent>`, `<Heading>`, `<Text>`, `<Button>`, and `<Grid>` with 3 user photos in `<AspectRatio ratio={4 / 5}>`. Retain `onGetStarted` navigation callback and `onLearnMore` no-op. Use Astryx `chevronRight` icon only. Remove `MarqueeTrack.tsx` and `marquee.css`.
  - **Acceptance criteria:**
    - [x] No marquee animation or moving track.
    - [x] Static Astryx `<Grid>` renders 3 user photos with `AspectRatio`.
    - [x] "Get Started" calls `onGetStarted`.
    - [x] "Learn More" is active clickable no-op.
    - [x] Strictly Meta Astryx icons only (no `@heroicons`).
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/app/gallery-hero/page.tsx`
    - `frontend/src/app/gallery-hero/MarqueeTrack.tsx` (delete)
    - `frontend/src/app/gallery-hero/marquee.css` (delete)
  - **Estimated scope:** S (3 files)

- [x] Task 2: Remove "Back to overview" button and `onBack` prop from `LoginCardPage` and `App.tsx`
  - **Description:** Remove `onBack` prop, button, and references from `frontend/src/app/login-card/page.tsx` and `frontend/src/App.tsx`.
  - **Acceptance criteria:**
    - [x] No `onBack` prop or "Back to overview" button in `LoginCardPage`.
    - [x] `App.tsx` cleanly renders `LoginCardPage` without `onBack`.
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/app/login-card/page.tsx`
    - `frontend/src/App.tsx`
  - **Estimated scope:** S (2 files)

- [x] Task 3: Write automated test suite and execute full verification suite
  - **Description:** Create `frontend/test/landing_page_astryx.test.mjs` verifying static 3-image grid, headline, "Get Started" navigation, and "Learn More" no-op. Execute `npm run lint`, `npx tsc -b`, `npm test`, and `npm run build`.
  - **Acceptance criteria:**
    - [x] `frontend/test/landing_page_astryx.test.mjs` passes cleanly.
    - [x] `npm run lint` passes (0 errors).
    - [x] `npx tsc -b` passes (0 errors).
    - [x] `npm test` passes all tests (156/156 passed).
    - [x] `npm run build` succeeds.
  - **Verification:**
    - [x] `cd frontend && npm run lint && npx tsc -b && npm test && npm run build`
  - **Dependencies:** Task 1, Task 2
  - **Files likely touched:**
    - `frontend/test/landing_page_astryx.test.mjs`
    - `frontend/package.json`
  - **Estimated scope:** S (2 files)

## Checkpoints
### Checkpoint: Static Layout & Clean Navigation (After Task 2)
- [x] Static Astryx gallery hero renders 3 images in grid, "Get Started" opens login, no back button on login.

### Checkpoint: Complete (After Task 3)
- [x] All 3 tasks done, 0 TypeScript errors, 100% tests pass (156/156), build succeeds.
