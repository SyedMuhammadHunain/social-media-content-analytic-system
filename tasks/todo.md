# Active Tasks: CodeScene Code Health 10/10 Refactoring (SPEC-codescene-code-health-refactor-2)

Spec: `docs/specs/SPEC-codescene-code-health-refactor-2.md`
Plan: `tasks/plan.md`

## Phase 1: State & Context Tier

- [x] Task 1: `client.ts` Token & HTTP Dispatcher Decomposition
  - Acceptance: Extract `tokenManager.ts` from `client.ts` for auth token storage, headers, and subscribers. Reduce `client.ts` to ~70 lines. Maintain all existing method exports (`api`, `setAuthToken`, `getAuthToken`, `clearAuthToken`, `ApiResponse`, `ApiError`).
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/api/client.ts`
  - Files: `frontend/src/api/tokenManager.ts`, `frontend/src/api/client.ts`
  - Scope: S

- [x] Task 2: `AuthContext.tsx` Multi-Account, Google OAuth & Storage Decomposition
  - Acceptance: Extract `authAccountStorage.ts`, `authGoogleHandler.ts`, and `authProfileSync.ts`. Reduce `AuthContext.tsx` from 713 lines to ~130 lines. Maintain all `useAuth()` interface functions and behavior.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/context/AuthContext.tsx`
  - Files: `frontend/src/context/authAccountStorage.ts`, `frontend/src/context/authGoogleHandler.ts`, `frontend/src/context/authProfileSync.ts`, `frontend/src/context/AuthContext.tsx`
  - Scope: M

- [x] Task 3: `AnalyticsContext.tsx` Telemetry Aggregation & Store Decomposition
  - Acceptance: Extract `analyticsAggregation.ts` and `analyticsSeedStore.ts` for metrics math, real-time recalculations, and localStorage syncing. Reduce `AnalyticsContext.tsx` from 495 lines to ~110 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/context/AnalyticsContext.tsx`
  - Files: `frontend/src/context/analyticsAggregation.ts`, `frontend/src/context/analyticsSeedStore.ts`, `frontend/src/context/AnalyticsContext.tsx`
  - Scope: M

### Checkpoint: Contexts & API
- [x] Context and API files reduced below 150 lines.
- [x] All 97 unit tests pass, `tsc -b` clean.

## Phase 2: Navigation & Notifications Tier

- [x] Task 4: `useNotificationPolling.ts` Generator & Cache Decomposition
  - Acceptance: Extract `notificationGenerator.ts` and `notificationStorage.ts` for actor matching, synthetic notification logic, and localStorage state. Reduce `useNotificationPolling.ts` from 420 lines to ~90 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/components/nav/useNotificationPolling.ts`
  - Files: `frontend/src/components/nav/notificationGenerator.ts`, `frontend/src/components/nav/notificationStorage.ts`, `frontend/src/components/nav/useNotificationPolling.ts`
  - Scope: S

### Checkpoint: Navigation & Notifications
- [x] Polling hook reduced below 100 lines.
- [x] Notifications tests pass without regression.

## Phase 3: Feed, Composer & Toolbar Tier

- [ ] Task 5: `PostCard.tsx` & `PostCreateModal.tsx` Form & Dropzone Decomposition
  - Acceptance: Extract `PostCardContent.tsx` from `PostCard.tsx` (<120 lines). Extract `PostComposerForm.tsx` and `PostMediaDropzone.tsx` from `PostCreateModal.tsx` (<100 lines).
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/feed/`
  - Files: `frontend/src/app/feed/PostCardContent.tsx`, `frontend/src/app/feed/PostCard.tsx`, `frontend/src/app/feed/PostComposerForm.tsx`, `frontend/src/app/feed/PostMediaDropzone.tsx`, `frontend/src/app/feed/PostCreateModal.tsx`
  - Scope: M

- [ ] Task 6: `PostMediaToolbar.tsx` Popover & Upload Decomposition
  - Acceptance: Extract `MediaPickerPopovers.tsx` and `MediaUploadAction.tsx`. Reduce `PostMediaToolbar.tsx` from 310 lines to ~80 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/feed/PostMediaToolbar.tsx`
  - Files: `frontend/src/app/feed/MediaPickerPopovers.tsx`, `frontend/src/app/feed/MediaUploadAction.tsx`, `frontend/src/app/feed/PostMediaToolbar.tsx`
  - Scope: S

### Checkpoint: Feed & Composer
- [ ] Post card, modal, and toolbar files reduced below 120 lines.
- [ ] Composer and feed tests pass cleanly.

## Phase 4: Auth & Modal Tier

- [ ] Task 7: `GoogleOAuthModal.tsx` Account List & Custom Form Decomposition
  - Acceptance: Extract `GoogleAccountList.tsx` and `GoogleCustomAccountForm.tsx`. Reduce `GoogleOAuthModal.tsx` from 399 lines to ~90 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/login-card/GoogleOAuthModal.tsx`
  - Files: `frontend/src/app/login-card/GoogleAccountList.tsx`, `frontend/src/app/login-card/GoogleCustomAccountForm.tsx`, `frontend/src/app/login-card/GoogleOAuthModal.tsx`
  - Scope: S

- [ ] Task 8: `RegisterForm.tsx` & `login-card/page.tsx` Card & Header Decomposition
  - Acceptance: Extract `RegisterInputFields.tsx` from `RegisterForm.tsx` (<90 lines). Extract `AuthCardHeader.tsx` from `login-card/page.tsx` (<120 lines).
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/auth/RegisterForm.tsx src/app/login-card/page.tsx`
  - Files: `frontend/src/app/auth/RegisterInputFields.tsx`, `frontend/src/app/auth/RegisterForm.tsx`, `frontend/src/app/login-card/AuthCardHeader.tsx`, `frontend/src/app/login-card/page.tsx`
  - Scope: S

- [ ] Task 9: Verification Suite & Quality Gates
  - Acceptance: Add `frontend/test/codescene_code_health_refactor.test.mjs` verifying file size constraints and modular imports. Run `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build`.
  - Verify: `cd frontend && npm run test:unit && npm run build`
  - Files: `frontend/test/codescene_code_health_refactor.test.mjs`, `frontend/package.json`
  - Scope: S

### Checkpoint: Complete
- [ ] All 10 files under 150 lines.
- [ ] CodeScene Code Health 10.0 / 10.0, all unit tests passing, build succeeds.
