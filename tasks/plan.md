# Implementation Plan: Meta Astryx Official Mega TopNav & Theme Toggle

## Overview
Replace the temporary application header with the official Meta Astryx `TopNav` suite (`@astryxdesign/core/TopNav`). Add brand identity, navigation items, a hover-activated `TopNavMegaMenu` detailing Social Feed and Analytics modules, and an interactive Light/Dark theme toggle button (`SunIcon` / `MoonIcon`) switching Astryx Design System tokens dynamically across the app.

## Architecture Decisions
1. **Official Astryx TopNav Primitives:** Use strictly official components from `@astryxdesign/core/TopNav` (`TopNav`, `TopNavHeading`, `TopNavItem`, `TopNavMegaMenu`, `TopNavMegaMenuItem`, `TopNavMegaMenuFeaturedCard`). Zero raw HTML nav elements or custom CSS classes.
2. **Dynamic Client-Side Theme Mode:** Manage theme mode state (`'dark' | 'light'`) dynamically. Passing `mode={mode}` to `<Theme>` automatically swaps Astryx design tokens; synchronized with `data-theme` attribute on `<html>` and `color-scheme` CSS property.
3. **Mega Menu Content Traceability:** Populate `TopNavMegaMenu` with Section 4.1 modules (Feed, Composer, Analytics) and Section 5 system capacity metrics (500M DAU, 216 TB/day).
4. **Git Branch Discipline:** All work remains on `Hunain-Frontend` until explicit merge instruction.

## Task List

### Phase 1: Navigation Component
- [x] Task 1: Build Official Astryx AppTopNav Component (`frontend/src/components/nav/AppTopNav.tsx`)

### Checkpoint 1: Component Ready
- [x] TypeScript compilation succeeds with zero errors.

### Phase 2: Shell Integration & Dynamic Theme
- [x] Task 2: Integrate AppTopNav & Dynamic Light/Dark Mode in App Shell (`frontend/src/App.tsx`, `frontend/src/main.tsx`)

### Checkpoint 2: Integration Complete
- [x] Production build succeeds without errors.
- [x] Theme toggling and tab navigation operate smoothly.

### Phase 3: Automated Verification & Branch Commit
- [x] Task 3: DevTools Protocol Automated Verification & Branch Commit

### Checkpoint 3: Feature Complete
- [x] Automated headless Chrome test verifies 0 console errors and interactive theme/tab toggling.
- [x] Committed and pushed to `Hunain-Frontend`.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| StyleX light mode card contrast | Low | Astryx theme tokens (`--color-background-surface`, `--color-background-body`) automatically adapt via CSS `light-dark()` functions |
| Sticky header z-index collision | Low | Set standard z-index on TopNav container |
