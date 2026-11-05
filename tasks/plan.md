# Implementation Plan: Astryx Static Gallery Hero Landing Page

## Overview
Revert the marquee animation and implement the official Astryx `gallery-hero` template layout with a clean static photo grid displaying the 3 provided photography assets. Maintain custom user functionality ("Get Started" navigates to Login page, "Learn More" is no-op) with strictly Meta Astryx icons (`chevronRight`), and remove the "Back to overview" button from `LoginCardPage`.

## Architecture Decisions
1. **Clean Static Astryx Layout**:
   - Replace the moving marquee track with Astryx `<Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>`.
   - Render the 3 provided images (`/landing/gallery-1.jpg`, `/landing/gallery-2.jpg`, `/landing/gallery-3.jpg`) inside `<AspectRatio ratio={4 / 5} style={galleryImageClip}>`.
2. **User Functionality Retention**:
   - `onGetStarted`: Triggers navigation to `LoginCardPage`.
   - `onLearnMore`: Active clickable no-op (`onClick={() => {}}`).
   - Astryx Icons only: Use `<Icon icon="chevronRight" size="sm" color="inherit" />` (strictly zero third-party icons).
3. **Remove "Back to overview" Button**:
   - Remove `onBack` prop and button from `frontend/src/app/login-card/page.tsx`.
   - Remove `onBack` handler from `frontend/src/App.tsx`.
4. **Remove Unused Marquee Code**:
   - Remove `MarqueeTrack.tsx` and `marquee.css`.
5. **Quality Gates & Verification**:
   - Add unit/integration test suite `frontend/test/landing_page_astryx.test.mjs`.
   - Run `npm run lint`, `npx tsc -b`, `npm test`, and `npm run build`.

## Task List

### Phase 1: Static Gallery Hero Implementation
- [ ] Task 1: Refactor `frontend/src/app/gallery-hero/page.tsx` with static Astryx Grid, 3 user photos, and custom callbacks. Remove `MarqueeTrack.tsx` & `marquee.css`.

### Phase 2: Navigation & Login Cleanup
- [ ] Task 2: Remove "Back to overview" button and `onBack` prop from `LoginCardPage` and `App.tsx`.

### Phase 3: Automated Testing & Verification
- [ ] Task 3: Write automated test suite `frontend/test/landing_page_astryx.test.mjs` and execute quality gates (`npm run lint`, `npx tsc -b`, `npm test`, `npm run build`).

### Checkpoint: Complete
- [ ] All acceptance criteria met, 0 TypeScript errors, 100% tests passing, clean production build.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Third-party icon leakage | High | Ensure no `@heroicons` imports; use Astryx native `Icon` with `icon="chevronRight"` |
| Broken tests from marquee removal | Low | New test suite targets static gallery grid elements directly |
