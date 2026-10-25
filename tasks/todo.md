# Task List: News Feed, Post Composer & Profile Refinements

## Task 1: Create Failing TDD Test Suite for All Four Refinements
**Description:** Implement `frontend/test/refinements_feed_and_profile.test.mjs` using `node:test` and CDP asserting:
1. Left profile card has `position: sticky` and feed is centered.
2. Post composer has unified interface with no multi-tabs, and contains a file input for media selection from PC.
3. Profile view avatar has overlapping placement with protective border ring.
4. Profile view includes upload triggers for avatar and cover banner.
**Acceptance criteria:**
- [x] Test file created and integrated into `npm test`.
- [x] Test suite executes and fails cleanly on missing implementations (RED).
**Verification:**
- [x] Run `cd frontend && node --test test/refinements_feed_and_profile.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/test/refinements_feed_and_profile.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Implement Sticky Sidebar and Centered Feed Layout
**Description:** Update `frontend/src/app/feed/NewsFeedPage.tsx` to wrap the profile card in a sticky sidebar container (`position: sticky; top: 24px; alignSelf: flex-start;`) and center the 680px main feed stream in the page container.
**Acceptance criteria:**
- [x] Left profile card remains sticky during feed scroll.
- [x] News feed stream is horizontally centered.
- [x] Responsive flex-wrap preserved on smaller viewports.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
- [x] Test 1 in `refinements_feed_and_profile.test.mjs` passes.
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint 1: Layout Sticky & Tests RED
- [x] Sidebar is sticky, feed centered, tests 2-4 fail cleanly on remaining features.

---

## Task 3: Refactor PostComposer to Unified Model with PC Media Selection
**Description:** Overhaul `frontend/src/app/feed/PostComposer.tsx`: remove the three post-type tabs (`Text`, `Image`, `Video`). Render a unified text composer with an "Attach Media" button triggering a hidden `<input type="file" accept="image/*,video/*" />`. Generate local object URL for preview, display inline preview with remove action, and pass chosen media URL and auto-detected post type (`IMAGE`, `VIDEO`, or `TEXT`) to `onCreatePost`.
**Acceptance criteria:**
- [ ] Tabs removed; single unified composer displayed.
- [ ] Local file picker selects image or video from PC.
- [ ] Inline media preview with remove button renders when media is attached.
- [ ] Form submission dispatches post with correct `type` and media URL.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
- [ ] Test 2 in `refinements_feed_and_profile.test.mjs` passes.
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/app/feed/PostComposer.tsx`
**Estimated scope:** Medium (1-2 files)

---

## Checkpoint 2: Unified Composer Functional
- [ ] Unified composer allows local media upload and creates posts smoothly.

---

## Task 4: Correct Avatar Placement & Add Avatar/Banner Upload Pickers
**Description:** In `frontend/src/components/profile/UserProfileView.tsx`, anchor the profile avatar overlapping the bottom-left edge of the cover banner with a 4px ring border matching the background. Add a "Change Photo" action overlay on the avatar and an "Upload Banner" button on the cover banner, triggering hidden file inputs and calling `onUpdateAvatar` and `onUpdateBanner` handlers. Wire state in `NewsFeedPage.tsx`.
**Acceptance criteria:**
- [ ] Avatar sits overlapping the bottom-left of the cover banner with a 4px ring border.
- [ ] Clicking avatar or "Change Photo" opens local file picker and updates avatar.
- [ ] Clicking "Upload Banner" opens local file picker and updates cover banner image.
- [ ] Changes propagate to `user` state and reflect across full profile and left feed card.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
- [ ] All tests in `refinements_feed_and_profile.test.mjs` turn GREEN.
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/components/profile/UserProfileView.tsx`
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Medium (2 files)

---

## Checkpoint 3: Profile Overhaul Complete
- [ ] Profile layout and photo/banner uploaders functional, all automated tests green.

---

## Task 5: Automated Verification, Screenshot Artifacts, and Branch Commit
**Description:** Create automated verification script `/tmp/verify_refinements.mjs` capturing screenshots:
- `sticky_sidebar_centered_feed.png`
- `unified_post_composer_with_media.png`
- `profile_overlapping_avatar_and_banner.png`
Run full test suite and build check, then commit and push to `origin/Hunain-Frontend`.
**Acceptance criteria:**
- [ ] All 17+ tests in `npm test` pass.
- [ ] `tsc -b`, `oxlint`, `vite build` pass with zero errors.
- [ ] Screenshots captured in artifact directory.
- [ ] Changes committed and pushed to `Hunain-Frontend`.
**Verification:**
- [ ] Run `node /tmp/verify_refinements.mjs`
- [ ] Run `git status`
**Dependencies:** Task 4
**Files likely touched:** Verification script, tasks/
**Estimated scope:** Verification only

---

## Checkpoint 4: Complete
- [ ] All 4 refinements implemented, verified, and pushed to `Hunain-Frontend`.
