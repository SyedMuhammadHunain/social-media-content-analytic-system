# Spec: Mobile Light Theme Contrast & Legibility Pass

## Objective
Ensure that on mobile and Android devices (viewports ≤ 767px), all social feed typography—including post body text, author headings, timestamps, hashtags, and navigation elements—remains crisp, high-contrast, and fully legible across both light and dark themes, meeting WCAG 2.1 AAA contrast requirements (≥ 7.0:1).

## Scope & Technical Requirements
1. **Dynamic Theme Variable Binding:**
   - In `NewsFeedPage.tsx`, mobile typography rules must bind directly to Meta Astryx design tokens:
     - Post body text: `var(--color-text-primary, currentColor) !important`
     - Author names: `var(--color-text-primary, currentColor) !important`
     - Post timestamps & supporting labels: `var(--color-text-secondary, currentColor) !important`
   - Hardcoded hex values like `#f1f5f9` and `#ffffff` are strictly prohibited in text color declarations.
2. **Mobile Layout & Readability Preservation:**
   - Retain mobile-enhanced font-size (`15.5px`) and line-height (`1.55`) for body text.
   - Retain `word-break: break-word` and `content-visibility: auto`.
3. **Mobile Drawer Fallback Hardening:**
   - In `MobileNavigationDrawer.tsx`, remove `#FFFFFF` fallbacks that cause white text on light surfaces. Use `currentColor` and `transparent` fallbacks.
4. **Verification & Quality Gates:**
   - Unit test suite in `frontend/test/mobile_light_theme_contrast.test.mjs` verifying AST and CSS rules.
   - Real browser verification via Chrome DevTools Protocol under simulated Pixel 7 Android viewport.
   - WCAG AA (≥ 4.5:1) and AAA (≥ 7.0:1) contrast validation.

## Architecture & Design System Conformance
- **Design System:** Strictly Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`).
- **CSS Variables:** `--color-text-primary` (`#000000` in light, `#ffffff` in dark), `--color-text-secondary` (`#474747` in light, `#9e9e9e` in dark).
- **Zero Third-Party CSS:** No utility libraries or external style overrides.
