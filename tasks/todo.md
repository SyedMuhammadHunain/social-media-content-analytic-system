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

- [x] Task 5: `PostCard.tsx` & `PostCreateModal.tsx` Form & Dropzone Decomposition
  - Acceptance: Extract `PostCardContent.tsx` from `PostCard.tsx` (<120 lines). Extract `PostComposerForm.tsx` and `PostMediaDropzone.tsx` from `PostCreateModal.tsx` (<100 lines).
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/feed/`
  - Files: `frontend/src/app/feed/PostCardContent.tsx`, `frontend/src/app/feed/PostCard.tsx`, `frontend/src/app/feed/PostComposerForm.tsx`, `frontend/src/app/feed/PostMediaDropzone.tsx`, `frontend/src/app/feed/PostCreateModal.tsx`
  - Scope: M

- [x] Task 6: `PostMediaToolbar.tsx` Popover & Upload Decomposition
  - Acceptance: Extract `MediaPickerPopovers.tsx` and `MediaUploadAction.tsx`. Reduce `PostMediaToolbar.tsx` from 310 lines to ~80 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/feed/PostMediaToolbar.tsx`
  - Files: `frontend/src/app/feed/MediaPickerPopovers.tsx`, `frontend/src/app/feed/MediaUploadAction.tsx`, `frontend/src/app/feed/PostMediaToolbar.tsx`
  - Scope: S

### Checkpoint: Feed & Composer
- [x] Post card, modal, and toolbar files reduced below 120 lines.
- [x] Composer and feed tests pass cleanly.

## Phase 4: Auth & Modal Tier

- [x] Task 7: `GoogleOAuthModal.tsx` Account List & Custom Form Decomposition
  - Acceptance: Extract `GoogleAccountList.tsx` and `GoogleCustomAccountForm.tsx`. Reduce `GoogleOAuthModal.tsx` from 399 lines to ~90 lines.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/login-card/GoogleOAuthModal.tsx`
  - Files: `frontend/src/app/login-card/GoogleAccountList.tsx`, `frontend/src/app/login-card/GoogleCustomAccountForm.tsx`, `frontend/src/app/login-card/GoogleOAuthModal.tsx`
  - Scope: S

- [x] Task 8: `RegisterForm.tsx` & `login-card/page.tsx` Card & Header Decomposition
  - Acceptance: Extract `RegisterInputFields.tsx` from `RegisterForm.tsx` (<90 lines). Extract `AuthCardHeader.tsx` from `login-card/page.tsx` (<120 lines).
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/auth/RegisterForm.tsx src/app/login-card/page.tsx`
  - Files: `frontend/src/app/auth/RegisterInputFields.tsx`, `frontend/src/app/auth/RegisterForm.tsx`, `frontend/src/app/login-card/AuthCardHeader.tsx`, `frontend/src/app/login-card/page.tsx`
  - Scope: S

- [x] Task 9: Verification Suite & Quality Gates
  - Acceptance: Add `frontend/test/codescene_code_health_refactor.test.mjs` verifying file size constraints and modular imports. Run `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build`.
  - Verify: `cd frontend && npm run test:unit && npm run build`
  - Files: `frontend/test/codescene_code_health_refactor.test.mjs`, `frontend/package.json`
  - Scope: S

### Checkpoint: Complete
- [x] All 10 hotspot files decomposed cleanly with modular architecture.
- [x] CodeScene Code Health verified, all 104 unit tests passing, production build succeeds.

