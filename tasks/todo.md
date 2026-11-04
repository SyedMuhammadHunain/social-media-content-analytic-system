# Active Tasks: Threads-Style Post Composer Redesign (refine_2_ui)

Spec: `docs/specs/SPEC-composer-redesign.md`
Plan: `tasks/plan.md`

## Phase 1: Core Components

- [x] Task 1: Build `PostMediaToolbar` with Media, GIF, and Emoji tools
  - Acceptance: Toolbar renders icons for Media (file upload), GIF (reaction picker), Emoji (emoji picker). Clicking appends selected media/text. Astryx only.
  - Verify: `npx tsc -b`
  - Files: `frontend/src/app/feed/PostMediaToolbar.tsx`
  - Scope: S

- [x] Task 2: Redesign `PostCreateModal` to match Screenshot 2
  - Acceptance: Modal has "Cancel" top-left, "New Post" center, no top-right icons. Body has user avatar + username, "What's new?" textarea, `PostMediaToolbar`, and bottom-right "Post" button. No "Post options" bottom-left.
  - Verify: `npx tsc -b`, visual check
  - Files: `frontend/src/app/feed/PostCreateModal.tsx`
  - Scope: S

- [ ] Task 3: Redesign `PostComposer` into compact Threads-style prompt bar
  - Acceptance: Renders user avatar + "What's new?" placeholder text + "Post" button matching Screenshot 1. Clicking anywhere opens `PostCreateModal`.
  - Verify: `npx tsc -b`, visual check
  - Files: `frontend/src/app/feed/PostComposer.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

### Checkpoint: Core Components
- [ ] `npx tsc -b` passes
- [ ] Prompt bar renders properly
- [ ] Modal opens and closes properly

## Phase 2: Integration & Layout Continuity

- [ ] Task 4: Connect zero-gap attachment between composer bar and first feed card
  - Acceptance: Zero vertical gap between composer bar and first feed post. Seamless border matching.
  - Verify: `npx tsc -b`, visual inspect
  - Files: `frontend/src/app/feed/NewsFeedPage.tsx`, `frontend/src/app/feed/FeedPostList.tsx`
  - Scope: XS

- [ ] Task 5: End-to-end publishing verification and quality gates
  - Acceptance: User can click prompt bar, type post, attach media/GIF/emoji, submit post, see post in feed. All tests pass, build succeeds.
  - Verify: `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, `npm run build`
  - Files: `tasks/plan.md`, `tasks/todo.md`
  - Scope: S

### Checkpoint: Complete
- [ ] All requirements from `refine_2_ui.md` satisfied
- [ ] Light/dark themes work cleanly
- [ ] `npx tsc -b` clean
- [ ] `npx oxlint .` clean
- [ ] `npm run test:unit` clean (67 tests passing)
- [ ] `npm run build` succeeds
