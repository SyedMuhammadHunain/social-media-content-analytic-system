# Active Tasks: UI Refinements 3 (refine_3_ui)

Spec: `docs/specs/SPEC-ui-refinements-3.md`
Plan: `tasks/plan.md`

## Phase 1: Shell & Sidebar Simplification

- [x] Task 1: Remove "Media Only" from Left Sidebar
  - Acceptance: Filter list in `NewsFeedLeftSidebar.tsx` contains only "All Posts" and "Bookmarks". "Media Only" button completely removed.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/NewsFeedLeftSidebar.tsx`
  - Scope: XS

- [x] Task 2: Remove Navbar from App Layout
  - Acceptance: `AppHeader` removed from `frontend/src/App.tsx`. Top padding/gap removed so 3-column layout aligns flush to top of viewport. Sticky sidebar top offsets updated from 80px/89px to 16px/24px.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/App.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

- [ ] Task 3: Clean Right Sidebar & Add Pill Search Input Box
  - Acceptance: Remove "Trending Topics" card. Above "Who to Follow", add dark pill search input with magnifying glass icon and "Search" placeholder matching `Screenshot From 2026-11-04 21-03-41.png`. Right sidebar contains only Search Input Box and "Who to Follow" card.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/NewsFeedRightSidebar.tsx`
  - Scope: S

### Checkpoint: Shell & Sidebar
- [ ] `npx tsc -b` clean
- [ ] Navbar removed, sidebars clean and aligned

## Phase 2: Composer Modal Enhancements & Provider Architecture

- [ ] Task 4: Full-Width GIF and Emoji Picker Cards
  - Acceptance: Popover cards for Emoji and GIF expand to 100% width of the composer modal. Emojis arranged in responsive multi-column grid filling horizontal width. Trending GIFs arranged in responsive grid filling horizontal width.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/PostMediaToolbar.tsx`
  - Scope: S

- [ ] Task 5: Document GIF & Emoji Provider Integration Architecture
  - Acceptance: Technical architecture documentation explaining step-by-step how to add full Tenor/Giphy API and emoji dataset integration.
  - Verify: Documentation file created and reviewed.
  - Files: `docs/specs/SPEC-ui-refinements-3.md`
  - Scope: XS

## Phase 3: Automated Verification & Quality Gates

- [ ] Task 6: E2E CDP Verification and Final Quality Gates
  - Acceptance: Automated CDP test verifies:
    1. Navbar absent from DOM and 3-column feed top-aligned.
    2. Left sidebar has no "Media Only".
    3. Right sidebar has pill Search box and no Trending Topics.
    4. GIF & Emoji pickers render full-width inside modal.
    5. `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build` all pass with zero errors.
  - Verify: Run test script.
  - Files: `frontend/test/ui_refinements_3_e2e.test.mjs`, `tasks/plan.md`, `tasks/todo.md`
  - Scope: S

### Checkpoint: Complete
- [ ] All 5 items from `refine_3_ui.md` satisfied
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] `npm run test:unit` clean
- [ ] `npm run build` succeeds
- [ ] Automated E2E CDP test passes
