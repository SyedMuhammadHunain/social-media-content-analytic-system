# Spec: Cloud Persistence, Auth Modernization & Astryx Skeletons (SPEC-cloud-persistence-and-auth)

## Objective
Ensure complete multi-session cloud & local persistence across logins, logouts, and user switches:
1. **User Profile Persistence:** Avatar, cover banner, and bio updates persist to MongoDB Atlas collection `UsersDB` via backend `PUT /v1/auth/profile` and survive browser refreshes, logouts, and account switches.
2. **Media Storage Integration:** Image and video post uploads persist to Microsoft Azure Blob Storage via presigned SAS upload (`PUT /v1/media/presign` and Azure BlockBlob PUT), saving Azure blob URLs in MongoDB collection `PostsDB` with fallback to `mediaBlobStore` in LocalStorage.
3. **Astryx Skeleton Loaders:** Use `@astryxdesign/core/Skeleton` to render skeleton loading placeholders during data fetching, feed syncs, and profile transitions.
4. **Auth Card Logo Modernization:** Replace auth card logo with the user-specified logo asset `attachment_159073897-removebg-preview.png` copied to `frontend/public/auth-brand-logo.png`.
5. **Form Validations:** Implement client-side input validations on SignUp and Login forms (required field checks, RFC 5322 email regex, minimum 8 characters password) using Meta Astryx `TextInput` status indicators (`status={{ type: 'error', message }}`).
6. **Appearance Preferences:** Persist dark/light theme preference dynamically in `localStorage`.

## Tech Stack
- Frontend: React 19, TypeScript 5.8, Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`), Vite 8
- Backend Services: Spring Boot 3.3.4, Java 21, Spring Data Reactive MongoDB
- Databases & Cloud Storage: MongoDB Atlas (collections: `UsersDB`, `PostsDB`, `InteractionsDB`), Azure Blob Storage (container: `media`)
- Testing: Node.js native test runner (`node:test`, `node:assert`), Chrome DevTools Protocol (CDP)

## Commands
```bash
# Typecheck
cd frontend && npx tsc -b

# Lint
cd frontend && npx oxlint .

# Unit test suite
cd frontend && npm run test:unit

# Production build
cd frontend && npm run build

# Start dev server
cd frontend && npm run dev
```

## Project Structure
```
frontend/public/
└── auth-brand-logo.png                                # Copied from ~/Downloads/attachment_159073897-removebg-preview.png

frontend/src/
├── api/
│   ├── authApi.ts                                     # Add updateProfile API client method
│   └── mediaApi.ts                                    # Azure Blob presign & upload methods
├── app/
│   ├── login-card/
│   │   └── page.tsx                                   # Modernize logo, add Astryx TextInput validation
│   └── feed/
│       ├── FeedSkeleton.tsx                           # Feed skeleton loaders
│       └── NewsFeedPage.tsx                           # Connect profile updates to authApi.updateProfile
├── components/
│   └── profile/
│       ├── ProfileSkeleton.tsx                        # New: Astryx skeleton loader for profile header & posts
│       └── UserProfileView.tsx                        # Integrate ProfileSkeleton during loading states
└── context/
    ├── AuthContext.tsx                                # Persist updateUser to backend PUT /v1/auth/profile
    └── useAuth.ts
```

## Code Style
```tsx
// Astryx TextInput with built-in validation status
<TextInput
  label="Email Address"
  type="email"
  value={email}
  onChange={(val) => {
    setEmail(val);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  }}
  status={errors.email ? { type: 'error', message: errors.email } : undefined}
  statusVariant="detached"
  size="lg"
/>
```

## Testing Strategy
- **Framework:** Node.js native test runner (`node:test`, `node:assert`)
- **Test File:** `frontend/test/cloud_persistence_and_auth.test.mjs`
- **Coverage:**
  1. Auth logo renders `auth-brand-logo.png` on both login and signup modes.
  2. SignUp validation rejects empty username, invalid email format, and password shorter than 8 characters.
  3. Login validation rejects empty email and password.
  4. Profile update dispatches `PUT /v1/auth/profile` and updates MongoDB user state with offline LocalStorage fallback.
  5. Azure Blob Storage upload integration preserves object URLs in posts.
  6. `ProfileSkeleton` renders Astryx `Skeleton` bars while profile data is loading.

## Boundaries
- **Always:** Use strictly Meta Astryx components and theme tokens (`var(--color-...)`). Run `npx tsc -b`, `npx oxlint .`, and unit tests.
- **Ask first:** Modifying backend MongoDB schema or dropping database collections.
- **Never:** Use ad-hoc CSS or third-party UI libraries like Bootstrap/Tailwind. Never break existing 85 unit tests.

## Success Criteria
1. Logo asset copied from `/home/prx/Downloads/attachment_159073897-removebg-preview.png` to `frontend/public/auth-brand-logo.png` and rendered cleanly in `frontend/src/app/login-card/page.tsx`.
2. Input validations show detached error messages on SignUp and Login when constraints fail.
3. Profile updates (bio, avatar, banner) call `authApi.updateProfile` and save to MongoDB Atlas `UsersDB` via `PUT /v1/auth/profile`, persisting across logout/login.
4. Media upload to Azure Blob Storage continues functioning via presigned URL with binary blob persistence.
5. Profile and feed display Astryx `Skeleton` components during loading states.
6. All unit tests pass, `npx tsc -b` clean, `npx oxlint .` clean, production bundle builds cleanly.

## Open Questions
None.
