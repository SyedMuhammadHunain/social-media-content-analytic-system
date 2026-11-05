# Active Tasks: Mobile Responsive App Shell & Navigation

Spec: `docs/specs/SPEC-mobile-responsive-navigation.md`
Plan: `tasks/plan.md`

- [x] Task 1: Unlock Viewport Scrolling and Implement Mobile Header
  - **Description:** Remove global `overflow: hidden` from `App.tsx` (`html`, `body`, and outer container). Build `MobileAppHeader.tsx` styled with Astryx tokens, featuring centered App Logo and top-right Search and Hamburger Astryx `IconButton`s, displayed only on viewports < 768px.
  - **Acceptance criteria:**
    - [x] `html` and `body` no longer have hardcoded `overflow: hidden` set by `App.tsx`.
    - [x] Root container allows vertical scrolling (`min-height: 100vh`, `overflow-y: auto`).
    - [x] `MobileAppHeader` renders with centered App Logo/Title on screens < 768px.
    - [x] Search and Hamburger icons (`search`, `menu`) render side-by-side at top right using Astryx `IconButton` and `Icon`.
    - [x] On viewports ≥ 768px, `MobileAppHeader` is hidden.
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
    - [x] `cd frontend && npm run lint`
    - [x] Focused unit test in `frontend/tests/mobile_responsive_navigation.test.mjs` verifying styles and header rendering.
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/App.tsx`
    - `frontend/src/app/feed/MobileAppHeader.tsx`
    - `frontend/src/app/feed/NewsFeedPage.tsx`
    - `frontend/test/mobile_responsive_navigation.test.mjs`
  - **Estimated scope:** S (3 files)

- [ ] Task 2: Implement Astryx 5-Icon Bottom Bar and In-Place View Swapping
  - **Description:** Build `MobileBottomNav.tsx` containing 5 icons in sequential order: Saved, Creator Analytics, + Create Post (center), Notifications, Profile. Connect it to `NewsFeedPage.tsx` so clicking each icon swaps the center column view (Saved, Analytics, Notifications, Profile) or opens Create Post modal, while hiding desktop sidebars on screens < 768px.
  - **Acceptance criteria:**
    - [ ] `MobileBottomNav` renders fixed at bottom on viewports < 768px with exactly 5 icons in order: `[Saved, Creator Analytics, + Create Post, Notifications, Profile]`.
    - [ ] Desktop left sidebar (profile/navigation) and right sidebar (recommendations/search) hidden on screens < 768px via media queries.
    - [ ] Main center column occupies full width on mobile viewports.
    - [ ] Tapping "Creator Analytics" swaps center feed to Creator Analytics charts.
    - [ ] Tapping "Notifications" swaps center feed to Notifications list.
    - [ ] Tapping "Saved" swaps center feed to saved posts filter.
    - [ ] Tapping "Profile" displays profile card view.
    - [ ] Tapping "+" opens the post creation composer modal.
  - **Verification:**
    - [ ] `cd frontend && npx tsc -b`
    - [ ] `cd frontend && npm run lint`
    - [ ] Focused unit test verifying bottom navigation order and view switching callbacks.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `frontend/src/app/feed/MobileBottomNav.tsx`
    - `frontend/src/app/feed/NewsFeedPage.tsx`
    - `frontend/tests/mobile_responsive_navigation.test.mjs`
  - **Estimated scope:** M (3 files)

- [ ] Task 3: Implement Left Slide Navigation Drawer and Automated Mobile Verification
  - **Description:** Build `MobileNavigationDrawer.tsx` utilizing Astryx `Drawer` to slide in from the left on Hamburger menu click. Host Appearance (Dark/Light theme switch with Astryx styling), Logout action, and user identity info. Create headless Chrome CDP automated test suite verifying mobile viewport (390x844) scroll behavior, drawer slide, view switches, and desktop (1440x900) 3-column preservation.
  - **Acceptance criteria:**
    - [ ] Tapping Hamburger button triggers left slide-out Astryx `Drawer`.
    - [ ] Drawer contains current user identity, Appearance theme switch (toggle dark/light), and Logout button.
    - [ ] Backdrop click or escape key closes the drawer.
    - [ ] Mobile viewport (390x844) scrolls vertically without hindrance.
    - [ ] Desktop viewport (1440x900) retains complete 3-column layout without regressions.
    - [ ] Full test suite (`npm test`) passes with 100% green tests.
  - **Verification:**
    - [ ] `cd frontend && npx tsc -b`
    - [ ] `cd frontend && npm run lint`
    - [ ] `cd frontend && npm test`
    - [ ] `cd frontend && npm run build`
  - **Dependencies:** Task 1, Task 2
  - **Files likely touched:**
    - `frontend/src/app/feed/MobileNavigationDrawer.tsx`
    - `frontend/src/app/feed/NewsFeedPage.tsx`
    - `frontend/tests/mobile_responsive_navigation.test.mjs`
  - **Estimated scope:** M (3 files)

## Checkpoint: Complete
- [ ] All 3 tasks checked off
- [ ] Zero TypeScript or lint errors
- [ ] All unit and CDP test suites pass
- [ ] Production build succeeds
