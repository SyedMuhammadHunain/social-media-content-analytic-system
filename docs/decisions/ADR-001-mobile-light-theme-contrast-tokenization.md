# ADR-001: Dynamic Meta Astryx Theme Tokens for Mobile Typography Contrast

## Status
Accepted

## Date
2026-11-15

## Context
When inspecting the Social Media Content Analysis System client on Android mobile viewports (≤ 767px), post body text, author headings, and supporting labels were completely invisible in light theme.
Investigation revealed that inside `@media (max-width: 767px)` in `NewsFeedPage.tsx`, typography rules hardcoded light-colored hex values:
- `.post-card-content-text p, span, [data-astryx-text="body"] { color: #f1f5f9 !important; }`
- `[data-testid^="post-author-"] span { color: #ffffff !important; }`
- `[data-testid^="post-card-"] time { color: #94a3b8 !important; }`

On light theme (`data-theme="light"`), the card surface is white (`rgb(255, 255, 255)`). The `#f1f5f9` text color resulted in a contrast ratio of ~1.05:1 (white-on-white), failing WCAG AA (4.5:1) completely and rendering user posts unreadable on mobile.

## Decision
1. **Adopt Dynamic Meta Astryx Design Tokens:**
   Replace hardcoded hex color values in mobile CSS with native Astryx CSS variables provided by `@astryxdesign/theme-neutral`:
   - `var(--color-text-primary, currentColor) !important` for post body text, card content, and author headings.
   - `var(--color-text-secondary, currentColor) !important` for timestamps and supporting metadata.
2. **Fail-Safe Semantic Fallbacks:**
   Use `currentColor` as fallback rather than `#ffffff` or `#111111` so text automatically inherits the parent container's theme color if custom properties fail to resolve.
3. **Preserve Mobile Typography Improvements:**
   Retain mobile font-size enhancements (`15.5px`), line-height (`1.55`), `letter-spacing: -0.01em`, and `word-break: break-word` along with `content-visibility: auto`.

## Alternatives Considered

### Alternative 1: Duplicate Media Queries per Theme (`html[data-theme="light"] @media...`)
- **Pros:** Explicit CSS rules per theme.
- **Cons:** Duplicates CSS rules, increases stylesheet maintenance, and breaks if a third theme mode (e.g., high-contrast, sepia, system) is introduced.
- **Rejected:** Astryx already maps `--color-text-primary` dynamically using CSS `light-dark()` on the root element.

### Alternative 2: JavaScript Dynamic Theme Class Injection on Mobile Cards
- **Pros:** Programmatic control in React.
- **Cons:** Adds unnecessary React re-render cycles and main thread computation when toggling themes; defeats Vite CSS chunk optimization.
- **Rejected:** Pure CSS custom property resolution is instant, GPU-friendly, and standard.

### Alternative 3: Ad-hoc Hardcoded Dark Colors for Light Mode (`#111111` / `#000000`)
- **Pros:** Quick to hardcode.
- **Cons:** Violates project convention in `AGENTS.md` ("Strictly Meta Astryx (`@astryxdesign/core`)").
- **Rejected:** Astryx design tokens must be authoritative.

## Consequences
- **Positive:** Post body text now renders in `#000000` on `#ffffff` in light theme, achieving a **21.00:1 contrast ratio** (maximum contrast, passing WCAG AAA).
- **Positive:** Zero JavaScript recalculation overhead when switching themes on mobile.
- **Positive:** Mobile navigation drawer and header typography seamlessly adapt between light and dark modes.
- **Maintenance:** Automated regression test suite (`frontend/test/mobile_light_theme_contrast.test.mjs`) guards against future regressions in CI.
