# Implementation Plan: Mobile Light Theme Contrast & Legibility Pass

## Overview
Resolve the Android / mobile light theme font visibility bug where post body text, author headings, and supporting labels become invisible (white-on-white) on screens ≤ 767px. Replace hardcoded light CSS values (`#f1f5f9`, `#ffffff`, `#94a3b8`) inside mobile media queries with dynamic Astryx design tokens (`var(--color-text-primary)`, `var(--color-text-secondary)`). Audit mobile components to ensure complete theme compliance and verify contrast via automated tests.

## Architecture Decisions
- **Astryx Dynamic Theme Tokens:**
  Use Astryx standard CSS custom properties:
  - `var(--color-text-primary)` (resolves to `#000000` in light mode, `#ffffff` in dark mode) for post text, body content, and author names.
  - `var(--color-text-secondary)` (resolves to `#474747` in light mode, `#9e9e9e` in dark mode) for post timestamps, supporting text, and subtle metadata.
- **Strictly Preserve Mobile Layout Enhancements:**
  Keep mobile typography enhancements (`font-size: 15.5px`, `line-height: 1.55`, `letter-spacing: -0.01em`, `word-break: break-word`) and edge-to-edge full width layout while making color assignments dynamic.
- **Fail-Safe Fallbacks:**
  Provide semantic fallbacks (`currentColor`, `inherit`) rather than hardcoded white hex values, preventing washouts if a custom property fails to resolve.

## Task List

### Phase 1: CSS Tokenization & Component Hardening
- [x] Task 1: Replace hardcoded colors in `NewsFeedPage.tsx` mobile styles (`@media (max-width: 767px)`) with Astryx theme tokens.
- [x] Task 2: Audit and harden mobile drawer (`MobileNavigationDrawer.tsx`) and header fallback tokens for light theme.

### Checkpoint: Tokenization Integrity
- [x] No hardcoded light text colors (`#f1f5f9`, `#ffffff`) remain in mobile media query text rules.
- [x] Astryx CSS variables correctly applied for both light and dark modes.

### Phase 2: Automated Testing & Verification
- [x] Task 3: Author automated test suite `frontend/test/mobile_light_theme_contrast.test.mjs` verifying light and dark mode CSS properties and token references.
- [x] Task 4: Execute TypeScript check (`npx tsc -b frontend`), test suite, and production build (`npm run build --prefix frontend`).

### Checkpoint: Complete Verification
- [x] `node --test frontend/test/mobile_light_theme_contrast.test.mjs` passes.
- [x] `npm run build --prefix frontend` succeeds without errors.
- [x] Mobile light theme font is crisp and fully legible on Android viewport sizes.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Contrast regression in dark mode when fixing light mode | High | Use Astryx `light-dark()` tokens (`var(--color-text-primary)`) that automatically adapt to `[data-theme="light"]` and `[data-theme="dark"]`. |
| Breaking existing mobile responsive tests | Medium | Verify existing assertions in `frontend/test/mobile_responsive_navigation.test.mjs` (`15.5px`, `padding: 16px 16px`) continue to pass. |
| Inconsistent modal or drawer contrast | Low | Audit `MobileNavigationDrawer.tsx` inline styles for any hardcoded white text on white backgrounds. |

## Open Questions
- None (All requirements confirmed via `/interview-me`).
