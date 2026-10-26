# Implementation Plan: CodeScene Code Health Refactoring & Modularity Enhancement

## Overview
Decompose monolithic UI components (`PostCard.tsx` and `UserProfileView.tsx`) into high-cohesion sub-components, and configure CodeScene test exclusions to elevate the repository Code Health score from **8.96** to **9.5+ Green** ([SPEC-codescene-code-health-refactor.md](file:///home/hunain/Projects/social-media-content-analysis-system/docs/specs/SPEC-codescene-code-health-refactor.md)).

## Architecture Decisions
1. **High-Cohesion Subcomponents:**
   - Extract `PostDeleteModal.tsx`, `PostMediaViewer.tsx`, and `PostHeader.tsx` out of `PostCard.tsx`.
   - Extract `ProfileHeaderBanner.tsx` and `ProfileMetaDetails.tsx` out of `UserProfileView.tsx`.
   - Reduce individual component line counts under 150 lines, eliminating complex nested JSX branches.
2. **Strict Astryx Design System Adherence:**
   - Continue strictly using `@astryxdesign/core` primitives (`Card`, `Button`, `VStack`, `HStack`, `Text`, `Heading`, `Avatar`, `Badge`, `Icon`).
3. **Behavioral & Test Invariance:**
   - Retain all `data-testid` attributes (`post-card-${post.id}`, `post-edit-btn-${post.id}`, `post-delete-btn-${post.id}`, `post-delete-confirm-modal`, `confirm-delete-btn`, etc.).
   - All 43 integration tests must remain 100% green without changing test assertions.
4. **CodeScene Rule Configuration:**
   - Define test exclusion pattern `frontend/test/**` via `.codescene/code-health-rules.json` and web UI instructions so test file procedural complexity is not penalized.

## Task List

### Phase 1: CodeScene Rule Setup
- [ ] Task 1: CodeScene Configuration & Test Exclusion Rules (`.codescene/code-health-rules.json`, `docs/reports/codescene-configuration-guide.md`)

### Phase 2: PostCard Component Decomposition
- [ ] Task 2: Decompose `PostCard.tsx` into `PostHeader`, `PostMediaViewer`, and `PostDeleteModal`

### Checkpoint 1: PostCard Refactor Verified
- [ ] `cd frontend && npx tsc -b` passes with 0 errors
- [ ] `cd frontend && npm run lint` passes with 0 warnings
- [ ] Post edit/delete test suite passes (`post_edit_delete.test.mjs`)

### Phase 3: UserProfileView Component Decomposition
- [ ] Task 3: Decompose `UserProfileView.tsx` into `ProfileHeaderBanner` and `ProfileMetaDetails`

### Checkpoint 2: Profile View Refactor Verified
- [ ] `cd frontend && npx tsc -b` passes with 0 errors
- [ ] Profile view test suites pass (`profile_view.test.mjs`, `feed_profile_refinements.test.mjs`)

### Phase 4: Full Suite Verification & Build
- [ ] Task 4: Full Quality Gate, DevTools Audit, and Production Build

### Checkpoint 3: Complete & Ready for Review
- [ ] 43/43 tests green across all 7 suites
- [ ] Production build succeeds (`cd frontend && npm run build`)
- [ ] Changes committed and pushed to git

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Decomposing `PostCard` breaks test selectors | High | Preserve exact `data-testid` attributes on subcomponents |
| Missing props when splitting `UserProfileView` | Med | Define strict TypeScript interfaces for subcomponents with compiler checks |
| CodeScene fails to auto-read config file | Low | Provide both `.codescene/code-health-rules.json` and UI exclusion steps |
