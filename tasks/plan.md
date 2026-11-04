# Implementation Plan: Refine UI

## Overview

10 UI refinements for social media analytics app. All Astryx-only, no new features. Polish pass before university submission.

Spec: `docs/specs/SPEC-refine-ui.md`

## Architecture Decisions

1. **Side panels extracted to App shell** (item 7): `NewsFeedLeftSidebar` and `NewsFeedRightSidebar` move from `NewsFeedPage.tsx` to `AppContent` in `App.tsx`. Center column becomes content slot driven by `activeTab`.
2. **Tab type expands:** `'feed' | 'dashboard'` becomes `'feed' | 'dashboard' | 'notifications' | 'profile'`. Sidebar shortcut clicks set `activeTab`.
3. **Notification list:** New component in `app/notifications/` — not reusing `NotificationDrawer`.
4. **Login card:** CLI-scaffolded template replaces entire `app/login-split/` directory.
5. **No React Router added** — keep state-driven tab model.

## Task List

### Phase 1: Foundation (Low-risk, independent items)

- [x] Task 1: Copy logo, update refs
- [x] Task 2: Run login-card CLI template, inspect output
- [x] Task 3: Remove PlatformInfoFooter
- [x] Task 4: Remove dashboard tags
- [x] Task 5: Zero-gap post cards

### Checkpoint: Foundation
- [x] `npx tsc -b` passes
- [x] Dev server renders without errors
- [x] Logo visible, info card gone, tags gone, posts gapless

### Phase 2: Structural Changes

- [x] Task 6: Strip navbar to logo-only
- [x] Task 7: Wire login-card template (Google-only auth)
- [x] Task 8: Add sidebar shortcut links (Notification, Appearance, Logout)
- [x] Task 9: Fix Analytics Interpretation card (Astryx components, theme support)

### Checkpoint: Structural
- [x] `npx tsc -b` passes
- [x] Navbar minimal, login works, shortcuts functional, analytics card themed

### Phase 3: Layout Refactor (Highest risk)

- [x] Task 10: Level panels (same vertical start)
- [x] Task 11: Extract sidebars to App shell (persistent panels)
- [x] Task 12: Build notification list view for center column
- [x] Task 13: Remove "Back to News Feed" button, verify all tab content renders in center column

### Checkpoint: Complete
- [x] All 10 spec items verified
- [x] Light/dark theme works everywhere
- [x] `npx tsc -b` clean
- [x] `npx oxlint .` clean
- [x] All existing tests pass

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CLI template output differs from expectations | Med | Run CLI first (Task 2), inspect before wiring |
| Astryx `Icon` missing needed icon names | Med | Check available icons from Astryx docs before Task 8 |
| Sidebar extraction breaks existing feed layout | High | Do it last (Task 11), commit working state before |
| Analytics card has hard-coded dark styles | Med | Inspect component first, replace inline styles with Astryx tokens |
| Login-card template conflicts with existing Google OAuth flow | Med | Preserve `GoogleOAuthModal.tsx` logic, only swap UI shell |

## Open Questions

None — all resolved in spec.
