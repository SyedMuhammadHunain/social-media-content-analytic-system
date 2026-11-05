# Specification: CodeScene Code Health 10/10 & Comprehensive Hotspots Simplification

**Document ID:** `SPEC-codescene-code-health-refactor-2`  
**Status:** DRAFT (Awaiting Human Approval)  
**Author:** Antigravity Pairing Agent  
**Date:** November 5, 2026  

---

## 1. Objective
Eliminate all architectural hotspot warnings and bring all 10 identified bloated/complex frontend files to **10.0 / 10.0 Code Health** in CodeScene:
1. `frontend/src/context/AuthContext.tsx` (713 lines)
2. `frontend/src/context/AnalyticsContext.tsx` (495 lines)
3. `frontend/src/api/client.ts` (186 lines)
4. `frontend/src/components/nav/useNotificationPolling.ts` (420 lines)
5. `frontend/src/app/feed/PostCard.tsx` (193 lines)
6. `frontend/src/app/feed/PostCreateModal.tsx` (382 lines)
7. `frontend/src/app/feed/PostMediaToolbar.tsx` (310 lines)
8. `frontend/src/app/login-card/GoogleOAuthModal.tsx` (399 lines)
9. `frontend/src/app/auth/RegisterForm.tsx` (232 lines)
10. `frontend/src/app/login-card/page.tsx` (387 lines)

All simplifications must preserve exact runtime behavior, retain Meta Astryx design tokens, and pass all 97 existing unit tests with zero regressions.

---

## 2. Tech Stack & Dependencies
- **Framework:** React 19 (`react`, `react-dom`), TypeScript 5.8, Vite 8
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- **Code Quality & Analysis:** CodeScene CLI (`cs`), OxLint (`oxlint`), TypeScript compiler (`tsc -b`)
- **Test Framework:** Node.js native test runner (`node:test`, `node:assert/strict`)

---

## 3. Commands
```bash
# Verify TypeScript types
cd frontend && npx tsc -b

# Verify fast linting
cd frontend && npx oxlint .

# Run full unit test suite (97 tests)
cd frontend && npm run test:unit

# Production client bundle
cd frontend && npm run build
```

---

## 4. Project Structure & Modular Decomposition Plan

### Phase 1: State & Context Tier
- `frontend/src/context/`
  - `authAccountStorage.ts`: Multi-account and token localStorage serialization
  - `authGoogleHandler.ts`: Google OAuth authentication, profile derivation, and fallback
  - `authProfileSync.ts`: MongoDB Atlas backend profile updates and demo users sync
  - `AuthContext.tsx`: Reduced to slim context provider (~120 lines)
  - `analyticsAggregation.ts`: Telemetry calculation (sentiment, growth, engagement velocity)
  - `analyticsSeedStore.ts`: Analytics localStorage persistence and seed rehydration
  - `AnalyticsContext.tsx`: Reduced to slim provider (~110 lines)
- `frontend/src/api/`
  - `tokenManager.ts`: Centralized JWT/token lifecycle management
  - `client.ts`: Clean HTTP request dispatcher and envelope unwrapper (~80 lines)

### Phase 2: Navigation & Notification Tier
- `frontend/src/components/nav/`
  - `notificationGenerator.ts`: Dynamic actor assignment and synthetic notification creator
  - `notificationStorage.ts`: Local notification cache and mark-as-read dispatcher
  - `useNotificationPolling.ts`: Polling loop and state consumer hook (~90 lines)

### Phase 3: Feed, Composer & Card Tier
- `frontend/src/app/feed/`
  - `PostCard.tsx`: Simplified orchestrator (~100 lines) delegating to `PostCardContent.tsx`
  - `PostComposerForm.tsx`: Text area, character counter, hashtag chips
  - `PostMediaDropzone.tsx`: Drag-and-drop media preview and Azure SAS upload trigger
  - `PostCreateModal.tsx`: Slim modal container (~80 lines)
  - `MediaPickerPopovers.tsx`: Emoji, GIF, and Location picker popover views
  - `PostMediaToolbar.tsx`: Compact toolbar trigger bar (~80 lines)

### Phase 4: Auth & Modal Tier
- `frontend/src/app/login-card/`
  - `GoogleAccountList.tsx`: Pre-configured Google account list items
  - `GoogleCustomAccountForm.tsx`: Custom name/email simulation form
  - `GoogleOAuthModal.tsx`: Slim modal layout (~90 lines)
  - `AuthCardHeader.tsx`: Brand logo asset and header title
  - `page.tsx`: Clean login card orchestrator (~120 lines)
- `frontend/src/app/auth/`
  - `RegisterInputFields.tsx`: Form inputs with inline Astryx validation statuses
  - `RegisterForm.tsx`: Clean submit and state coordinator (~80 lines)

---

## 5. Code Style & Simplification Rules
1. **Rule of 100:** No single component or context file should exceed ~120–150 lines.
2. **Single Responsibility:** Each extracted module owns one concern (e.g. storage, aggregation, UI presentation).
3. **Behavioral Invariance:** Never change function signatures, context return types, or data contracts.
4. **Clean Astryx Composition:** Use Astryx primitives (`Card`, `Button`, `VStack`, `HStack`, `Icon`, `Text`) with standard design tokens.

---

## 6. Testing Strategy
- Run `npm run test:unit` after each decomposed slice to verify all 97 tests remain green.
- Add refactoring validation tests in `frontend/test/codescene_code_health_refactor.test.mjs` verifying line count reductions and modular extraction boundaries.
- Ensure `npx tsc -b`, `npx oxlint .`, and `npm run build` pass with 0 errors after every phase.

---

## 7. Boundaries
- **Always:** Keep existing unit tests passing without modifications; maintain all exports from `AuthContext.tsx`, `AnalyticsContext.tsx`, and `client.ts` so no external caller breaks.
- **Ask First:** Deleting deprecated functions or changing context interface signatures.
- **Never:** Introduce third-party state libraries (e.g. Redux/Zustand) or ad-hoc CSS.

---

## 8. Success Criteria
1. Every targeted file (`AuthContext`, `AnalyticsContext`, `client.ts`, `useNotificationPolling`, `PostCard`, `PostCreateModal`, `PostMediaToolbar`, `GoogleOAuthModal`, `RegisterForm`, `page.tsx`) reduced below 150 lines.
2. CodeScene Code Health reaches 10.0 / 10.0 with 0 hotspot warnings.
3. All 97 automated unit tests pass green.
4. `tsc -b`, `oxlint .`, and `npm run build` succeed cleanly.

---

## 9. Open Questions
- None. Module boundaries and extraction paths are clearly mapped.
