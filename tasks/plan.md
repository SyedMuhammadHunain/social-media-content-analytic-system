# Implementation Plan: Cloud Persistence, Auth Modernization & Astryx Skeletons (SPEC-cloud-persistence-and-auth)

## Overview
Enable multi-session cloud & local persistence across logins/logouts for profiles (avatar, banner, bio) in MongoDB Atlas and media in Azure Blob Storage; modernize auth logo with user asset; add form validations using Astryx `TextInput` status; and integrate Astryx `Skeleton` loaders for profile loading states.

## Architecture Decisions
1. **Logo Asset Placement:** Copy `/home/prx/Downloads/attachment_159073897-removebg-preview.png` to `frontend/public/auth-brand-logo.png` so Vite serves it statically with no background.
2. **Astryx Form Validation:** Use native `status={{ type: 'error', message }}` on Astryx `TextInput` with `statusVariant="detached"` for accessible, inline validation.
3. **Multi-Tier Profile Persistence:**
   - Primary: Reactive MongoDB Atlas via backend gateway endpoint `PUT /v1/auth/profile`.
   - Secondary: Client-side `localStorage` cache (`social_auth_user_v1`) for immediate instant rehydration on app launch and offline fallback.
4. **Astryx Skeleton Loaders:** Use `@astryxdesign/core/Skeleton` for profile cover, avatar, and post list placeholders during user transitions.

## Task List

### Phase 1: Auth Logo & Form Validation
- [ ] Task 1: Auth Logo Asset & Card Modernization
- [ ] Task 2: SignUp & Login Input Form Validations

### Checkpoint: Auth Modernization
- [ ] `npx tsc -b` clean
- [ ] Logo displays in login and signup views
- [ ] Invalid inputs trigger inline Astryx error statuses

### Phase 2: Cloud Persistence & Astryx Skeletons
- [ ] Task 3: Backend Profile Persistence & API Integration
- [ ] Task 4: Astryx Profile Skeleton Loaders

### Checkpoint: Complete
- [ ] Task 5: Automated Verification Suite & Quality Gates
- [ ] All unit tests pass
- [ ] Production build succeeds

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Gateway offline during profile update | Low | Catch network errors and keep optimistic updates in `localStorage` so offline work isn't lost |
| Image/video URLs expiring | Low | `mediaBlobStore` fallback rehydrates stored binary blobs locally if remote CDN/SAS is unavailable |

## Open Questions
None.
