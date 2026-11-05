# Implementation Plan: Profile Media Synchronization, Azure Storage, Google Re-Login, and Video Playback

Spec: `docs/specs/SPEC-profile-media-azure-and-google-auth.md`

## Overview
Resolve profile asset state desynchronization, enable direct Azure Blob Storage uploads for banners and avatars, ensure cover banner persistence across login/logout cycles, fix repeat Google OAuth authentication, and repair broken feed video playback.

## Architecture Decisions
1. **Synchronous Dual-State Sync:** `NewsFeedPage` maintains `user` and `viewedUser`. When `isOwnProfile` is true, changes to avatar, banner, or bio will atomically update both `user` and `viewedUser`, and `activeProfile` will reflect the current user's updated assets.
2. **Azure Presigned Upload Pipeline:** `ProfileHeaderBanner` invokes `mediaApi.getPresignedUploadUrl` and `mediaApi.uploadBlob` (using Azure SAS BlockBlob PUT) to upload files directly to Azure Blob Storage, before calling `updateUser` to store the public blob URL in MongoDB `UsersDB`.
3. **Cover Banner in Auth DTO:** Update `AuthResponse` in backend and frontend to include `coverBannerUrl` and `bio`, ensuring full profile state is rehydrated upon re-login.
4. **Deterministic Google Auth Protocol:** Use deterministic credentials keyed to user email so that repeat Google logins match the stored `passwordHash` or are identified as `authProvider == 'GOOGLE'` in `GatewayAuthService`.
5. **Standard HTML5 Video Stream:** Replace the dead GCS `BigBuckBunny.mp4` link (which returns `403 AccessDenied` XML) with an open-source, reliably accessible MP4 video URL, with fallback decoding handling in `PostMediaViewer`.

## Task List

### Phase 1: UI Sync & Video Repair
- [ ] Task 1: Profile UI Dual-State Synchronization (`NewsFeedPage.tsx`)
- [ ] Task 2: Native Video Playback Stream Repair (`socialSeedData.ts` & `PostMediaViewer.tsx`)

### Checkpoint: UI & Video
- [ ] Avatar and banner update both sidebar and header simultaneously.
- [ ] Feed videos play natively without XML AccessDenied or decoder errors.

### Phase 2: Azure Blob Storage & Cloud Persistence
- [ ] Task 3: Azure Blob Storage Upload in Profile Header Banner (`ProfileHeaderBanner.tsx`)
- [ ] Task 4: Banner & Bio Persistence in Auth Response (`AuthResponse.java`, `GatewayAuthService.java`, `AuthContext.tsx`, `authApi.ts`)

### Checkpoint: Azure & Persistence
- [ ] Banner uploads upload to Azure Blob Storage.
- [ ] Banner remains visible after logout and re-login.

### Phase 3: Google OAuth Re-Login & Test Verification
- [ ] Task 5: Deterministic Google OAuth Re-Login Flow (`AuthContext.tsx`, `GatewayAuthService.java`, `GoogleOAuthModal.tsx`)
- [ ] Task 6: Automated Test Suite & Quality Gates (`profile_media_and_google_auth.test.mjs`)

### Checkpoint: Complete
- [ ] Unit tests pass, TypeScript compiler clean, build succeeds.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Azure Blob Storage SAS endpoint unreachable or unconfigured offline | Medium | Fall back gracefully to `URL.createObjectURL(file)` in dev/offline mode so the user is never blocked. |
| Existing MongoDB user records with null `coverBannerUrl` | Low | Handle null checks and fall back to gradient header seamlessly. |
| Video CORS restrictions across browsers | Medium | Use open-source CORS-enabled CDN MP4 streams and HTML5 `crossOrigin="anonymous"`. |

## Open Questions
- None.
