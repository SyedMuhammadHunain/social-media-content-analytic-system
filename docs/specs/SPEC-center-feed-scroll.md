# Spec: Independent Center Feed Scroll Container (SPEC-center-feed-scroll)

## Objective
Provide an app-like layout experience matching modern social platforms (Threads, X):
1. **Static Page Shell:** Lock the outer page and body (`height: 100vh; overflow: hidden`) so the viewport does not scroll, bounce, or jump.
2. **Independent Center Scroll:** The center feed column (`max-width: 680px`) operates as its own scroll container with `max-height: calc(100vh - 48px); overflow-y: auto`.
3. **Hidden Scrollbar:** Scrollbar in the center rail is cleanly hidden (`scrollbar-width: none; ::-webkit-scrollbar { display: none }`), matching the left and right sidebars.
4. **Pinned Sidebars:** Left profile/shortcuts sidebar and right search/who-to-follow sidebar stay fixed in place while center content (composer prompt bar, posts, comments) moves up and down on scroll.

## Tech Stack
- Framework: React 19, TypeScript 5.8, Vite 8
- UI & Design System: Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- Testing: Node.js test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP)

## Commands
- Build: `cd frontend && npm run build`
- Typecheck: `cd frontend && npx tsc -b`
- Lint: `cd frontend && npx oxlint .`
- Unit Tests: `cd frontend && npm run test:unit`
- Dev Server: `cd frontend && npm run dev`

## Project Structure
- `frontend/src/App.tsx`: App root wrapper set to `height: 100vh; overflow: hidden`.
- `frontend/src/app/feed/NewsFeedPage.tsx`:
  - Center column `<main>` given dedicated class `.newsfeed-center-scroll`.
  - CSS rule `.newsfeed-center-scroll`: `height: calc(100vh - 48px); overflow-y: auto; scrollbar-width: none`.
  - Sidebars remain `position: fixed; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto`.
- `frontend/test/center_feed_scroll_e2e.test.mjs`: Automated CDP test verifying window scroll lock and independent center scroll.

## Code Style & Implementation Details
```css
/* Center Column Scroll Container */
.newsfeed-center-scroll {
  width: 100%;
  max-width: 680px;
  min-width: 0;
  height: calc(100vh - 48px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.newsfeed-center-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
```

## Testing Strategy
- Unit & static tests: `npx tsc -b` and `npx oxlint .`.
- E2E CDP test:
  1. Open page in headless Chrome.
  2. Dispatch scroll event on center rail.
  3. Verify `window.scrollY === 0` (window remains static).
  4. Verify `.newsfeed-center-scroll` has `scrollTop > 0` (inner feed scrolled).
  5. Verify left rail and right rail bounding boxes remain stationary.

## Boundaries
- **Always do:**
  - Preserve responsive behavior on tablets (< 1024px) and mobile devices.
  - Keep modals (`PostCreateModal`, `ProfileViewersModal`) layered above the scroll container (`zIndex >= 1000`).
- **Ask first:**
  - Modifying the global HTML structure outside `App.tsx`.
- **Never do:**
  - Introduce custom global CSS files outside standard Astryx / component scoped styles.
  - Break tab switching (dashboard, notifications, profile).

## Success Criteria
1. Outer body and HTML do not scroll (`overflow: hidden; height: 100vh`).
2. Center feed column scrolls independently with mouse wheel and touch gestures.
3. Center scrollbar is completely hidden.
4. Left sidebar and right sidebar remain fixed in place.
5. All automated unit and CDP tests pass with 0 errors.

## Open Questions
None.
