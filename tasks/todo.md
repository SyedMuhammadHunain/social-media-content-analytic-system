# Task List: Meta Astryx Official Mega TopNav & Theme Toggle

## Task 1: Build Official Astryx AppTopNav Component
**Description:** Build `frontend/src/components/nav/AppTopNav.tsx` using official Astryx primitives (`TopNav`, `TopNavHeading`, `TopNavItem`, `TopNavMegaMenu`, `TopNavMegaMenuItem`, `TopNavMegaMenuFeaturedCard`, `Button`, `Avatar`, `Icon`). Wire brand logo, active tab indicator, mega menu items, and theme switch button.
**Acceptance criteria:**
- [x] Export `AppTopNav` component accepting `mode`, `onToggleTheme`, `activeTab`, `onSelectTab`.
- [x] Renders `TopNavHeading` with platform title and logo icon.
- [x] Renders `TopNavItem` for News Feed and Analytics Dashboard with `isSelected`.
- [x] Renders `TopNavMegaMenu` with `TopNavMegaMenuItem` elements and `TopNavMegaMenuFeaturedCard`.
- [x] Renders Light/Dark mode toggle button with `SunIcon` / `MoonIcon` and user `Avatar`.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
**Dependencies:** None
**Files likely touched:**
- `frontend/src/components/nav/AppTopNav.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint 1: Navigation Component Ready
- [x] Type check succeeds on `AppTopNav.tsx`.

---

## Task 2: Integrate AppTopNav & Dynamic Light/Dark Mode in App Shell
**Description:** Update `frontend/src/App.tsx` and `frontend/src/main.tsx` to support dynamic switching between `'dark'` and `'light'` mode. Render `<AppTopNav>` as the sticky top navigation bar. Synchronize `data-theme` on document root and body background.
**Acceptance criteria:**
- [x] App state holds `mode: 'dark' | 'light'` and passes it to `<Theme mode={mode}>`.
- [x] Document root `data-theme` and `color-scheme` update reactively when toggling theme.
- [x] Replacing header with `<AppTopNav>` preserves tab switching between Feed and Dashboard.
**Verification:**
- [x] Run `cd frontend && npx tsc -b && npm run build`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 2: Integration Complete
- [x] Full app builds cleanly with zero errors.
- [x] Theme toggling and tab navigation operational.

---

## Task 3: DevTools Protocol Automated Verification & Branch Commit
**Description:** Run automated Chrome DevTools test verifying:
1. Console and network health (0 errors).
2. TopNav renders with all items, heading, and mega menu.
3. Toggling theme button changes HTML `data-theme` from `dark` to `light` and back.
4. Switching tabs between Feed and Dashboard functions via nav items and mega menu items.
5. Capture screenshots in both Dark mode and Light mode.
Commit and push changes to `origin/Hunain-Frontend`.
**Acceptance criteria:**
- [x] Zero console and network errors.
- [x] Interactive tests succeed.
- [x] Screenshots saved to artifact directory.
- [x] Committed and pushed to `Hunain-Frontend`.
**Verification:**
- [x] Run `node /tmp/verify_topnav.mjs`
- [x] Run `git status`
**Dependencies:** Task 2
**Files likely touched:** Verification script
**Estimated scope:** Verification only

---

## Checkpoint 3: Feature Complete
- [x] All tasks completed and verified.

---

## Task 4: Declutter & Clean Navigation Bar (TDD)
**Description:** Remove unnecessary boilerplate text and clutter from `AppTopNav` using TDD.
**Acceptance criteria:**
- [x] Add automated test `frontend/test/topnav_cleanliness.test.mjs` asserting absence of subheading, badge, redundant mega menu, and visible button text.
- [x] Remove boilerplate subheading and "500M DAU" badge from `TopNavHeading`.
- [x] Remove redundant "Explore Platform" mega menu.
- [x] Set `isIconOnly` on theme toggle button.
- [x] Retain brand title, Feed tab, Dashboard tab, theme toggle icon, and Avatar.
**Verification:**
- [x] Run `cd frontend && npm test`
- [x] Run `cd frontend && npx tsc -b && npm run lint && npm run build`
**Dependencies:** None
**Files touched:**
- `frontend/src/components/nav/AppTopNav.tsx`
- `frontend/test/topnav_cleanliness.test.mjs`
- `frontend/package.json`

---

## Checkpoint 4: Navigation Cleaned & Verified
- [x] All tests green (6/6 passing).
- [x] Build passes with 0 errors.
