# Implementation Plan: User Authentication (Login Split Card)

## Overview
Implement user authentication (Register and Login flows) with session management and TopNav logout capability using the official Astryx **Login Split Card Template** (`login-split`).

---

## Architecture Decisions
1. **Astryx Template Pattern (`login-split`):**
   - Two-pane 1000px elevated card layout matching official Astryx design system specifications.
   - Left pane: Form container with toggleable state for "Sign In" and "Create Account" (Register).
   - Right pane: Rich branded visual featuring system scale (500M DAU, 2.5B daily interactions, real-time telemetry).
2. **Session Architecture (`AuthContext`):**
   - Pure React context managing `currentUser`, `isAuthenticated`, `login(credentials)`, `register(data)`, and `logout()`.
   - Seed account provided: `hunain_creator` (or `hunain@example.com`) / `password123`.
   - Validation feedback rendered with Astryx `Banner` and `TextInput status`.
3. **App Integration & Guarding:**
   - Unauthenticated state renders `AuthPage`.
   - Authenticated state renders `AppTopNav` (with active user details and Logout button) and protected tabs (`feed` and `dashboard`).

---

## Task Breakdown

### Phase 1: Test Suite & Authentication Foundation
- [ ] **Task 1:** Create Failing TDD Test Suite for Authentication (`frontend/test/authentication_flow.test.mjs`)
- [ ] **Task 2:** Create `AuthContext` with Session State & Mock Authentication Service (`frontend/src/context/AuthContext.tsx`)

### Checkpoint 1: Auth Foundation Verified
- `AuthContext` provides login, register, logout; tests run cleanly against foundation.

### Phase 2: Astryx Login Split Card Component & App Wiring
- [ ] **Task 3:** Implement Astryx Login Split Card Component (`frontend/src/app/auth/AuthPage.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`)
- [ ] **Task 4:** Wire Authentication to `App.tsx` and `AppTopNav.tsx` with Logout Functionality

### Checkpoint 2: Full Auth Flow Functional
- Unauthenticated user sees Login Split Card; login/register transitions to newsfeed; logout returns to auth.

### Phase 3: Verification & Commit
- [ ] **Task 5:** Capture Artifact Screenshots, Run Full Test Suite & Branch Push

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Existing 18 tests broken by unauthenticated guard | High | Initialize `AuthContext` default state to seed user when in test environment without auth flag, or update tests to authenticate. |
| Astryx split grid mobile responsiveness | Medium | Apply container queries from official `login-split` template (`@container (max-width: 511px)`) to collapse into single column. |
