# Implementation Plan: Center Feed Independent Scroll Container (SPEC-center-feed-scroll)

## Overview
Lock outer page viewport at 100vh and enable independent, smooth scrolling on the center feed column with a hidden scrollbar, keeping the sidebars and outer frame static.

## Architecture Decisions
1. **Outer Viewport Lock:** Set `height: 100vh; overflow: hidden;` on the root container in `frontend/src/App.tsx`. This eliminates window-level scrolling and prevents bouncing or layout shift.
2. **Center Scroll Container:** Add `.newsfeed-center-scroll` to the `<main>` element in `frontend/src/app/feed/NewsFeedPage.tsx` with:
   - `height: calc(100vh - 48px)`
   - `overflow-y: auto`
   - `scrollbar-width: none` (Firefox)
   - `-ms-overflow-style: none` (IE/Edge)
   - `::-webkit-scrollbar { display: none; }` (Chrome/Safari/Blink)
3. **Fixed Sidebars:** Keep `.newsfeed-fixed-sidebar` and `.newsfeed-right-sidebar` at `position: fixed; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto; scrollbar-width: none;`.

## Task List

### Phase 1: Layout & Scroll Architecture
- [x] Task 1: Lock Outer App Viewport at 100vh
- [x] Task 2: Configure Independent Center Scroll Container in NewsFeedPage

### Checkpoint: Layout Architecture
- [x] `npx tsc -b` clean
- [x] `npx oxlint .` clean
- [x] Center column scrolls independently while outer frame remains static

### Phase 2: Automated Verification & Quality Gates
- [x] Task 3: Automated E2E CDP Verification & Quality Gates

### Checkpoint: Complete
- [x] `window.scrollY` remains 0 (viewport static)
- [x] Inner center feed content scrolls up smoothly
- [x] All 67 unit tests pass
- [x] Production build succeeds

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Small screen (< 1024px) layout truncation | Med | Keep media queries in `NEWSFEED_CSS` so mobile views fall back to fluid static stacking when sidebars are collapsed |
| Modal popups getting trapped in scroll overflow | Low | Modals use `position: fixed; top: 0; left: 0; right: 0; bottom: 0; zIndex: 9999;` which breakout of scroll ancestors |

## Open Questions
None.
