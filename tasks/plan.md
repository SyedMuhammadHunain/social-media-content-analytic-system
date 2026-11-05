# Implementation Plan: CodeScene Code Health 10/10 & Hotspots Simplification

Spec: `docs/specs/SPEC-codescene-code-health-refactor-2.md`

## Overview
Decompose all 10 identified bloated/complex frontend hotspot files into high-cohesion, single-responsibility submodules to achieve a 10.0 / 10.0 Code Health score with 0 hotspot alerts, while strictly preserving runtime behavior, Meta Astryx design tokens, and passing all unit tests.

## Architecture Decisions
1. **Context Extraction Pattern:** Separate storage synchronization, external gateway/OAuth handshakes, and computation logic into pure helper modules, keeping Context components as lightweight coordinators (~80–120 lines).
2. **Component Decomposition Pattern:** Decompose large form modals and cards into focused subcomponents (e.g. form fields, media dropzone, picker popovers, account list items).
3. **Strict Behavioral & API Invariance:** Retain all existing exports and interfaces unchanged so no consuming components or unit tests require breaking changes.
4. **Iterative Verification:** Execute `npx tsc -b` and `npm run test:unit` after every slice to guarantee zero regressions.

## Task List

### Phase 1: State & Context Tier
- [ ] Task 1: `client.ts` Token & HTTP Dispatcher Decomposition
- [ ] Task 2: `AuthContext.tsx` Multi-Account, Google OAuth & Storage Decomposition
- [ ] Task 3: `AnalyticsContext.tsx` Telemetry Aggregation & Store Decomposition

### Checkpoint: Contexts & API
- [ ] Context and API files reduced below 150 lines.
- [ ] All 97 unit tests pass, `tsc -b` clean.

### Phase 2: Navigation & Notifications Tier
- [ ] Task 4: `useNotificationPolling.ts` Generator & Cache Decomposition

### Checkpoint: Navigation & Notifications
- [ ] Polling hook reduced below 100 lines.
- [ ] Notifications tests pass without regression.

### Phase 3: Feed, Composer & Toolbar Tier
- [ ] Task 5: `PostCard.tsx` & `PostCreateModal.tsx` Form & Dropzone Decomposition
- [ ] Task 6: `PostMediaToolbar.tsx` Popover & Upload Decomposition

### Checkpoint: Feed & Composer
- [ ] Post card, modal, and toolbar files reduced below 120 lines.
- [ ] Composer and feed tests pass cleanly.

### Phase 4: Auth & Modal Tier
- [ ] Task 7: `GoogleOAuthModal.tsx` Account List & Custom Form Decomposition
- [ ] Task 8: `RegisterForm.tsx` & `login-card/page.tsx` Card & Header Decomposition
- [ ] Task 9: Verification Suite & Quality Gates (`codescene_code_health_refactor.test.mjs`)

### Checkpoint: Complete
- [ ] All 10 files under 150 lines.
- [ ] CodeScene Code Health 10.0 / 10.0, all unit tests passing, build succeeds.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Circular imports between extracted context helpers | Medium | Extract pure functions and types into standalone utility files with no upward dependency on React Context. |
| React Context value object reference churning | Low | Wrap extracted handler methods in `useCallback` and memoize context values with `useMemo`. |
| Prop drilling in decomposed modals | Low | Pass cohesive handler bundles or keep modal state in the local parent coordinator. |
