# Active Tasks: Refine UI

Spec: `docs/specs/SPEC-refine-ui.md`
Plan: `tasks/plan.md`

## Phase 1: Foundation

- [x] Task 1: Copy logo + update refs
  - Acceptance: `~/Downloads/Gemini_Generated_Image_655y7d655y7d655y.jpeg` copied to `frontend/public/`, all logo refs updated (navbar, login). No app name text.
  - Verify: `npx tsc -b`, visual check — logo renders in navbar and login page
  - Files: `public/logo.jpeg`, `components/nav/AppTopNav.tsx`, login component
  - Scope: S

- [x] Task 2: Run login-card CLI template
  - Acceptance: `npx @astryxdesign/cli template login-card ./src/app/login-card` runs, output inspected, files committed
  - Verify: Inspect scaffolded files, note what needs customization
  - Files: `app/login-card/` (new, CLI-generated)
  - Scope: XS

- [ ] Task 3: Remove PlatformInfoFooter
  - Acceptance: "OOAD Content Analysis v1.0" card gone from right sidebar
  - Verify: `npx tsc -b`, visual check — card absent from feed page
  - Files: `app/feed/PlatformInfoFooter.tsx` (delete), `app/feed/NewsFeedRightSidebar.tsx`
  - Scope: XS

- [ ] Task 4: Remove dashboard tags
  - Acceptance: "Live Telemetry", "PDF Sections", "96.7% Positive" and similar academic tags gone
  - Verify: `npx tsc -b`, visual check — no tags in dashboard
  - Files: `app/dashboard/DashboardHeader.tsx`, `app/dashboard/DashboardKpiCards.tsx`, other dashboard files with `<Badge>` elements
  - Scope: S

- [ ] Task 5: Zero-gap post cards
  - Acceptance: No gap/margin between PostCard components in feed. Cards touch bottom-to-top.
  - Verify: `npx tsc -b`, visual check — posts stacked with zero spacing
  - Files: `app/feed/FeedPostList.tsx`, `app/feed/PostCard.tsx`
  - Scope: XS

### Checkpoint: Foundation
- [ ] `npx tsc -b` passes
- [ ] Dev server renders without errors
- [ ] Logo visible, info card gone, tags gone, posts gapless

## Phase 2: Structural Changes

- [ ] Task 6: Strip navbar to logo-only
  - Acceptance: Navbar shows only app logo (top-left). No tabs, buttons, icons, profile, notification, theme toggle, or logout.
  - Verify: `npx tsc -b`, visual check — minimal navbar
  - Files: `components/nav/AppTopNav.tsx`, `components/nav/DesktopNavTabs.tsx`, `components/nav/DesktopNavActions.tsx`, `components/nav/MobileNavMenu.tsx`
  - Scope: M

- [ ] Task 7: Wire login-card template (Google-only auth)
  - Acceptance: Login uses Astryx login-card template. Only "Continue with Google" button. Google OAuth modal logic preserved. Old `app/login-split/` deleted.
  - Verify: `npx tsc -b`, visual check — login renders, Google auth flow works
  - Files: `app/login-card/` (modify scaffolded), `app/auth/AuthPage.tsx`, `App.tsx`, `app/login-split/` (delete)
  - Scope: M

- [ ] Task 8: Add sidebar shortcut links
  - Acceptance: FeedShortcutsCard has Notification (bell icon), Appearance (shows theme toggle on click), Logout items. All using Astryx `Icon`.
  - Verify: `npx tsc -b`, visual check — shortcuts render, theme toggle works, logout works
  - Files: `app/feed/FeedShortcutsCard.tsx`
  - Scope: S

- [ ] Task 9: Fix Analytics Interpretation card
  - Acceptance: `DashboardAnalyticsInterpretation.tsx` uses Astryx components (`Card`, `Section`, `Text`, `Icon`). Respects light/dark theme. No overwhelming text. Astryx icons only.
  - Verify: `npx tsc -b`, toggle theme — card appearance switches correctly
  - Files: `app/dashboard/DashboardAnalyticsInterpretation.tsx`
  - Scope: M

### Checkpoint: Structural
- [ ] `npx tsc -b` passes
- [ ] Navbar minimal, login works, shortcuts functional, analytics card themed

## Phase 3: Layout Refactor

- [ ] Task 10: Level panels
  - Acceptance: Left sidebar, center feed, right sidebar start at same vertical level
  - Verify: `npx tsc -b`, visual check — columns aligned
  - Files: `app/feed/NewsFeedPage.tsx`
  - Scope: XS

- [ ] Task 11: Extract sidebars to App shell (persistent panels)
  - Acceptance: `NewsFeedLeftSidebar` and `NewsFeedRightSidebar` rendered in `AppContent` (App.tsx), not inside `NewsFeedPage`. Side panels persist across feed, dashboard, notifications, profile tabs. `activeTab` type: `'feed' | 'dashboard' | 'notifications' | 'profile'`.
  - Verify: `npx tsc -b`, switch tabs — sidebars remain, center content changes
  - Files: `App.tsx`, `app/feed/NewsFeedPage.tsx`, `app/dashboard/page.tsx`
  - Scope: L (5 files)

- [ ] Task 12: Build notification list view
  - Acceptance: New `app/notifications/NotificationListPage.tsx`. Shows notification items in center column when notifications tab active. Uses Astryx components. Supports light/dark theme.
  - Verify: `npx tsc -b`, click notification shortcut — list renders in center
  - Files: `app/notifications/NotificationListPage.tsx` (new), `App.tsx`
  - Scope: S

- [ ] Task 13: Remove "Back to News Feed" button + verify all tabs
  - Acceptance: No "Back to News Feed" button anywhere. All 4 tabs (feed, dashboard, notifications, profile) render correct content in center column with persistent sidebars.
  - Verify: `npx tsc -b`, navigate all tabs — correct content, no stale buttons
  - Files: `app/dashboard/page.tsx`, `components/profile/UserProfileView.tsx`, search for "Back to" strings
  - Scope: S

### Checkpoint: Complete
- [ ] All 10 spec items verified
- [ ] Light/dark theme works everywhere
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] All existing tests pass
