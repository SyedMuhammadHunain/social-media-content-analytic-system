# Active Tasks: Mobile Refinements & Animated GIF Integration

Spec: `docs/specs/SPEC-mobile-responsive-navigation.md`
Plan: `tasks/plan.md`

- [x] Task 1: Unlock Viewport Scrolling and Implement Mobile Header
- [x] Task 2: Implement Astryx 5-Icon Bottom Bar and In-Place View Swapping
- [x] Task 3: Implement Left Slide Navigation Drawer and Automated Mobile Verification

- [x] Task 4: Mobile Icon-Only Post Actions and Top Header Polishing
  - **Description:** Ensure `MobileAppHeader.tsx` places Hamburger button on top-left, centered App Logo only (no "SocialPulse" text), and Search button on top-right. In `PostCardActionBar.tsx` and `PostActionButtons.tsx`, render Like, Comment, Bookmark, and Share buttons as icon-only on mobile screens (< 768px), hiding text strings ("5 Likes", "3 Comments", "Save", "Share"), while retaining counts and labels on desktop (≥ 768px).
  - **Acceptance criteria:**
    - [x] `MobileAppHeader.tsx` renders Hamburger button on top left, App Logo centered without text, and Search button on top right.
    - [x] On mobile viewports (< 768px), post card actions (Like, Comment, Bookmark, Share) render strictly as icons with no accompanying label text.
    - [x] On desktop viewports (≥ 768px), post card actions display numerical counts and text labels.
    - [x] Unit and CDP tests pass with 100% green verification.
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
    - [x] `cd frontend && npm run lint`
    - [x] `cd frontend && npm run test:unit`
  - **Dependencies:** Task 1, Task 2, Task 3
  - **Files likely touched:**
    - `frontend/src/app/feed/MobileAppHeader.tsx`
    - `frontend/src/app/feed/PostCardActionBar.tsx`
    - `frontend/src/app/feed/PostActionButtons.tsx`
    - `frontend/src/app/feed/NewsFeedPage.tsx`
    - `frontend/test/mobile_responsive_navigation.test.mjs`
  - **Estimated scope:** S (3 files)

- [x] Task 5: Animated GIF Provider, Search & Direct URL Attachment
  - **Description:** Upgrade `GifPickerPopover` in `MediaPickerPopovers.tsx` to support real animated GIFs (`.gif`), live search input with instant tag filtering, and custom direct GIF URL input. Connect selection to `PostComposerForm` and `PostCreateModal` so animated GIFs preview and post cleanly.
  - **Acceptance criteria:**
    - [x] `GifPickerPopover` provides an Astryx search bar filtering animated GIFs in real time.
    - [x] Library contains real animated `.gif` reaction assets (Celebration, Dancing, Applause, Mind Blown, Fire, Shocked, Laughing, etc.).
    - [x] Allows pasting custom external GIF URL to attach any animated GIF directly.
    - [x] Selecting a GIF attaches it to the post composer and renders animated preview in `PostMediaViewer`.
    - [x] Unit tests verify search filtering, GIF selection, and post attachment.
  - **Verification:**
    - [x] `cd frontend && npx tsc -b`
    - [x] `cd frontend && npm run lint`
    - [x] `cd frontend && npm run test:unit`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/app/feed/MediaPickerPopovers.tsx`
    - `frontend/src/app/feed/presetGifs.ts`
    - `frontend/src/app/feed/PostMediaToolbar.tsx`
    - `frontend/src/app/feed/PostCreateModal.tsx`
    - `frontend/test/animated_gif_support.test.mjs`
  - **Estimated scope:** M (3 files)

## Checkpoint: Complete
- [x] Task 4 and Task 5 checked off
- [x] Zero TypeScript or lint errors
- [x] All unit and CDP test suites pass
- [x] Production build succeeds
