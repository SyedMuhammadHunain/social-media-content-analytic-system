# Active Tasks: Landing Page Gallery & Navigation Refinements

Plan: `tasks/plan.md`

- [x] Task 1: Place 3 uploaded images into `frontend/public/landing/` and integrate into `MarqueeTrack.tsx`
  - **Description:** Copy uploaded image files to `frontend/public/landing/` (`gallery-1.jpg`, `gallery-2.jpg`, `gallery-3.jpg`) and configure `THREE_IMAGE_SLOTS` in `MarqueeTrack.tsx` to render them in a seamless continuous right-to-left loop.
  - **Acceptance criteria:**
    - [x] `gallery-1.jpg`, `gallery-2.jpg`, and `gallery-3.jpg` present in `frontend/public/landing/`.
    - [x] `MarqueeTrack.tsx` renders the 3 provided images.
  - **Verification:**
    - [x] `ls -la frontend/public/landing/`
    - [x] `cd frontend && npx tsc -b`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/public/landing/gallery-*.jpg`
    - `frontend/src/app/gallery-hero/MarqueeTrack.tsx`
  - **Estimated scope:** S (2 files + static assets)

- [ ] Task 2: Update `marquee.css` for 3-desktop / 1-mobile sizing, remove hover pause, and remove edge shadows
  - **Description:** Adjust `.marquee-item` to occupy full screen with 3 images on desktop and 1 image on mobile/Android. Remove `mask-image` edge shadows and remove hover pause animation rule.
  - **Acceptance criteria:**
    - [ ] On desktop (> 768px), 3 images span the screen width.
    - [ ] On mobile/Android (<= 768px), 1 image spans the screen width.
    - [ ] Height increased proportionally for full-screen gallery prominence.
    - [ ] Hovering over marquee does not stop the animation.
    - [ ] Shadows / fade masks on left and right sides removed.
  - **Verification:**
    - [ ] Verify CSS rules and media queries in `frontend/src/app/gallery-hero/marquee.css`.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `frontend/src/app/gallery-hero/marquee.css`
  - **Estimated scope:** XS (1 file)

- [ ] Task 3: Remove "Back to overview" button and `onBack` prop from `LoginCardPage` and `App.tsx`
  - **Description:** Remove `onBack` prop and the back button header from `frontend/src/app/login-card/page.tsx` and `frontend/src/App.tsx`.
  - **Acceptance criteria:**
    - [ ] No `onBack` prop or "Back to overview" button in `LoginCardPage`.
    - [ ] `App.tsx` cleanly renders `LoginCardPage` without `onBack`.
  - **Verification:**
    - [ ] `cd frontend && npx tsc -b`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/app/login-card/page.tsx`
    - `frontend/src/App.tsx`
  - **Estimated scope:** S (2 files)

- [ ] Task 4: Write automated tests and execute full verification suite
  - **Description:** Create `frontend/test/landing_page_astryx.test.mjs` verifying images, marquee structure, and "Get Started" navigation. Execute `npm run lint`, `npx tsc -b`, `npm test`, and `npm run build`.
  - **Acceptance criteria:**
    - [ ] `frontend/test/landing_page_astryx.test.mjs` passes cleanly.
    - [ ] `npm run lint` passes (0 errors).
    - [ ] `npx tsc -b` passes (0 errors).
    - [ ] `npm test` passes all tests.
    - [ ] `npm run build` succeeds.
  - **Verification:**
    - [ ] `cd frontend && npm run lint && npx tsc -b && npm test && npm run build`
  - **Dependencies:** Task 1, Task 2, Task 3
  - **Files likely touched:**
    - `frontend/test/landing_page_astryx.test.mjs`
    - `frontend/package.json`
  - **Estimated scope:** S (2 files)

## Checkpoints
### Checkpoint: Gallery & Sizing (After Task 2)
- [ ] 3 real images render with continuous right-to-left loop, full screen responsive widths (3 desktop / 1 mobile), no edge shadows, and continuous scroll on hover.

### Checkpoint: Navigation (After Task 3)
- [ ] LoginCardPage rendered without back button.

### Checkpoint: Complete (After Task 4)
- [ ] All 4 tasks done, 100% tests pass, build succeeds.
