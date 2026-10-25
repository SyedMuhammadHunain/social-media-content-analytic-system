# Implementation Plan: User Profile Card & Full Profile View

## Overview
Implement an official Meta Astryx Left Profile Card (`ClickableCard`) on the News Feed for the active user (`Syed Muhammad Hunain`). Clicking anywhere on this card transitions to a dedicated full-page User Profile View featuring an `AspectRatio` cover banner, `Avatar`, `Badge` tags, an interactive `ProfileBioEditor` (`TextArea`, `Toolbar`, `Markdown`, `Banner`), and the user's past post history (`Card`, `TabList`, `Skeleton`, `PostCard`), with a "Back to Feed" `Button`.

## Architecture Decisions
1. **Official Astryx Primitives Only:** Use strictly `@astryxdesign/core` components (`ClickableCard`, `Card`, `Avatar`, `AspectRatio`, `Banner`, `Skeleton`, `Badge`, `TextArea`, `Toolbar`, `Markdown`, `Button`, `TabList`, `Heading`, `Text`, `HStack`, `VStack`, `Divider`, `Icon`). Zero custom HTML card wrappers or un-themed CSS classes.
2. **View State Architecture:** Manage view state inside `NewsFeedPage` (`activeView: 'feed' | 'profile'`), preserving top navigation and theme mode while giving the profile full canvas width.
3. **Reactive Bio Editing & Banner Feedback:** Bio state lives in reactive state. Switching to edit mode displays `TextArea` with `Toolbar`; saving updates the bio, restores `Markdown` preview, and triggers an Astryx success `Banner`.
4. **Author Post Filtering & Skeleton Loading:** Filter existing `mockPosts` by `author.id === currentUser.id` to show authored posts, preceded by simulated `Skeleton` loaders on initial tab selection.
5. **Git Branch Discipline:** All development stays on `Hunain-Frontend`.

## Task List

### Phase 1: Foundation & TDD Test Suite
- [x] Task 1: Extend User Types, Mock Data, and Add Failing TDD Test Suite (`frontend/src/types/social.ts`, `frontend/src/mock/socialSeedData.ts`, `frontend/test/profile_card_and_view.test.mjs`)

### Checkpoint 1: RED Test State Verified
- [x] Tests fail cleanly on missing components.

### Phase 2: Left Profile Card & Feed Layout
- [x] Task 2: Build Official Astryx `UserProfileCard` & 2-Column Feed Layout (`frontend/src/components/profile/UserProfileCard.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`)

### Checkpoint 2: Left Card Rendered
- [x] Profile Card renders on left of news feed with Avatar, name, tags, and stats.

### Phase 3: Full Profile View & Rich Bio Editor
- [x] Task 3: Build `ProfileBioEditor` and `UserProfileView` (`frontend/src/components/profile/ProfileBioEditor.tsx`, `frontend/src/components/profile/UserProfileView.tsx`, `frontend/src/app/feed/NewsFeedPage.tsx`)

### Checkpoint 3: Profile View Interactive
- [x] Full profile navigable from card with cover banner, bio editor with Banner feedback, post history with Skeleton loading, and "Back to Feed" button.

### Phase 4: Verification & Branch Commit
- [x] Task 4: Automated Verification, Screenshot Artifacts, and Branch Commit

### Checkpoint 4: Feature Complete
- [x] `npm test` passes 100%. Build and linter clean. Committed and pushed to `Hunain-Frontend`.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| 2-Column feed layout overflow on mobile | Medium | Use responsive CSS grid / flex wrap with `minmax(280px, 1fr)` |
| `ClickableCard` nested button conflict | Low | Astryx `ClickableCard` uses `useClickableContainer` to safely ignore nested button clicks |
| Markdown parsing complexity | Low | Astryx `@astryxdesign/core/Markdown` component natively renders formatted markdown |
