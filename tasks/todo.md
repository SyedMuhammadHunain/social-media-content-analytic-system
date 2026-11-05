# Active Tasks: Cloud Persistence, Auth Modernization & Astryx Skeletons (SPEC-cloud-persistence-and-auth)

Spec: `docs/specs/SPEC-cloud-persistence-and-auth.md`
Plan: `tasks/plan.md`

## Phase 1: Auth Logo & Form Validation

- [x] Task 1: Auth Logo Asset & Card Modernization
  - Acceptance: Asset `/home/prx/Downloads/attachment_159073897-removebg-preview.png` copied to `frontend/public/auth-brand-logo.png`. `LoginCardPage.tsx` renders `/auth-brand-logo.png` with clean dimensions and transparent background.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/login-card/page.tsx`
  - Files: `frontend/public/auth-brand-logo.png`, `frontend/src/app/login-card/page.tsx`
  - Scope: S

- [x] Task 2: SignUp & Login Input Form Validations
  - Acceptance: `TextInput` displays inline `status={{ type: 'error', message }}` when:
    1. Email is empty or doesn't match RFC 5322 regex.
    2. Password is empty or under 8 chars on signup.
    3. Username is empty on signup.
    Errors clear on input typing.
  - Verify: `cd frontend && npx tsc -b && npx oxlint src/app/login-card/page.tsx`
  - Files: `frontend/src/app/login-card/page.tsx`
  - Scope: S

### Checkpoint: Auth Modernization
- [x] `npx tsc -b` clean
- [x] Logo displays in login and signup views
- [x] Invalid inputs trigger inline Astryx error statuses

## Phase 2: Cloud Persistence & Astryx Skeletons

- [x] Task 3: Backend Profile Persistence & API Integration
  - Acceptance: `authApi.updateProfile` added to `authApi.ts` calling `PUT /v1/auth/profile`. `AuthContext.updateUser` calls `authApi.updateProfile` and saves to `localStorage` cache. `NewsFeedPage` calls `updateUser` for avatar, banner, and bio updates.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/api/authApi.ts`, `frontend/src/context/AuthContext.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`
  - Scope: M

- [x] Task 4: Astryx Profile Skeleton Loaders
  - Acceptance: `ProfileSkeleton.tsx` created using `@astryxdesign/core/Skeleton` for banner, avatar, bio, and stats placeholders. `UserProfileView.tsx` shows `ProfileSkeleton` during loading.
  - Verify: `cd frontend && npx tsc -b && npx oxlint .`
  - Files: `frontend/src/components/profile/ProfileSkeleton.tsx`, `frontend/src/components/profile/UserProfileView.tsx`
  - Scope: S

### Checkpoint: Complete
- [x] Task 5: Automated Verification Suite & Quality Gates
  - Acceptance: `frontend/test/cloud_persistence_and_auth.test.mjs` verifies auth logo, validation errors, profile update dispatch, and skeleton rendering. `npx tsc -b`, `npx oxlint .`, `npm run test:unit`, and `npm run build` pass.
  - Verify: `cd frontend && npm run test:unit && npm run build`
  - Files: `frontend/test/cloud_persistence_and_auth.test.mjs`, `frontend/package.json`
  - Scope: S
