# Implementation Plan: Mobile Responsive App Shell & Navigation

Spec: `docs/specs/SPEC-mobile-responsive-navigation.md`

## Overview
Decompose the implementation of the mobile-first responsive app shell into 3 thin, verifiable tasks. The solution eliminates root viewport scroll locks, hides desktop sidebars on screens < 768px, introduces a sticky top header with centered logo and right search/hamburger icons, a left-sliding Astryx drawer for Appearance & Logout, an Astryx 5-icon bottom bar for in-place center view switching, and verifies behavior via headless Chrome CDP.

## Architecture Decisions
- **Responsive Breakpoint:** `@media (max-width: 767px)` for mobile single-column shell; `min-width: 768px` for desktop multi-column workspace.
- **Root Scroll Architecture:** Remove hardcoded `overflow: hidden` on `html`, `body`, and root container in `App.tsx`. Use `min-height: 100vh` and standard overflow scrolling so mobile browsers natively handle touch scrolling.
- **Astryx Component & Icon Architecture:** Use `@astryxdesign/core` primitives (`Drawer`, `IconButton`, `Icon`, `Button`). Use Astryx icon registry names (`menu`, `search`, `checkDouble`, `calendar`, `viewColumns`, `info`) with zero external icon packages.
- **In-Place View Switching:** In `NewsFeedPage.tsx`, manage active mobile view state (`feed | analytics | notifications | saved | profile`). Dynamically render the respective view component within the center column without requiring full-page route refreshes.

## Task List

### Phase 1: Viewport Foundation & Mobile Header
- [ ] Task 1: Unlock Viewport Scrolling and Implement Mobile Header (`tasks/todo.md`)

### Phase 2: Bottom Navigation & Center View Swapping
- [ ] Task 2: Implement Astryx 5-Icon Bottom Bar and In-Place View Swapping (`tasks/todo.md`)

### Phase 3: Slide Drawer & Full Verification
- [ ] Task 3: Implement Left Slide Navigation Drawer and Automated Mobile Verification (`tasks/todo.md`)

### Checkpoint: Complete
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation clean (`npx tsc -b`)
- [ ] Linter clean (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Headless mobile touch scrolling and responsive layout verified via CDP

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Desktop 3-column layout regresses | High | Scope mobile CSS strictly within `@media (max-width: 767px)`; verify desktop viewport (1440x900) in CDP test suite |
| Mobile bottom bar obscures feed content | Med | Add bottom padding (`padding-bottom: 72px`) to mobile scroll container when bottom bar is active |
| Unsaved composer state lost on view switch | Low | Keep post composer in modal or persist draft in state when switching to analytics/saved |

## Open Questions
- None. Confirmed in interview.
