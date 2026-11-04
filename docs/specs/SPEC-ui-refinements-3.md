# Spec: Feed & Shell Minor UI Refinements (refine_3_ui)

## Objective
Streamline the social media content analysis web application layout and modal utilities based on `refine_3_ui.md`:
1. **Left Side Panel:** Remove "Media Only" filter item from the "Feeds and Shortcuts" card.
2. **Top Navbar Removal:** Remove top navbar (`AppHeader`) completely so the 3-column layout flows directly from the top of the viewport (0px gap at top).
3. **Right Side Panel Cleanup:** Remove "Trending Topics" card.
4. **Search Input Box:** Add a pill-style search input box above "Who to Follow" matching `Screenshot From 2026-11-04 21-03-41.png` (standalone mock input; search engine integration deferred).
5. **Full-Width GIF & Emoji Pickers:** Expand GIF and Emoji popover cards to 100% width of the composer modal container. Document architectural roadmap for integrating full external provider support (Tenor/Giphy API & full Unicode emoji dataset).

## Tech Stack
- Framework: React 19, TypeScript 5.8, Vite 8
- UI & Design System: Strictly Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- Icons: Astryx Icons (`@astryxdesign/core/Icon`, `@astryxdesign/core/icons`)
- Testing: Node.js test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP)

## Commands
- Build: `cd frontend && npm run build`
- Typecheck: `cd frontend && npx tsc -b`
- Lint: `cd frontend && npx oxlint .`
- Unit Tests: `cd frontend && npm run test:unit`
- Dev Server: `cd frontend && npm run dev`

## Project Structure
- `frontend/src/App.tsx`: App shell layout (remove `AppHeader` navbar, adjust top spacing).
- `frontend/src/app/feed/NewsFeedLeftSidebar.tsx`: Feeds and Shortcuts card (remove "Media Only" item).
- `frontend/src/app/feed/NewsFeedRightSidebar.tsx`: Right sidebar (remove Trending Topics, add pill Search Input box above Who to Follow).
- `frontend/src/app/feed/PostMediaToolbar.tsx`: Expand Emoji and GIF picker cards to `width: '100%'` with responsive grid layouts.
- `frontend/test/ui_refinements_3_e2e.test.mjs`: E2E verification test for all 5 refinements.
- `docs/specs/SPEC-ui-refinements-3.md`: This specification.

## Code Style & Implementation Details
- **Pill Search Input:**
  - Styled with Astryx tokens: `borderRadius: '9999px'`, subtle dark surface background `var(--color-background-surface, #1e1e1e)`, border `1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))`.
  - Leading search icon (`MagnifyingGlassIcon` / `SearchIcon` from Astryx).
  - Placeholder: `"Search"`.
- **Picker Cards Full-Width:**
  - Change `maxWidth: 320` and `maxWidth: 380` to `width: '100%'`, `boxSizing: 'border-box'`.
  - Emoji grid: dynamic multi-column grid (`repeat(auto-fill, minmax(36px, 1fr))` or `repeat(8, 1fr)`).
  - GIF grid: responsive 2-column or 3-column grid filling 100% width.
- **Navbar Removal:**
  - In `App.tsx`, remove `<AppHeader ... />` and eliminate `paddingTop: 64px` or equivalent top margin from layout container.
- **Provider Support Architecture (Documentation/Roadmap):**
  - Detail Tenor v2 REST API integration (`/v2/search`, `/v2/featured` with API key) and standard virtualized emoji picker integration (`@emoji-mart/react` or Unicode 15.0 emoji data).

## Testing Strategy
- Unit & static tests: `npx tsc -b` and `npx oxlint .`.
- E2E CDP test: Automated headless Chrome test verifying:
  1. No navbar in DOM / view starts at top of screen.
  2. Left sidebar Feeds card has no "Media Only" option.
  3. Right sidebar has pill Search Input Box above "Who to Follow", and no Trending Topics card.
  4. Opening "New Post" modal and toggling GIF/Emoji shows full-width pickers.

## Boundaries
- **Always do:**
  - Use Meta Astryx components and theme variables exclusively.
  - Keep responsive layout intact across desktop and mobile breakpoints.
  - Run `npx tsc -b`, `npx oxlint .`, and `npm run test:unit` after changes.
- **Ask first:**
  - Adding external npm packages for GIF or emoji APIs.
- **Never do:**
  - Introduce custom CSS files or non-Astryx UI libraries.
  - Break existing post creation or feed interaction flows.

## Success Criteria
1. Left sidebar "Feeds and Shortcuts" card contains only "All Posts" and "Bookmarks" (no "Media Only").
2. Top navbar is removed from the DOM; feed, left sidebar, and right sidebar align flush to top of page (`top: 16px` or `top: 24px`).
3. Right sidebar contains only the Search Input Box and "Who to Follow" card (Trending Topics card completely removed).
4. Pill-style Search Input Box renders above "Who to Follow" with magnifying glass icon and "Search" placeholder.
5. In "New Post" modal, clicking GIF or Emoji opens a card that spans the full width of the modal.
6. Technical architecture guide for full GIF/Emoji API integration documented in `docs/intent/gif_and_emoji_provider_guide.md`.
7. `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build` all pass with zero errors.

## Open Questions
None — all requirements confirmed during interview.
