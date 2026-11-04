# Implementation Plan: UI Refinements 3 (refine_3_ui)

## Overview
Implement minor shell and sidebar improvements specified in `docs/specs/SPEC-ui-refinements-3.md`:
1. Remove "Media Only" from Left Sidebar.
2. Remove top navbar (`AppHeader`) from app layout for flush top-aligned view.
3. Remove "Trending Topics" from Right Sidebar and add dark pill Search Input Box above "Who to Follow".
4. Make GIF and Emoji picker popovers full-width (100%) inside the post composer modal.
5. Provide architectural documentation for full GIF & Emoji provider integration (Tenor/Giphy + Emoji dataset).
6. End-to-end headless Chrome CDP verification and quality gates.

## Architecture Decisions
1. **Navbar Removal:** Removing `<AppHeader />` in `frontend/src/App.tsx` directly elevates all three columns. Adjust desktop top offsets from `top: 80px` to `top: 16px` or `top: 24px` in fixed/sticky sidebars so they remain comfortably positioned without overlapping viewport boundaries.
2. **Pill Search Input Box:** Implement as dedicated, accessible Astryx-styled search input with `borderRadius: '9999px'`, subtle dark surface background, search icon prefix, and "Search" placeholder. It remains standalone (no backend query firing yet, per spec).
3. **Full-Width Popovers:** Remove `maxWidth: 320px` and `maxWidth: 380px` in `PostMediaToolbar.tsx`, setting `width: '100%'` with `boxSizing: 'border-box'`. Emoji grid utilizes responsive columns (`repeat(auto-fill, minmax(36px, 1fr))`) to fill the entire modal width.

## Task List

### Phase 1: Shell & Sidebar Simplification
- [x] Task 1: Remove "Media Only" from Left Sidebar
- [x] Task 2: Remove Navbar from App Layout
- [x] Task 3: Clean Right Sidebar & Add Pill Search Input Box

### Checkpoint: Shell & Sidebar
- [x] `npx tsc -b` clean
- [x] Navbar removed, sidebars clean and aligned

### Phase 2: Composer Modal Enhancements & Provider Architecture
- [x] Task 4: Full-Width GIF and Emoji Picker Cards
- [x] Task 5: Document GIF & Emoji Provider Integration Architecture

### Phase 3: Automated Verification & Quality Gates
- [x] Task 6: E2E CDP Verification and Final Quality Gates

### Checkpoint: Complete
- [x] All 5 items from `refine_3_ui.md` satisfied
- [x] `npx tsc -b` clean
- [x] `npx oxlint .` clean
- [x] `npm run test:unit` clean
- [x] `npm run build` succeeds
- [x] Automated E2E CDP test passes

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing Navbar breaks sticky sidebar `top` coordinates | Med | Update `newsfeed-fixed-sidebar` and `newsfeed-right-sidebar` CSS top coordinates from `80px` to `16px` |
| Full-width GIF/Emoji cards overflow modal on small viewports | Low | Use `boxSizing: 'border-box'` and `width: '100%'` inside flex layout |
| Pill Search box styling clashes with Astryx themes | Low | Use standard Astryx CSS variables (`--color-background-surface-subtle`, `--color-border-subtle`) |

## Open Questions
None — all resolved in spec and interview.
