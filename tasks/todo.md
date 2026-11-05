# Active Tasks: Astryx Gallery Hero Landing Page

Plan: `tasks/plan.md`
Spec: `docs/specs/SPEC-landing-page.md`

- [x] Task 1: Scaffold Astryx `gallery-hero` template in `frontend/src/app/gallery-hero`
  - **Description:** Run `npx @astryxdesign/cli template gallery-hero ./src/app/gallery-hero` from within `frontend/` to scaffold the official Astryx template.
  - **Acceptance criteria:**
    - [x] Directory `frontend/src/app/gallery-hero` created with template source.
    - [x] Source uses Astryx core components.
  - **Verification:**
    - [x] `ls -la frontend/src/app/gallery-hero`
    - [x] `cd frontend && npx tsc -b`
  - **Dependencies:** None
  - **Files likely touched:** `frontend/src/app/gallery-hero/*`
  - **Estimated scope:** S (1 directory/file)

- [ ] Task 2: Build smooth continuous right-to-left 4-photo marquee track with Astryx placeholder slots
  - **Description:** Implement `MarqueeTrack` component displaying 4 placeholder photo slots continuously scrolling right to left without jumps, honoring reduced motion.
  - **Acceptance criteria:**
    - [ ] Exactly 4 image placeholder slots created using Astryx tokens and `AspectRatio`.
    - [ ] Infinite right-to-left CSS animation with seamless loop.
    - [ ] Proper `prefers-reduced-motion` support.
  - **Verification:**
    - [ ] Code inspection and visual verify in browser.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `frontend/src/app/gallery-hero/MarqueeTrack.tsx`
    - `frontend/src/app/gallery-hero/marquee.css`
  - **Estimated scope:** S (2 files)

- [ ] Task 3: Assemble `GalleryHeroLandingPage` with Astryx icons, "Get Started" handler, and "Learn More" no-op
  - **Description:** Integrate marquee into `page.tsx` with headline, subtext, Astryx icons only, "Get Started" callback, and "Learn More" no-op button.
  - **Acceptance criteria:**
    - [ ] Uses only `@astryxdesign/core` components and icons.
    - [ ] "Get Started" calls `onGetStarted` prop.
    - [ ] "Learn More" is active and clickable as a no-op.
    - [ ] Embeds the 4-photo marquee track.
  - **Verification:**
    - [ ] `cd frontend && npx tsc -b`
  - **Dependencies:** Task 2
  - **Files likely touched:**
    - `frontend/src/app/gallery-hero/page.tsx`
  - **Estimated scope:** S (1 file)

- [ ] Task 4: Integrate landing page into `frontend/src/App.tsx` navigation flow
  - **Description:** Wire the landing page as the initial unauthenticated view, allowing visitors to click "Get Started" to open `LoginCardPage`, with an option in `LoginCardPage` to navigate back to the landing page.
  - **Acceptance criteria:**
    - [ ] Default unauthenticated state displays landing page.
    - [ ] Clicking "Get Started" sets view state to `'login'`.
    - [ ] Authenticated state continues to render the NewsFeed / analytics app.
  - **Verification:**
    - [ ] `cd frontend && npx tsc -b`
  - **Dependencies:** Task 3
  - **Files likely touched:**
    - `frontend/src/App.tsx`
    - `frontend/src/app/login-card/page.tsx`
  - **Estimated scope:** S (2 files)

- [ ] Task 5: Write automated test suite and execute full verification suite
  - **Description:** Add `frontend/test/landing_page_astryx.test.mjs` testing headline, 4 photo slots, "Get Started" navigation, and "Learn More" no-op. Run linter, typecheck, tests, and build.
  - **Acceptance criteria:**
    - [ ] New unit/integration test file passes cleanly.
    - [ ] `npm run lint` passes (0 errors).
    - [ ] `npx tsc -b` passes (0 errors).
    - [ ] `npm test` passes all tests.
    - [ ] `npm run build` succeeds.
  - **Verification:**
    - [ ] `cd frontend && npm run lint && npx tsc -b && npm test && npm run build`
  - **Dependencies:** Task 4
  - **Files likely touched:**
    - `frontend/test/landing_page_astryx.test.mjs`
    - `frontend/package.json`
  - **Estimated scope:** S (2 files)

## Checkpoints
### Checkpoint: Component Foundations (After Task 2)
- [ ] Template scaffolded and marquee renders cleanly.

### Checkpoint: Interactive Navigation (After Task 4)
- [ ] End-to-end flow from Landing -> Login -> Feed functions cleanly.

### Checkpoint: Complete (After Task 5)
- [ ] All 5 tasks complete, 100% tests passing, zero errors.
