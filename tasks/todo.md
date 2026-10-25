# Task List: Post Edit and Delete Capabilities (PDF Section 4.1.ii)

## Task 1: Create Failing TDD Test Suite
**Description:** Implement `frontend/test/post_edit_and_delete.test.mjs` using `node:test` and Chrome DevTools Protocol (CDP) on port `9229` to verify:
1. Authored posts display Edit and Delete buttons (`data-testid="post-edit-btn"`, `data-testid="post-delete-btn"`).
2. Non-authored posts do NOT display Edit and Delete buttons.
3. Clicking Edit opens the edit modal, saving modified text updates post in the feed.
4. Clicking Delete prompts confirmation and removes post from the feed.
5. Deletion/edits reflect in User Profile authored post view.
**Acceptance criteria:**
- [x] Test file created and integrated into test suite.
- [x] Tests run and fail cleanly (RED) against current implementation.
**Verification:**
- [x] Run `cd frontend && node --test test/post_edit_and_delete.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/test/post_edit_and_delete.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Implement Update Post Types and State Mutators
**Description:** Define `UpdatePostInput` in `types/social.ts` and add `handleEditPost(postId, input)` and `handleDeletePost(postId)` in `NewsFeedPage.tsx`.
**Acceptance criteria:**
- [x] `UpdatePostInput` exported in `types/social.ts`.
- [x] `handleEditPost` immutably updates matching post in `posts` state.
- [x] `handleDeletePost` removes matching post from `posts` state.
- [x] Zero TypeScript or lint errors.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/types/social.ts`
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 1: State Mutators Ready
- [x] Post edit and delete handlers compile and exist in feed container.

---

## Task 3: Implement PostCard Author Action Controls & PostEditModal
**Description:** Update `PostCard.tsx` to conditionally render Edit and Delete buttons for authored posts. Create `PostEditModal.tsx` using Astryx components to edit text, media, and hashtags. Add confirmation before deleting.
**Acceptance criteria:**
- [ ] Author check (`currentUser.id === post.author.id`) gates action visibility.
- [ ] `PostEditModal.tsx` provides form fields for text, caption, hashtags.
- [ ] Edit saves and updates post text in DOM.
- [ ] Delete prompts confirmation and dispatches deletion.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/app/feed/PostCard.tsx`
- `frontend/src/app/feed/PostEditModal.tsx`
**Estimated scope:** Medium (2 files)

---

## Task 4: Integrate Edit and Delete in UserProfileView
**Description:** Update `UserProfileView.tsx` so authored posts shown in user profile post history also support edit and delete actions.
**Acceptance criteria:**
- [ ] `UserProfileView` forwards `onEditPost` and `onDeletePost` to post cards.
- [ ] Editing/deleting in profile view updates author post count and feed state.
- [ ] Tests 1-5 in `post_edit_and_delete.test.mjs` turn GREEN.
**Verification:**
- [ ] Run `cd frontend && node --test test/post_edit_and_delete.test.mjs`
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/components/profile/UserProfileView.tsx`
**Estimated scope:** Small (1-2 files)

---

## Checkpoint 2: All Post Actions Green
- [ ] Full post lifecycle (Create, Edit, Delete) working and verified by automated tests.

---

## Task 5: End-to-End Verification, High-Res Screenshots & Branch Push
**Description:** Run all 6 test suites (`npm test`), capture high-resolution screenshot artifacts of the edit modal and post deletion, verify clean build, and push to `Hunain-Frontend`.
**Acceptance criteria:**
- [ ] High-res screenshot artifacts saved in artifact directory:
  - `post_edit_modal.png`
  - `post_deleted_state.png`
- [ ] All test suites (35+ tests) pass 100%.
- [ ] `tsc -b`, `oxlint`, and `vite build` pass with 0 errors.
- [ ] Changes committed and pushed to `origin/Hunain-Frontend`.
**Verification:**
- [ ] Run `cd frontend && npm test`
- [ ] Run `cd frontend && npm run build`
- [ ] Run `git status`
**Dependencies:** Task 4
**Files likely touched:**
- `tasks/todo.md`
- Documentation/verification reports
**Estimated scope:** Small (1-2 files)
