# Task List: Social Media News Feed and Post Composer

## Task 1: Define Social Data Types & Mock Seed Data
**Description:** Define TypeScript interfaces in `frontend/src/types/social.ts` for Post (Text, Image, Video), Comment, User, and Reaction matching PDF Sections 6 & 9. Create `frontend/src/mock/socialSeedData.ts` with initial chronological posts respecting the Section 5 capacity distribution (20% text, 60% image, 20% video).
**Acceptance criteria:**
- [x] Export `Post`, `PostType`, `Comment`, `User`, `CreatePostInput`.
- [x] Seed data populated with realistic posts, authors, timestamps, and hashtags.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
**Dependencies:** None
**Files likely touched:**
- `frontend/src/types/social.ts`
- `frontend/src/mock/socialSeedData.ts`
**Estimated scope:** Small (2 files)

---

## Task 2: Build Astryx Post Composer Component
**Description:** Build `frontend/src/app/feed/PostComposer.tsx` using Meta Astryx primitives (`Card`, `Avatar`, `Button`, `TextArea`, `TextInput`, `Badge`, `TabList`, `HStack`, `VStack`). Support switching between Text, Image, and Video post modes. Validate required fields and emit `onCreatePost`.
**Acceptance criteria:**
- [x] Segmented tab control to switch format between `Text`, `Image`, and `Video`.
- [x] Dynamic input fields (text body, media URL for image/video, hashtags).
- [x] Submit button disabled when text or media URL is empty.
- [x] Pre-clears form upon successful creation.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/app/feed/PostComposer.tsx`
**Estimated scope:** Small (1 file)

---

## Task 3: Build Astryx Post Card & Comment Section Components
**Description:** Build `frontend/src/app/feed/PostCard.tsx` and `frontend/src/app/feed/CommentSection.tsx` using Astryx `Card`, `Avatar`, `Button`, `Badge`, `Divider`, `Icon`. Provide interactive Like/Unlike toggle, Follow/Unfollow toggle, media visualizer, and collapsible commenting section.
**Acceptance criteria:**
- [x] Header renders author Avatar, name, handle, timestamp, and Follow/Unfollow button.
- [x] Media renders responsive image or video with format Badge.
- [x] Action bar includes Like (with count toggle) and Comment (with count toggle) buttons.
- [x] CommentSection renders existing comments and input field to add new comments.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/app/feed/PostCard.tsx`
- `frontend/src/app/feed/CommentSection.tsx`
**Estimated scope:** Medium (2 files)

---

## Checkpoint 1: Feed Primitives Ready
- [x] Type check succeeds on composer, post card, and comment components.

---

## Task 4: Assemble Chronological News Feed & App Navigation
**Description:** Build `frontend/src/app/feed/NewsFeedPage.tsx` assembling composer and chronological list of posts. Update `frontend/src/App.tsx` with a top navigation bar (Astryx `TabList` or header buttons) to switch seamlessly between `News Feed` and `Analytics Dashboard`.
**Acceptance criteria:**
- [x] Feed renders newest posts at top. Submitting a new post prepends it immediately.
- [x] User can switch between `News Feed` and `Analytics Dashboard` tabs.
- [x] Both views render under the dark neutral Astryx theme.
**Verification:**
- [x] Run `cd frontend && npx tsc -b && npm run build`
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/app/feed/NewsFeedPage.tsx`
- `frontend/src/App.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 2: Feature Complete
- [x] Full social workflow operational in frontend.
- [x] Build succeeds with zero errors.

---

## Task 5: DevTools Protocol Automated Verification & Branch Commit
**Description:** Run automated Chrome DevTools test verifying:
1. Console and network health (0 errors).
2. Creating a new post prepends to feed.
3. Toggling Like button updates counter.
4. Adding a comment appears in the post.
5. Tab switching between Feed and Dashboard works smoothly.
Commit and push changes to `origin/Hunain-Frontend`.
**Acceptance criteria:**
- [ ] Zero console and network errors.
- [ ] Interactive tests succeed.
- [ ] Committed and pushed to `Hunain-Frontend`.
**Verification:**
- [ ] Run `node /tmp/devtools_test.mjs`
- [ ] Run `git status`
**Dependencies:** Task 4
**Files likely touched:** Verification script
**Estimated scope:** Verification only

---

## Checkpoint 3: Complete
- [ ] All tasks completed.
