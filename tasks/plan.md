# Implementation Plan: User Search (SPEC-user-search)

## Overview
Wire sidebar search box to search all registered users client-side. Dropdown shows matches, click opens profile.

## Architecture Decisions
1. **New utility `userSearchIndex.ts`:** Pure functions for deduplication and matching. No component coupling. Testable standalone.
2. **Props threading:** `SidebarSearchBox` receives user pool and callbacks via props from `NewsFeedRightSidebar`, which receives them from `NewsFeedPage`.
3. **Dedup strategy:** Merge demoUsers + suggestedCreators + post authors into `Map<id, SearchableUser>`. demoUsers win on conflict (richest data).
4. **No new dependencies.** Inline styles matching existing sidebar patterns.

## Task List

### Phase 1: Search Logic
- [ ] Task 1: Create `userSearchIndex.ts` with `buildUserPool` and `matchUsers`
- [ ] Task 2: Unit tests for search logic

### Checkpoint: Search Logic
- [ ] `npx tsc -b` clean
- [ ] `npm test` passes (existing + new)

### Phase 2: UI Integration
- [ ] Task 3: Wire search dropdown into `SidebarSearchBox` + `NewsFeedRightSidebar`
- [ ] Task 4: Thread user data from `NewsFeedPage` to sidebar search

### Checkpoint: Complete
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] `npm run build` succeeds
- [ ] All tests pass
- [ ] Type "al" → matching users appear in dropdown
- [ ] Click result → profile opens
- [ ] Escape / click outside → dropdown closes
- [ ] Arrow keys navigate, Enter selects

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Click-outside handler conflicts with sidebar scroll | Low | Use `mousedown` event, stop propagation from dropdown |
| Large user pool in future | Low | Already capped at 8 results; `matchUsers` is O(n) over <100 users |

## Open Questions
None.
