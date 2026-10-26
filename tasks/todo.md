# Task List: CodeScene Code Health Refactoring & Modularity Enhancement

## Task 1: CodeScene Configuration & Test Exclusion Rules
**Description:** Configure repository-level rules to exclude test files (`frontend/test/**`) from production complexity calculations. Provide both `.codescene/code-health-rules.json` and a clear reference guide for web UI settings.
**Acceptance criteria:**
- [x] `.codescene/code-health-rules.json` created in repo root with `frontend/test/**` marked as test code.
- [x] `docs/reports/codescene-configuration-guide.md` created with step-by-step UI instructions.
- [x] Valid JSON syntax with no linting errors.
**Verification:**
- [x] Inspect `.codescene/code-health-rules.json` syntax.
**Dependencies:** None
**Files likely touched:**
- `.codescene/code-health-rules.json`
- `docs/reports/codescene-configuration-guide.md`
**Estimated scope:** Small (2 files)

---

## Task 2: Decompose PostCard into Single-Responsibility Subcomponents
**Description:** Refactor `frontend/src/app/feed/PostCard.tsx` (318 lines) by extracting:
1. `PostDeleteModal.tsx`: modal overlay with backdrop, confirmation text, Cancel and Delete Post buttons (`post-delete-confirm-modal`, `confirm-delete-btn`).
2. `PostMediaViewer.tsx`: image and video media elements with aspect-ratio container.
3. `PostHeader.tsx`: author avatar, username, format badge, timestamp, and edit/delete/follow controls.
Refactor `PostCard.tsx` to orchestrate these subcomponents cleanly in ~120 lines.
**Acceptance criteria:**
- [x] `PostDeleteModal.tsx`, `PostMediaViewer.tsx`, and `PostHeader.tsx` implemented using Astryx components.
- [x] `PostCard.tsx` imports and renders subcomponents with clean props.
- [x] All `data-testid` attributes preserved exactly.
- [x] Zero TypeScript errors (`cd frontend && npx tsc -b`).
- [x] Zero lint errors (`cd frontend && npm run lint`).
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
- [x] Run `cd frontend && node --test test/post_edit_and_delete.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/src/app/feed/PostHeader.tsx`
- `frontend/src/app/feed/PostMediaViewer.tsx`
- `frontend/src/app/feed/PostDeleteModal.tsx`
- `frontend/src/app/feed/PostCard.tsx`
**Estimated scope:** Medium (4 files)

---

## Checkpoint 1: PostCard Refactor Verified
- [x] TypeScript check clean (`npx tsc -b`)
- [x] Lint check clean (`npm run lint`)
- [x] Post edit/delete tests pass (`test/post_edit_and_delete.test.mjs`)

---

## Task 3: Decompose UserProfileView into Single-Responsibility Subcomponents
**Description:** Refactor `frontend/src/components/profile/UserProfileView.tsx` (355 lines) by extracting:
1. `ProfileHeaderBanner.tsx`: cover banner display, banner upload input/trigger, overlapping avatar with ring border, and camera upload trigger (`profile-cover-banner`, `profile-avatar-wrapper`, `upload-banner-trigger`, `upload-avatar-trigger`).
2. `ProfileMetaDetails.tsx`: headline, tags/badges, and follower/following stats bar.
Refactor `UserProfileView.tsx` to orchestrate header banner, meta details, bio editor, and authored post list in ~170 lines.
**Acceptance criteria:**
- [x] `ProfileHeaderBanner.tsx` and `ProfileMetaDetails.tsx` implemented with Astryx components.
- [x] `UserProfileView.tsx` imports and renders subcomponents cleanly.
- [x] All `data-testid` attributes preserved.
- [x] Zero TypeScript errors (`cd frontend && npx tsc -b`).
- [x] Zero lint errors (`cd frontend && npm run lint`).
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
- [x] Run `cd frontend && node --test test/profile_card_and_view.test.mjs`
- [x] Run `cd frontend && node --test test/refinements_feed_and_profile.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/src/components/profile/ProfileHeaderBanner.tsx`
- `frontend/src/components/profile/ProfileMetaDetails.tsx`
- `frontend/src/components/profile/UserProfileView.tsx`
**Estimated scope:** Medium (3 files)

---

## Checkpoint 2: Profile View Refactor Verified
- [x] TypeScript check clean (`npx tsc -b`)
- [x] Profile view tests pass (`profile_card_and_view.test.mjs`, `refinements_feed_and_profile.test.mjs`)

---

## Task 4: Full Quality Gate, Verification, and Build
**Description:** Execute the entire test suite (all 7 suites), verify production build, commit changes, and push.
**Acceptance criteria:**
- [x] 100% test pass rate (43/43 tests green).
- [x] Production build succeeds (`cd frontend && npm run build`).
- [x] Clean git working tree, committed, and pushed.
**Verification:**
- [x] Run `cd frontend && npm test`
- [x] Run `cd frontend && npm run build`
**Dependencies:** Task 1, Task 2, Task 3
**Files likely touched:**
- Git repository state
**Estimated scope:** Small

---

## Checkpoint 3: Complete & Ready for Review
- [x] All 4 tasks completed and verified
- [ ] Code health improved with zero hotspot warnings
- [ ] Ready for `/incremental-implementation`
