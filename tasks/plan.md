# Implementation Plan: Social Media News Feed and Post Composer

## Overview
Implement the interactive Post Composer and chronological News Feed interface (PDF Section 4.1) using official Meta Astryx Design System components (`@astryxdesign/core`) in the neutral dark theme. Provide a seamless top-level navigation toggle between the News Feed and the Analytics Dashboard.

## Architecture Decisions
1. **Astryx Primitive Purity:** Build exclusively with official Astryx components (`Card`, `Avatar`, `Button`, `Badge`, `TextArea`, `TextInput`, `TabList`, `Divider`, `HStack`, `VStack`, `Layout`, `LayoutContent`). Zero custom CSS hacks or non-Astryx primitives.
2. **In-Memory Reactive Social State:** Manage posts, comments, likes, and follow status in reactive React state initialized from Section 5 capacity seed data (20% text, 60% image, 20% video). New posts prepend to the feed with sub-second feedback (<2s SLA).
3. **App Shell Dual Navigation:** Enhance `App.tsx` with Astryx `TabList` / header controls to toggle between the interactive `News Feed` and `Analytics Dashboard`.
4. **Git Discipline:** Execute exclusively on git branch `Hunain-Frontend`. Do not merge to `main` without explicit instruction.

## Task List

### Phase 1: Foundation & Types
- [ ] Task 1: Define Social Data Types & Capacity-Compliant Mock Seed Data
  - `frontend/src/types/social.ts`
  - `frontend/src/mock/socialSeedData.ts`

### Checkpoint: Foundation
- [ ] TypeScript compilation succeeds with zero errors.

### Phase 2: Feed UI Components
- [ ] Task 2: Build Astryx Post Composer (`PostComposer.tsx`)
- [ ] Task 3: Build Astryx Post Card & Comment Section (`PostCard.tsx`, `CommentSection.tsx`)

### Checkpoint: Components
- [ ] Individual post creation and interaction components typecheck clean.

### Phase 3: Feed Integration & Navigation
- [ ] Task 4: Assemble Chronological News Feed & App Navigation (`NewsFeedPage.tsx`, `App.tsx`)

### Checkpoint: Full Integration
- [ ] Post creation, liking, commenting, following, and tab switching work end-to-end.
- [ ] `npm run build` succeeds without errors.

### Phase 4: Verification & Quality Gate
- [ ] Task 5: DevTools Protocol Automated Verification & Branch Commit

### Checkpoint: Complete
- [ ] DevTools test passes (0 console errors, 0 network errors).
- [ ] Committed and pushed to `Hunain-Frontend`.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Media URL broken rendering | Medium | Support graceful fallback container for images and video players with Astryx Badge indicators |
| Layout overflow on small screens | Low | Use Astryx `LayoutContent` padding and responsive `VStack`/`HStack` gap properties |
