# Implementation Plan: Landing Page Gallery & Navigation Refinements

## Overview
Refine the Astryx Gallery Hero Landing Page by incorporating 3 user-provided photography assets, optimizing image dimensions to span exactly 3 images across desktop screens and 1 image on mobile/Android devices, removing hover pauses and left/right gradient mask shadows, and removing the "Back to overview" button on the Login page.

## Architecture Decisions
1. **Static Asset Placement**:
   - Copy the 3 user-uploaded images to `frontend/public/landing/` as `gallery-1.jpg`, `gallery-2.jpg`, and `gallery-3.jpg`.
   - Update `MarqueeTrack.tsx` to reference these 3 assets, looping them seamlessly (`[img1, img2, img3, img1, img2, img3]`).
2. **Responsive Scale (3 Desktop, 1 Android)**:
   - In `marquee.css`, configure `.marquee-item`:
     - Desktop (> 768px): `width: calc((100vw - 4rem) / 3);` with height scaled up (e.g. `height: 480px` or `50vh`).
     - Mobile (<= 768px): `width: calc(100vw - 2rem);` with height scaled (e.g. `height: 380px` or `45vh`).
   - Use `objectFit: 'cover'` and Astryx tokens for corner radii.
3. **Continuous Motion Without Hover Pause**:
   - Delete `.marquee-track:hover { animation-play-state: paused; }` so the marquee constantly glides right-to-left even when cursor hovers over it.
4. **Remove Gradient Edge Shadows**:
   - Remove `mask-image` and `-webkit-mask-image` properties from `.marquee-container`.
5. **Remove "Back to overview" Navigation**:
   - Remove `onBack` prop and button from `frontend/src/app/login-card/page.tsx`.
   - Remove `onBack` handler from `frontend/src/App.tsx`.
6. **Automated Verification**:
   - Create `frontend/test/landing_page_astryx.test.mjs`.
   - Run typecheck, linting, tests, and build.

## Task List

### Phase 1: Asset Integration & Marquee Refactor
- [ ] Task 1: Place 3 uploaded images into `frontend/public/landing/` and integrate into `MarqueeTrack.tsx`.
- [ ] Task 2: Update `marquee.css` for 3-desktop/1-mobile sizing, remove hover pause, and remove edge shadows.

### Checkpoint: Gallery Presentation
- [ ] 3 user images render with continuous loop, responsive layout, no edge shadows, and no hover pausing.

### Phase 2: Navigation & Login Cleanup
- [ ] Task 3: Remove "Back to overview" button and `onBack` prop from `LoginCardPage` and `App.tsx`.

### Checkpoint: Clean Navigation Flow
- [ ] "Get Started" opens clean LoginCardPage without back button.

### Phase 3: Automated Testing & Verification
- [ ] Task 4: Write automated tests in `frontend/test/landing_page_astryx.test.mjs` and execute quality gates (`npm run lint`, `npx tsc -b`, `npm test`, `npm run build`).

### Checkpoint: Complete
- [ ] All 4 tasks done, 0 TypeScript errors, 100% tests passing.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Viewport overflow from large widths | Low | Use `overflow: hidden` on container and `box-sizing: border-box` |
| Image distortion on wide screens | Low | Enforce `object-fit: cover` within container AspectRatio |
