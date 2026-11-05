# Active Tasks: Profile Media Sync, Azure Storage, Google Auth, and Video (SPEC-profile-media-azure-and-google-auth)

Spec: `docs/specs/SPEC-profile-media-azure-and-google-auth.md`
Plan: `tasks/plan.md`

## Phase 1: UI Sync & Video Repair

- [x] Task 1: Profile UI Dual-State Synchronization
  - Acceptance: In `NewsFeedPage.tsx`, updating avatar or banner updates both `user` and `viewedUser` when viewing own profile. Navigating to profile refreshes view with current `user` assets. Both sidebar card and header banner show updated images immediately.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/feed/NewsFeedPage.tsx`
  - Files: `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: S

- [ ] Task 2: Native Video Playback Stream Repair
  - Acceptance: Replace revoked `BigBuckBunny.mp4` URL in `socialSeedData.ts` with working public MP4 stream. In `PostMediaViewer.tsx`, ensure `<video>` includes `playsInline`, `controls`, and error handling without crashing on XML/codec errors.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/mock/socialSeedData.ts src/app/feed/PostMediaViewer.tsx`
  - Files: `frontend/src/mock/socialSeedData.ts`, `frontend/src/app/feed/PostMediaViewer.tsx`
  - Scope: S

### Checkpoint: UI & Video
- [ ] Avatar/banner changes immediately update left sidebar and main header simultaneously.
- [ ] Video post in feed loads and plays without Google Cloud AccessDenied XML error.

## Phase 2: Azure Blob Storage & Cloud Persistence

- [ ] Task 3: Azure Blob Storage Upload in Profile Header Banner
  - Acceptance: `ProfileHeaderBanner.tsx` uses `mediaApi.getPresignedUploadUrl` and `mediaApi.uploadBlob` to upload avatar and banner images to Azure Blob Storage BlockBlobs. Displays loading state while uploading, and gracefully falls back to local blob URL if offline.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/components/profile/ProfileHeaderBanner.tsx`
  - Files: `frontend/src/components/profile/ProfileHeaderBanner.tsx`
  - Scope: S

- [ ] Task 4: Banner & Bio Persistence in Auth Response
  - Acceptance: `AuthResponse.java` has `coverBannerUrl` and `bio`. `GatewayAuthService.java` populates them from `User` entity. `authApi.ts` and `AuthContext.tsx` store `coverBannerUrl` in `currentUser` and `localStorage`, restoring it after logout and login.
  - Verify: `cd frontend && npx tsc -b`
  - Files: `backend/common-models/src/main/java/com/social/common/dto/AuthResponse.java`, `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`, `frontend/src/api/authApi.ts`, `frontend/src/context/AuthContext.tsx`
  - Scope: M

### Checkpoint: Azure & Persistence
- [ ] Banner and avatar upload to Azure Blob Storage SAS endpoints.
- [ ] Cover banner survives logout and re-login.

## Phase 3: Google OAuth Re-Login & Test Verification

- [ ] Task 5: Deterministic Google OAuth Re-Login Flow
  - Acceptance: In `AuthContext.tsx`, `loginWithGoogle` uses deterministic email-keyed authentication credentials. In `GatewayAuthService.java`, users registered with `authProvider == 'GOOGLE'` or matching credentials authenticate on re-login without `401` or duplicate email rejection. `GoogleOAuthModal.tsx` passes stable credentials.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/context/AuthContext.tsx`, `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`, `frontend/src/app/login-card/GoogleOAuthModal.tsx`
  - Scope: M

- [ ] Task 6: Automated Test Suite & Quality Gates
  - Acceptance: `frontend/test/profile_media_and_google_auth.test.mjs` verifies dual-state update, Azure upload pipeline, banner persistence after re-login, repeat Google auth, and valid video URLs. `npm run test:unit`, `npx tsc -b`, `npx oxlint .`, and `npm run build` pass.
  - Verify: `cd frontend && npm run test:unit && npm run build`
  - Files: `frontend/test/profile_media_and_google_auth.test.mjs`, `frontend/package.json`
  - Scope: S

### Checkpoint: Complete
- [ ] All 6 tasks completed and all verification checks green.
