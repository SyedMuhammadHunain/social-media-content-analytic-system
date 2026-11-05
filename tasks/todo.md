# Active Tasks: User Search (SPEC-user-search)

Spec: `docs/specs/SPEC-user-search.md`
Plan: `tasks/plan.md`

## Phase 1: Search Logic

- [x] Task 1: Create `userSearchIndex.ts` with `buildUserPool` and `matchUsers`
  - Acceptance: Pure functions exported. Deduplicates users across sources by `id`. Filters by substring on `name` or `username` (case-insensitive). Excludes `excludeId`. Caps at 8 items.
  - Verify: `cd frontend && npx tsc -b`
  - Files: `frontend/src/utils/userSearchIndex.ts`
  - Scope: S

- [ ] Task 2: Unit tests for search logic
  - Acceptance: Tests verify deduplication, name/username matching, exclude current user, limit 8, empty query handling.
  - Verify: `cd frontend && node --test test/userSearch.test.ts`
  - Files: `frontend/test/userSearch.test.ts`
  - Scope: S

### Checkpoint: Search Logic
- [ ] `npx tsc -b` clean
- [ ] `node --test test/userSearch.test.ts` passes

## Phase 2: UI Integration

- [ ] Task 3: Wire search dropdown into `SidebarSearchBox` and `NewsFeedRightSidebar`
  - Acceptance: Dropdown displays matching users with avatar, name, and username. Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape) and click outside support. Invokes `onViewProfile`.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/app/feed/NewsFeedRightSidebar.tsx`
  - Scope: S

- [ ] Task 4: Thread user data from `NewsFeedPage` to sidebar search
  - Acceptance: `NewsFeedPage` passes `demoUsers`, `suggestedCreators`, and `posts` authors pool plus `user` to `NewsFeedRightSidebar`.
  - Verify: `cd frontend && npx tsc -b && npx oxlint . && npm run build`
  - Files: `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

### Checkpoint: Complete
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] `npm run build` succeeds
- [ ] Native test suite passes
