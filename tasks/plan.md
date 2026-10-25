# Implementation Plan: News Feed 3-Column Social Discovery Architecture

## Overview
Transform the desktop News Feed layout into an enterprise 3-column social experience ([SPEC-newsfeed-3-column-layout.md](file:///home/hunain/Projects/social-media-content-analysis-system/docs/specs/SPEC-newsfeed-3-column-layout.md)). Add `FeedShortcutsCard` to the Left Rail, and `TrendingTopicsCard`, `WhoToFollowCard`, and `PlatformInfoFooter` to the Right Rail, with in-place reactive feed filtering and follow state synchronization.

## Architecture Decisions
1. **Astryx-Native Component Modularization:** Build self-contained widgets (`FeedShortcutsCard`, `TrendingTopicsCard`, `WhoToFollowCard`, `PlatformInfoFooter`) using only `@astryxdesign/core` primitives (`Card`, `Badge`, `Avatar`, `Button`, `VStack`, `HStack`, `Text`, `Heading`, `Divider`).
2. **In-Place Reactive Filtering:** Filter feed posts in `NewsFeedPage` state based on `activeFilter` (`{ type: 'ALL' | 'MEDIA' | 'BOOKMARKS' | 'HASHTAG', value?: string }`), showing an active filter chip with instant reset.
3. **Synchronized Follow State:** Following a recommended creator in `WhoToFollowCard` immediately updates their status in the right rail, reflects across all post cards authored by that creator in the feed, and triggers `recordFollowToggle`.
4. **Responsive CSS Media Queries:** Clean 3-column layout on desktop (`>= 1280px`), collapses right rail on tablet (`1024px - 1279px`), and stacks left rail on mobile (`< 1024px`).

## Task List

### Phase 1: Foundation & Seed Data
- [ ] Task 1: Seed Data and Types for Trending Topics & Suggested Creators (`social.ts`, `socialSeedData.ts`)

### Phase 2: Core Sidebar Components
- [ ] Task 2: Implement Left Rail `FeedShortcutsCard` (`FeedShortcutsCard.tsx`)
- [ ] Task 3: Implement Right Rail Discovery Cards (`TrendingTopicsCard.tsx`, `WhoToFollowCard.tsx`, `PlatformInfoFooter.tsx`)

### Checkpoint 1: Foundation & Components Ready
- [ ] New types and components compile with zero TypeScript errors (`npx tsc -b`)
- [ ] Existing 36/36 tests continue to pass (`npm test`)

### Phase 3: Integration & Responsive Layout
- [ ] Task 4: Integrate 3-Column Layout, In-Place Filtering, and State Sync in `NewsFeedPage` and `PostCard`

### Checkpoint 2: Layout & State Verification
- [ ] Desktop layout renders 3 columns side-by-side
- [ ] Clicking hashtag or shortcut filters feed in-place with "Clear" pill
- [ ] Follow toggle synchronizes across rail and feed

### Phase 4: Automated Testing & Verification
- [ ] Task 5: Native Test Suite & Chrome DevTools Visual Verification (`feed_3_column_layout.test.mjs`)

### Checkpoint 3: Complete & Ready for Review
- [ ] All tests pass across all test suites
- [ ] Production build succeeds (`npm run build`)
- [ ] Verification screenshots captured

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Wide 3-column layout overflowing smaller screens | High | Implement CSS media queries: hide right rail `< 1280px`, stack left rail `< 1024px` |
| Filtered feed showing empty state confusing user | Med | Active filter banner clearly states count and provides 1-click "Clear filter" button |
| Follow toggle desynchronizing between rail and feed | Med | Use unified user ID lookup and share single `handleToggleFollow` handler |
