# Task List: User Profile Card & Full Profile View

## Task 1: Extend User Types, Mock Data, and Add Failing TDD Test Suite
**Description:** Add `UserProfile` interface with `headline`, `tags`, `bio`, `followerCount`, `followingCount` to `frontend/src/types/social.ts`. Update `currentUser` in `frontend/src/mock/socialSeedData.ts`. Create `frontend/test/profile_card_and_view.test.mjs` asserting presence of left profile card, view transition, banner, bio editor, and back navigation.
**Acceptance criteria:**
- [x] `UserProfile` type defined and exported.
- [x] `currentUser` extended with tags, headline, bio, and follower metrics.
- [x] TDD test suite created and executed, failing cleanly on missing components (RED).
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm test` (confirms RED)
**Dependencies:** None
**Files likely touched:**
- `frontend/src/types/social.ts`
- `frontend/src/mock/socialSeedData.ts`
- `frontend/test/profile_card_and_view.test.mjs`
**Estimated scope:** Small (3 files)

---

## Checkpoint 1: RED Test State Verified
- [x] Tests run and fail specifically on missing profile card and profile view.

---

## Task 2: Build Official Astryx UserProfileCard & 2-Column Feed Layout
**Description:** Implement `frontend/src/components/profile/UserProfileCard.tsx` using `@astryxdesign/core/ClickableCard`, `Avatar`, `Badge`, `Heading`, `Text`, `HStack`, `VStack`, and `Divider`. Update `frontend/src/app/feed/NewsFeedPage.tsx` to render a 2-column layout (left sidebar profile card + main feed stream).
**Acceptance criteria:**
- [x] `UserProfileCard` renders user avatar, name, handle, headline, tags as `Badge` components, and follower stats.
- [x] Entire card is clickable (`ClickableCard`) with accessible label.
- [x] News feed layout displays profile card on left on desktop.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/components/profile/UserProfileCard.tsx`
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 2: Left Card Rendered
- [x] Left profile card renders cleanly in the feed.

---

## Task 3: Build ProfileBioEditor and UserProfileView
**Description:** Implement `frontend/src/components/profile/ProfileBioEditor.tsx` using `Card`, `Markdown`, `TextArea`, `Toolbar`, `Button`, and `Banner`. Implement `frontend/src/components/profile/UserProfileView.tsx` with `AspectRatio` cover banner, large `Avatar`, `ProfileBioEditor`, "Back to Feed" `Button`, and past post history using `TabList`, `Tab`, `Skeleton`, and `PostCard`. Wire view switching in `NewsFeedPage.tsx`.
**Acceptance criteria:**
- [x] Clicking profile card transitions view to full profile.
- [x] Profile displays `AspectRatio` cover banner and large `Avatar`.
- [x] Bio editor toggles between `Markdown` view and `TextArea` + `Toolbar` edit mode, saving updates and showing Astryx success `Banner`.
- [x] Post history renders authored posts with `Skeleton` loaders during tab change.
- [x] "Back to Feed" button returns to feed stream.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm test`
- [x] Run `cd frontend && npm run build`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/components/profile/ProfileBioEditor.tsx`
- `frontend/src/components/profile/UserProfileView.tsx`
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Medium (3 files)

---

## Checkpoint 3: Profile View Interactive
- [x] Full profile view completely functional with bio editor and post history.

---

## Task 4: Automated Verification, Screenshot Artifacts, and Branch Commit
**Description:** Run automated Chrome DevTools test testing all interactions (card click, profile render, bio edit/save, banner feedback, tab switch, back to feed). Capture screenshots. Commit and push to `origin/Hunain-Frontend`.
**Acceptance criteria:**
- [x] 0 console errors, 0 network errors.
- [x] All tests pass in `npm test`.
- [x] Screenshots saved to artifact directory.
- [x] Changes committed and pushed to `Hunain-Frontend`.
**Verification:**
- [x] Run `node /tmp/verify_profile.mjs`
- [x] Run `git status`
**Dependencies:** Task 3
**Files likely touched:** Verification script, tasks/
**Estimated scope:** Verification only

---

## Checkpoint 4: Feature Complete
- [x] All tasks completed, verified, committed, and pushed.
