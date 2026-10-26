# Specification: CodeScene Code Health Refactoring & Modularity Enhancement

**Document ID:** `SPEC-codescene-code-health-refactor`  
**Status:** DRAFT (Awaiting Human Approval)  
**Author:** Antigravity Pairing Agent & Syed Muhammad Hunain  
**Date:** October 25, 2026  

---

## 1. Objective
Achieve a **9.5+ (Green)** Code Health score in CodeScene and eliminate architectural hotspot warnings while strictly maintaining 100% test pass rate (43/43 tests), zero UI/behavioral regressions, and complete fidelity to Meta Astryx design system conventions.

### Problem Statement
CodeScene currently evaluates the repository code health at **8.96 / 10.0**. The reduction is driven by:
1. **Uncategorized Test Files (`frontend/test/**`):** Procedural CDP end-to-end integration test flows evaluated as production code with cyclomatic complexity penalties.
2. **Monolithic UI Component (`PostCard.tsx` - 318 lines):** Bundles post metadata, media rendering (`<img>` / `<video>`), delete confirmation modal overlay, bookmarking, and comment drawer.
3. **Monolithic Profile View (`UserProfileView.tsx` - 355 lines):** Bundles banner upload, avatar positioning, inline bio editor, tab management, and post history streaming.

---

## 2. Technical Scope & Architecture

### A. CodeScene Configuration
Configure repository-level and UI-level test exclusions so `frontend/test/**` is recognized as test/integration code rather than production business logic:
- Add `.codescene/code-health-rules.json` in repository root defining test file patterns.
- Provide step-by-step instructions for CodeScene web interface configuration under **Project Configuration -> Exclusion Filters**.

### B. High-Cohesion Component Decomposition

#### 1. `PostCard.tsx` Refactoring
Decompose `PostCard.tsx` into 3 single-responsibility sub-components:
- **`PostHeader.tsx` (`frontend/src/app/feed/PostHeader.tsx`):**
  - Renders author avatar, name, username, post type badge, timestamp.
  - Renders author actions (Edit & Delete buttons for author) or Follow/Following button (for other creators).
- **`PostMediaViewer.tsx` (`frontend/src/app/feed/PostMediaViewer.tsx`):**
  - Renders image or video container with proper aspect ratio and preview styles.
- **`PostDeleteModal.tsx` (`frontend/src/app/feed/PostDeleteModal.tsx`):**
  - Encapsulates the accessible modal dialog, backdrop, confirmation text, and Cancel / Delete Post actions.
- **`PostCard.tsx`:**
  - Reduced to ~120 lines, acting as a clean orchestrator.

#### 2. `UserProfileView.tsx` Refactoring
Decompose `UserProfileView.tsx` into 2 single-responsibility sub-components:
- **`ProfileHeaderBanner.tsx` (`frontend/src/components/profile/ProfileHeaderBanner.tsx`):**
  - Manages cover banner image, banner upload trigger, overlapping avatar with ring border, and avatar photo upload input.
- **`ProfileMetaDetails.tsx` (`frontend/src/components/profile/ProfileMetaDetails.tsx`):**
  - Manages headline, topic badges, and follower/following stats.
- **`UserProfileView.tsx`:**
  - Reduced to ~140 lines, orchestrating bio editing, tab state, and authored post list.

---

## 3. Tech Stack & Commands

| Tool | Version / Spec | Purpose |
|---|---|---|
| **Framework** | React 19 (`react`, `react-dom`) | Component rendering |
| **Language** | TypeScript 5.8 | Strict type checking (`tsc -b`) |
| **Design System** | `@astryxdesign/core` 0.1.0-alpha.10 | Meta Astryx primitives (`Card`, `Button`, `Item`, `Icon`, `Avatar`, `Badge`, `Heading`, `Text`) |
| **Test Runner** | Node.js native (`node:test`, `node:assert`) | 43 automated integration tests |
| **Quality Linter** | `oxlint` | Zero errors/warnings |

### Executable Commands
- **Typecheck:** `cd frontend && npx tsc -b`
- **Lint:** `cd frontend && npm run lint`
- **Test Suite:** `cd frontend && npm test`
- **Build:** `cd frontend && npm run build`

---

## 4. Code Style & Convention Contracts

### High Cohesion Example (`PostDeleteModal.tsx`)
```tsx
'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';

export interface PostDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PostDeleteModal({ isOpen, onClose, onConfirm }: PostDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="post-delete-confirm-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ maxWidth: 440, width: '100%' }}>
        <Card padding={5}>
          <VStack gap={4}>
            <Heading level={3}>Delete Post?</Heading>
            <Text type="body" color="secondary">
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </Text>
            <Divider />
            <HStack hAlign="end" gap={3}>
              <Button label="Cancel" variant="secondary" size="md" onClick={onClose} />
              <Button
                data-testid="confirm-delete-btn"
                label="Delete Post"
                variant="destructive"
                size="md"
                onClick={onConfirm}
              />
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
}
```

---

## 5. Testing Strategy
- **Regression Invariance:** All 7 existing test suites (43 tests) must pass without altering test assertions:
  1. `auth_login_split.test.mjs` (5 tests)
  2. `creator_analytics_dashboard.test.mjs` (5 tests)
  3. `feed_3_column_layout.test.mjs` (6 tests)
  4. `post_edit_delete.test.mjs` (5 tests)
  5. `profile_view.test.mjs` (6 tests)
  6. `feed_profile_refinements.test.mjs` (4 tests)
  7. `topnav_cleanliness.test.mjs` (5 tests)
- **DOM Test IDs Preserved:**
  - `post-card-${post.id}`
  - `post-edit-btn-${post.id}`
  - `post-delete-btn-${post.id}`
  - `post-delete-confirm-modal`
  - `confirm-delete-btn`
  - `user-profile-banner`
  - `user-profile-avatar-trigger`

---

## 6. Boundaries

- **Always:**
  - Strictly use `@astryxdesign/core` components (`Card`, `Button`, `VStack`, `HStack`, `Text`, `Heading`, `Avatar`, `Badge`, `Icon`).
  - Run `npx tsc -b`, `npm run lint`, and `npm test` after each decomposed slice.
  - Preserve all existing props, events, and callback contracts.
- **Ask First:**
  - Adding any new external packages or design libraries.
  - Changing test expectation selectors.
- **Never:**
  - Change user-facing behavior, visual styling, or Astryx theming.
  - Modify backend schemas or create ad-hoc CSS stylesheets.

---

## 7. Success Criteria

1. **CodeScene Score:** Code Health improves from **8.96** to **9.5+** (Green rating).
2. **Hotspots:** Red/Yellow complexity warnings on `PostCard.tsx` and `UserProfileView.tsx` resolved.
3. **Automated Verification:** 100% test pass rate (43/43 tests green).
4. **Build & Quality:** 0 TypeScript compile errors, 0 lint warnings, clean `vite build`.

---

## 8. Open Questions

1. In CodeScene, do you prefer excluding `frontend/test/**` via CodeScene's web UI settings or via `.codescene/code-health-rules.json` in the repo (or both)?
2. Are there any other specific files flagged by CodeScene besides `PostCard.tsx`, `UserProfileView.tsx`, `page.tsx`, and tests?
