# SPEC-profile-media-azure-and-google-auth: Profile Media Synchronization, Azure Storage, Google Re-Login, and Video Playback

## Objective
Deliver robust profile asset management, cloud persistence, seamless Google OAuth re-login, and native video playback:
1. **Profile UI State Synchronization:** Ensure updating avatar or cover banner immediately updates both the Left Side Card (`UserProfileCard`) and the main Profile Header Banner (`ProfileHeaderBanner` / `UserProfileView`).
2. **Persistent Cover Banner & Azure Blob Storage:** Upload profile avatar and cover banner images to Azure Blob Storage via presigned SAS URLs (`mediaApi.uploadBlob`), persist `coverBannerUrl` and `avatarUrl` in MongoDB Atlas `UsersDB`, and return `coverBannerUrl` / `bio` in `AuthResponse` so banners survive logout and re-login.
3. **Google OAuth Re-Login:** Ensure users who sign up or log in via "Continue with Google" can log back in with the same Google credentials without hitting `401 Invalid username or password` or `Email already exists`.
4. **HTML5 Native Video Playback:** Replace dead/permission-denied sample video sources (`storage.googleapis.com/.../BigBuckBunny.mp4` returning XML `AccessDenied`) with working, reliable browser-playable MP4/WebM video streams and fallback players.

## Tech Stack
- **Frontend:** React 19, TypeScript 5.8, Vite 8, Meta Astryx (`@astryxdesign/core`)
- **Backend:** Java 21, Spring Boot 3.3, Spring WebFlux (Reactive), MongoDB Atlas NoSQL
- **Storage:** Microsoft Azure Blob Storage (BlockBlobs via SAS pre-signed upload URLs)
- **Testing:** Node.js native test runner (`node:test`, `node:assert`), React unit testing

## Commands
```bash
# Frontend typecheck
cd frontend && npx tsc -b

# Frontend lint
cd frontend && npx oxlint .

# Frontend unit & integration tests
cd frontend && npm run test:unit

# Frontend production build
cd frontend && npm run build
```

## Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   ├── authApi.ts                 # Auth client contracts (includes coverBannerUrl, bio)
│   │   ├── googleOAuth.ts             # Google OAuth token & profile helper
│   │   └── mediaApi.ts                # Azure Blob Storage presign & PUT BlockBlob client
│   ├── app/
│   │   ├── feed/
│   │   │   ├── NewsFeedPage.tsx       # State management for user, viewedUser, and activeProfile
│   │   │   └── PostMediaViewer.tsx    # Native video and image rendering with format fallbacks
│   │   └── login-card/
│   │       ├── page.tsx               # Login/Signup flow and Google trigger
│   │       └── GoogleOAuthModal.tsx   # Google account selector with deterministic IDs
│   ├── components/
│   │   └── profile/
│   │       ├── ProfileHeaderBanner.tsx# Avatar and Banner upload triggers with Azure upload
│   │       └── UserProfileView.tsx    # Main profile view passing updated state
│   ├── context/
│   │   └── AuthContext.tsx            # Multi-session state, deterministic Google auth, coverBannerUrl
│   └── mock/
│       └── socialSeedData.ts          # Replace revoked GCS video URLs with working MP4s
backend/
├── common-models/src/main/java/com/social/common/dto/
│   └── AuthResponse.java              # Add coverBannerUrl and bio fields
└── api-gateway/src/main/java/com/social/gateway/
    ├── controller/AuthController.java
    └── service/GatewayAuthService.java # Google OAuth provider login bypass & profile response enrichment
```

## Code Style
```tsx
// Example: Azure Blob Storage Upload & Instant Dual-State Sync
const handleBannerUpload = async (file: File) => {
  setIsUploading(true);
  try {
    const presign = await mediaApi.getPresignedUploadUrl({
      userId: user.id,
      fileName: file.name,
      contentType: file.type || 'image/jpeg',
    });
    await mediaApi.uploadBlob(presign.uploadUrl, file, file.type || 'image/jpeg');
    const cloudUrl = presign.publicBlobUrl;
    onUpdateBanner?.(cloudUrl);
  } catch {
    // Local memory URL fallback if offline
    const localUrl = URL.createObjectURL(file);
    onUpdateBanner?.(localUrl);
  } finally {
    setIsUploading(false);
  }
};
```

## Testing Strategy
- Unit tests in `frontend/test/profile_media_and_google_auth.test.mjs` verifying:
  1. `activeProfile` updates immediately when avatar or banner changes in `NewsFeedPage`.
  2. `loginWithGoogle` successfully re-authenticates an existing Google account without throwing duplicate email or invalid password error.
  3. `coverBannerUrl` is correctly retained across simulated logout and re-login cycles.
  4. Video feed components render valid accessible MP4 video sources without Google Cloud XML AccessDenied errors.

## Boundaries
- **Always:** Use Meta Astryx design tokens (`@astryxdesign/core`); maintain TypeScript strict checks; support offline/mock fallback if Azure presign is unreachable.
- **Ask First:** Modifying external authentication provider client IDs or altering MongoDB schema field names.
- **Never:** Suppress compiler warnings with `@ts-ignore`; bypass CORS or token validations unsafely; hardcode cloud secrets in frontend.

## Success Criteria
1. Changing avatar or banner updates both the left card and the main profile header synchronously.
2. Banner persists in `localStorage` and backend `UsersDB`, surviving logout and re-login.
3. Users who sign in with "Continue with Google" can log out and log in again with the same credentials seamlessly.
4. Video posts in the feed load and play standard browser-supported MP4/WebM streams without decoding errors or XML `AccessDenied`.
5. `npx tsc -b`, `npm run test:unit`, and `npm run build` pass cleanly.

## Open Questions
- None. All 5 issues have identified root causes and verified solutions.
