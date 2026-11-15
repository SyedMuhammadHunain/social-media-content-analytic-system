# Active Tasks: Mobile Light Theme Contrast & Legibility Pass

Plan: `tasks/plan.md`

- [x] Task 1: Replace hardcoded colors in `NewsFeedPage.tsx` mobile styles with Astryx theme tokens
  - **Description:** Update `@media (max-width: 767px)` in `NewsFeedPage.tsx` to replace `#f1f5f9 !important`, `#ffffff !important`, and `#94a3b8 !important` with `var(--color-text-primary, currentColor) !important` for body/author text and `var(--color-text-secondary, currentColor) !important` for timestamps and supporting text. Ensure text remains visible in light theme while retaining dark theme contrast.
  - **Acceptance criteria:**
    - [x] `.post-card-content-text p, .post-card-content-text span, [data-testid^="post-card-"] [data-astryx-text="body"]` uses `var(--color-text-primary, currentColor) !important`.
    - [x] `[data-testid^="post-author-"] span` uses `var(--color-text-primary, currentColor) !important`.
    - [x] `[data-testid^="post-card-"] time, [data-testid^="post-card-"] [data-astryx-text="supporting"]` uses `var(--color-text-secondary, currentColor) !important`.
    - [x] Retains mobile font-size (`15.5px`) and line-height enhancements.
  - **Verification:**
    - [x] Code review of CSS rules in `frontend/src/app/feed/NewsFeedPage.tsx`.
    - [x] Ensure existing mobile responsive tests pass.
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/src/app/feed/NewsFeedPage.tsx`
  - **Estimated scope:** XS (1 file)

- [x] Task 2: Audit and harden mobile drawer and header fallback tokens for light theme
  - **Description:** Review `MobileNavigationDrawer.tsx`, `MobileAppHeader.tsx`, and `MobileBottomNav.tsx` to ensure any inline style colors use theme-neutral fallbacks (`currentColor`, `inherit`) rather than hardcoded `#FFFFFF` against potential white surfaces in light theme.
  - **Acceptance criteria:**
    - [x] `MobileNavigationDrawer.tsx` user profile text uses `var(--color-text-primary, currentColor)`.
    - [x] Secondary labels use `var(--color-text-secondary, currentColor)`.
    - [x] Badge text retains appropriate contrast against badge backgrounds.
  - **Verification:**
    - [x] Verify drawer appearance in both light and dark mode contexts.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `frontend/src/app/feed/MobileNavigationDrawer.tsx`
  - **Estimated scope:** XS (1 file)

## Checkpoint: Foundation & Tokenization
- [x] No hardcoded `#f1f5f9` or `#ffffff` text rules in mobile CSS.
- [x] Astryx theme tokens are properly declared and responsive.

- [ ] Task 3: Author automated test suite for mobile light theme contrast
  - **Description:** Create `frontend/test/mobile_light_theme_contrast.test.mjs` verifying: (1) `NewsFeedPage.tsx` mobile CSS does not contain hardcoded `#f1f5f9` or `#ffffff` color rules, (2) Astryx `--color-text-primary` and `--color-text-secondary` are bound to mobile typography, (3) `MobileNavigationDrawer.tsx` does not hardcode white text fallbacks on non-primary surfaces.
  - **Acceptance criteria:**
    - [ ] Test file exists in `frontend/test/mobile_light_theme_contrast.test.mjs`.
    - [ ] Runs with `node --test frontend/test/mobile_light_theme_contrast.test.mjs` and passes 100%.
  - **Verification:**
    - [ ] `node --test frontend/test/mobile_light_theme_contrast.test.mjs`
  - **Dependencies:** Task 1, Task 2
  - **Files likely touched:**
    - `frontend/test/mobile_light_theme_contrast.test.mjs`
  - **Estimated scope:** S (1 file)

- [ ] Task 4: Full regression verification, TypeScript compile, and production build
  - **Description:** Run TypeScript compiler (`npx tsc -b frontend`), existing mobile tests (`node --test frontend/test/mobile_responsive_navigation.test.mjs`), and `npm run build` to confirm zero build or styling regressions.
  - **Acceptance criteria:**
    - [ ] `npx tsc -b frontend` exits with code 0.
    - [ ] `node --test frontend/test/mobile_responsive_navigation.test.mjs` passes.
    - [ ] `npm run build --prefix frontend` succeeds without errors.
  - **Verification:**
    - [ ] `npx tsc -b frontend`
    - [ ] `npm run build --prefix frontend`
  - **Dependencies:** Task 3
  - **Files likely touched:** None (verification step)
  - **Estimated scope:** XS

## Checkpoint: Ready for Implementation & Review
- [ ] All tests passing.
- [ ] Build clean.
- [ ] Production bundle validated.