## Phase 5: Impacted Files Decomposition (Point 2)
- [x] Task 10: `NewsFeedRightSidebar.tsx` -> Extract `SidebarSearchBox.tsx` (Score: 10.00 / 10.00)
- [x] Task 11: `CommentSection.tsx` -> Extract `CommentTreeItem.tsx` and `CommentReplyComposer.tsx` (Score: 10.00 / 10.00)
- [x] Task 12: `PostMediaViewer.tsx` -> Simplify fallback error boundary & sample video fallback (Score: 10.00 / 10.00)
- [x] Task 13: `LoginForm.tsx` -> Extract `LoginInputFields.tsx` and `loginValidation.ts` (Score: 10.00 / 10.00)
- [x] Task 14: `UserProfileCard.tsx` -> Extract `ProfileCardBanner.tsx` and `ProfileCardMetrics.tsx` (Score: 10.00 / 10.00)
- [x] Task 15: `authorUtils.ts` -> Decompose into small pure helpers & remove string heavy args (Score: 10.00 / 10.00)
- [x] Task 16: `useLikeAction.ts` -> Extract notification dispatch & optimistic like helpers (Score: 10.00 / 10.00)
- [x] Task 17: `profileActivityStore.ts` -> Extract local storage persistence & baseline resolution (Score: 10.00 / 10.00)

### Checkpoint: Impacted Files Complete
- [x] All 8 impacted files + 7 extracted modules at CodeScene Code Health 10.00 / 10.00.
- [x] Zero regressions: 104/104 tests passing.

## Phase 6: CodeScene Hotspots 10/10 & Code Health 10/10 Repository-Wide (Point 3)
- [x] Task 18: `dateUtils.ts` & `userSearchIndex.ts` (Score: 10.00 / 10.00)
- [x] Task 19: `DashboardAnalyticsInterpretation.tsx` & `DashboardRecommendationsCard.tsx` (Score: 10.00 / 10.00)
- [x] Task 20: `tokenManager.ts`, `httpPayloadParser.ts`, `client.ts`, `feedApi.ts` (Score: 10.00 / 10.00)
- [x] Task 21: `socialApi.ts` decomposed into `socialLikesApi.ts`, `socialCommentsApi.ts`, `socialFollowsApi.ts` (Score: 10.00 / 10.00)
- [x] Task 22: `googleOAuth.ts` decomposed into `googleIdentityScript.ts`, `googleProfileFetcher.ts`, `googleOAuthLauncher.ts` (Score: 10.00 / 10.00)
- [x] Task 23: `RegisterForm.tsx` decomposed into `useRegisterForm.ts` & `RegisterToggleLink.tsx` (Score: 10.00 / 10.00)
- [x] Task 24: Notification polling decomposed into `notificationGenerator.ts`, `notificationActors.ts`, `notificationActorData.ts`, `notificationFetcher.ts` (Score: 10.00 / 10.00)
- [x] Task 25: Feed modals & components decomposed: `PostModalControls.tsx`, `PostEditFormBody.tsx`, `useFeedState.ts`, `mediaTypeDetection.ts`, `FeedAppearanceSwitcher.tsx`, `FeedEmptyState.tsx` (Score: 10.00 / 10.00)
- [x] Task 26: Post Card decomposed: `PostActionButtons.tsx`, `usePostCommentsToggle.ts`, `postCardBorderUtils.ts` (Score: 10.00 / 10.00)
- [x] Task 27: Feed action hooks: `useCommentAction.ts` and `useFollowAction.ts` decomposed into pure action helpers (Score: 10.00 / 10.00)
- [x] Task 28: `AnalyticsContext.tsx` decomposed: `useAnalyticsState.ts`, `useAnalyticsMutations.ts`, `useAnalyticsRefresh.ts`, `useAnalyticsSync.ts`, `analyticsReducers.ts`, `analyticsAggregation.ts` (Score: 10.00 / 10.00)
- [x] Task 29: Auth context & handlers: `authProfileSync.ts`, `authLoginHandler.ts`, `authRegisterHandler.ts`, `authGoogleHandler.ts`, `useAuthActions.ts`, `AuthContext.tsx` (Score: 10.00 / 10.00)

### Checkpoint: Hotspot 10/10 and Code Health 10/10 Complete
- [x] 128 frontend source files scanned: all 128 files at CodeScene Code Health 10.00 / 10.00 (or N/A for pure re-export index).
- [x] 0 CodeScene warnings repository-wide (`cs check | grep "^warn:"` returns 0).
- [x] 104 / 104 unit tests passing cleanly.
- [x] `tsc -b` typecheck clean, production build succeeds.


