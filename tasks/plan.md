# Implementation Plan: Astryx Gallery Hero Landing Page

## Overview
Implement a standalone public landing page for the Social Media Content Analysis System using Meta Astryx (`@astryxdesign/core`) components and icons. Scaffolded from the `gallery-hero` Astryx template, this page features an unauthenticated entry hero, a "Get Started" CTA that transitions to the Login page, a "Learn More" no-op CTA, and a smooth right-to-left continuous marquee with exactly 4 photo placeholder slots ready for user assets.

## Architecture Decisions
1. **Astryx Template Scaffold**:
   - Use `npx @astryxdesign/cli template gallery-hero ./src/app/gallery-hero` inside `frontend`.
   - Adapt the generated page to strict Astryx design tokens and components without external CSS or non-Astryx icons.
2. **Infinite Smooth Marquee Motion**:
   - Use CSS keyframe animation (`transform: translateX(...)`) with duplicate/looping content to ensure continuous right-to-left motion without hitching or jump cuts.
   - Enforce `prefers-reduced-motion` fallback for accessibility per Hallmark floor.
   - 4 image placeholder slots styled with Astryx `AspectRatio` and `Card` containers.
3. **App View Routing**:
   - In `frontend/src/App.tsx`, maintain state for unauthenticated navigation: default to `'landing'`, switch to `'login'` on "Get Started".
   - Provide a way to return to the landing page from the login view.
4. **Testing & Quality Assurance**:
   - Create `frontend/test/landing_page_astryx.test.mjs` using `node:test` and `@testing-library/react`.
   - Verify `npm run lint`, `npx tsc -b`, `npm test`, and `npm run build`.

## Task List

### Phase 1: Template Scaffold & Marquee Component
- [ ] Task 1: Scaffold Astryx `gallery-hero` template in `frontend/src/app/gallery-hero`.
- [ ] Task 2: Build smooth continuous right-to-left 4-photo marquee track with Astryx placeholder slots.

### Checkpoint: Component Foundations
- [ ] Template scaffolded and marquee renders cleanly.

### Phase 2: Hero Logic & App Integration
- [ ] Task 3: Assemble `GalleryHeroLandingPage` with Astryx icons, "Get Started" handler, and "Learn More" no-op.
- [ ] Task 4: Integrate landing page into `frontend/src/App.tsx` navigation flow.

### Checkpoint: Interactive Navigation
- [ ] Clicking "Get Started" transitions cleanly to Login view.

### Phase 3: Testing & Quality Gate
- [ ] Task 5: Write automated test suite `frontend/test/landing_page_astryx.test.mjs` and execute full validation suite (`lint`, `tsc`, `test`, `build`).

### Checkpoint: Complete
- [ ] All 5 tasks done, 0 TypeScript errors, all tests pass.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Marquee animation jank | Low | Use GPU-accelerated CSS `transform: translateX` with `will-change: transform` |
| StyleX token / build friction | Low | Use standard Astryx StyleX rules and CSS variables declared in Astryx themes |
| Non-Astryx icon leaks | High | Strictly inspect imports; allow only `@astryxdesign/core` / `@astryxdesign/core/icons` |

## Open Questions
- None.
