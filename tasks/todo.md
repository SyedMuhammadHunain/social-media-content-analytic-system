# Task List: User Authentication (Login Split Card)

## Task 1: Create Failing TDD Test Suite for Authentication
**Description:** Implement `frontend/test/authentication_flow.test.mjs` using `node:test` and CDP asserting:
1. Unauthenticated user sees two-pane Login Split Card (`data-testid="auth-split-card"`).
2. Toggling between "Sign In" and "Create Account" switches form fields.
3. Submitting invalid credentials displays an Astryx error banner without crash.
4. Valid login sets session and displays News Feed.
5. Clicking "Log Out" in TopNav terminates session and returns to Login Split Card.
**Acceptance criteria:**
- [x] Test file created and added to test suite.
- [x] Tests run and fail cleanly against current unauthenticated state (RED).
**Verification:**
- [x] Run `cd frontend && node --test test/authentication_flow.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/test/authentication_flow.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Implement AuthContext and Mock Authentication Service
**Description:** Create `frontend/src/context/AuthContext.tsx` providing `currentUser`, `isAuthenticated`, `login`, `register`, and `logout`. Seed valid creator account (`hunain_creator` / `password123`) and maintain session persistence.
**Acceptance criteria:**
- [x] `AuthContext` exports `AuthProvider` and `useAuth` hook.
- [x] `login(emailOrUsername, password)` validates credentials against seed store.
- [x] `register(username, email, password)` creates new user session.
- [x] `logout()` clears session and resets state.
**Verification:**
- [x] Run `cd frontend && npx tsc -b`
- [x] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/mock/authSeedData.ts`
**Estimated scope:** Small (1-2 files)

---

## Checkpoint 1: Foundation Ready
- [x] AuthContext compile-clean and integrated.

---

## Task 3: Build Astryx Login Split Card Component
**Description:** Implement `frontend/src/app/auth/AuthPage.tsx` adhering to the official Astryx **Login Split Card Template** (`login-split`):
- Two-pane 1000px card inside `<Center axis="both">`.
- Left pane: `LoginForm` and `RegisterForm` with `TextInput` (username, email, password), `Button` (submit), `Banner` (errors), and mode toggle link.
- Right pane: Rich branded visual featuring 500M DAU scale, real-time news feed telemetry, and system architecture.
**Acceptance criteria:**
- [ ] Login Split Card rendered with official Astryx components (`Card`, `Grid`, `Center`, `TextInput`, `Button`, `Banner`, `Badge`).
- [ ] Toggle between Sign In and Register switches form view.
- [ ] Form submission calls `login` or `register` from `AuthContext`.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/app/auth/AuthPage.tsx`
- `frontend/src/app/auth/LoginForm.tsx`
- `frontend/src/app/auth/RegisterForm.tsx`
**Estimated scope:** Medium (3 files)

---

## Task 4: Wire Authentication to App & TopNav
**Description:** Update `frontend/src/App.tsx` and `frontend/src/components/nav/AppTopNav.tsx` to wrap app in `AuthProvider`. Show `AuthPage` when unauthenticated. In `AppTopNav`, show current user avatar, name, and "Log Out" action. Clicking "Log Out" returns user to `AuthPage`.
**Acceptance criteria:**
- [ ] App renders `AuthPage` when unauthenticated.
- [ ] App renders protected `NewsFeedPage` or `DashboardTemplate` when authenticated.
- [ ] TopNav displays active user and functional "Log Out" button.
- [ ] Tests 1-5 in `authentication_flow.test.mjs` turn GREEN.
**Verification:**
- [ ] Run `cd frontend && node --test test/authentication_flow.test.mjs`
- [ ] Run `cd frontend && npm test`
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/App.tsx`
- `frontend/src/components/nav/AppTopNav.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 2: Auth Flow Green
- [ ] All authentication tests pass green.

---

## Task 5: Automated Verification, Screenshots, and Branch Push
**Description:** Capture high-resolution screenshot artifacts:
- `auth_login_split_card.png`
- `auth_register_mode.png`
- `auth_error_validation.png`
Run full test suite, lint, and build. Commit and push to `origin/Hunain-Frontend`.
**Acceptance criteria:**
- [ ] All tests in `npm test` pass.
- [ ] `tsc -b`, `oxlint`, `vite build` pass with zero errors.
- [ ] Screenshot artifacts saved in artifact directory.
- [ ] Changes pushed to `origin/Hunain-Frontend`.
**Verification:**
- [ ] Run `cd frontend && npm test && npx tsc -b && npm run lint && npm run build`
- [ ] Run `git status`
**Dependencies:** Task 4
**Files likely touched:** Artifacts, documentation
**Estimated scope:** Small
