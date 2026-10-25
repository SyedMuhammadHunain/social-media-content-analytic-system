# Implementation Plan: Feed, Post Composer & Profile Refinements

## Overview
Implement four key UX refinements across the news feed, post composer, and user profile page:
1. Pinned sticky left profile card alongside a centered chronological feed stream.
2. Unified single post composer allowing local image and video media selection from the user's PC.
3. Corrected profile avatar placement overlapping the bottom-left of the cover banner with a ring border.
4. Direct local file upload for changing both the profile avatar photo and the cover banner image.

## Architecture Decisions
1. **Layout Strategy:** Use CSS sticky sidebar (`position: sticky; top: 24px; align-self: flex-start;`) inside a centered flex container (`maxWidth: 1140px; margin: 0 auto; justify-content: center;`), allowing the 680px main feed stream to scroll independently without layout jitter.
2. **Unified Composer Flow:** Eliminate the three tabs (`Text`, `Image`, `Video`). Single text composer with an "Attach Media" button triggering a hidden `<input type="file" accept="image/*,video/*" />`. Selected media generates an object URL (`URL.createObjectURL`) for immediate inline preview and assigns post `type: 'IMAGE' | 'VIDEO' | 'TEXT'`.
3. **Overlapping Avatar Anatomy:** Position the avatar container at the bottom-left edge of the cover banner with an offset (`transform: translateY(50%)` or negative margin) and a 4px protective border (`border: 4px solid var(--color-background-body, #111111)`), with an accessible "Change Photo" action overlay.
4. **Local Profile Media Updates:** Avatar and cover banner uploads read chosen files via `URL.createObjectURL` or `FileReader`, updating `currentUser` state in `NewsFeedPage` so changes reflect in both the full profile page and the left feed card.
5. **Git Discipline:** All changes developed on branch `Hunain-Frontend`.

## Task List

### Phase 1: Layout & TDD Red State
- [x] Task 1: Create Failing TDD Test Suite for All Four Refinements (`frontend/test/refinements_feed_and_profile.test.mjs`)
- [x] Task 2: Implement Sticky Sidebar and Centered Feed Layout (`frontend/src/app/feed/NewsFeedPage.tsx`)

### Checkpoint 1: Layout Sticky & Tests RED
- [x] Sidebar sticky verified, test suite fails cleanly on unbuilt composer/profile upload features.

### Phase 2: Unified Post Composer
- [x] Task 3: Refactor PostComposer to Unified Model with PC Media Selection (`frontend/src/app/feed/PostComposer.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`)

### Checkpoint 2: Composer Functional
- [x] Unified composer allows media upload from PC, previews inline, posts with proper type.

### Phase 3: Profile Avatar Placement & Uploads
- [ ] Task 4: Correct Avatar Placement & Add Avatar/Banner Upload Pickers (`frontend/src/components/profile/UserProfileView.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`)

### Checkpoint 3: Profile Overhaul Complete
- [ ] Avatar overlaps banner with border ring, photo and banner upload pickers work smoothly, all tests turn GREEN.

### Phase 4: Verification, Artifacts & Commit
- [ ] Task 5: Automated DevTools Verification, Screenshot Artifacts, and Branch Commit (`/tmp/verify_refinements.mjs`)

### Checkpoint 4: Complete
- [ ] 100% green test suite, clean build/lint, screenshots generated, committed to `Hunain-Frontend`.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Object URLs memory leak | Low | Revoke object URLs on component unmount or when media is discarded |
| Layout collision on small screens | Medium | Use responsive `@media` or CSS flex-wrap rules with `min-width: 0` |
| Video file size in browser | Low | Limit preview to HTML `<video>` element with `controls` and object URL |
