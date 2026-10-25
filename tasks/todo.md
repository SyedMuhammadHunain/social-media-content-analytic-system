# Task List: Dedicated Creator Analytical Dashboard & Real-Time Sync

## Task 1: Create Failing TDD Test Suite for Creator Analytics Dashboard
**Description:** Implement `frontend/test/creator_dashboard_analytics.test.mjs` using `node:test` and Chrome DevTools Protocol (CDP) to verify:
1. Navigating to Dashboard displays the 3 required PDF graphs:
   - Like / Unlike Graph (`data-testid="like-unlike-graph"`)
   - Followers Trend Graph (`data-testid="followers-trend-graph"`)
   - Engagement & Comments Graph (`data-testid="engagement-graph"`)
2. Summary metric cards display total likes, followers, and engagement rate.
3. Liking a post in the News Feed updates the Like/Unlike metric and graph data within 2 seconds.
4. Following an author in the News Feed updates the Followers metric and graph data within 2 seconds.
5. Posting a comment in the News Feed updates the Engagement metric and graph data within 2 seconds.
**Acceptance criteria:**
- [x] Test file created and added to test suite.
- [x] Tests run and fail cleanly against current dashboard (RED).
**Verification:**
- [x] Run `cd frontend && node --test test/creator_dashboard_analytics.test.mjs`
**Dependencies:** None
**Files likely touched:**
- `frontend/test/creator_dashboard_analytics.test.mjs`
**Estimated scope:** Small (1 file)

---

## Task 2: Implement Shared AnalyticsContext & Creator Telemetry Store
**Description:** Create `frontend/src/context/AnalyticsContext.tsx`, `useAnalytics.ts`, `types/analytics.ts`, and `mock/analyticsSeedData.ts` to manage:
- Creator metrics data: `likeUnlikeData`, `followersData`, `engagementData`.
- Summary counters: `totalLikes`, `totalUnlikes`, `totalFollowers`, `totalComments`, `engagementScore`.
- Mutators: `recordLikeToggle(isLiked)`, `recordFollowToggle(isFollowed)`, `recordComment()`.
- Wrap `AppContent` in `AnalyticsProvider` in `frontend/src/App.tsx`.
**Acceptance criteria:**
- [ ] Types exported in `frontend/src/types/analytics.ts`.
- [ ] `AnalyticsProvider` provides reactive state and update mutators.
- [ ] Compiles cleanly with zero TypeScript errors.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/types/analytics.ts`
- `frontend/src/mock/analyticsSeedData.ts`
- `frontend/src/context/AnalyticsContext.tsx`
- `frontend/src/context/useAnalytics.ts`
- `frontend/src/App.tsx`
**Estimated scope:** Medium (4-5 files)

---

## Checkpoint 1: Analytics Foundation Ready
- [ ] `AnalyticsContext` compiles cleanly and is accessible throughout the app.

---

## Task 3: Implement 3 Dedicated PDF Graphs in Dashboard
**Description:** Update `frontend/src/app/dashboard/page.tsx` to:
1. Strip out irrelevant website marketing tables (top pages `/pricing`, bounce rate, country geolocation).
2. Render the 3 dedicated creator analytical graphs reusing Astryx `LineChart`, `BarChart`, and `MetricCard` primitives:
   - Like / Unlike Bar Graph (`data-testid="like-unlike-graph"`)
   - Followers Trend Line Graph (`data-testid="followers-trend-graph"`)
   - Comments / Engagement Area Graph (`data-testid="engagement-graph"`)
3. Connect charts to `useAnalytics` telemetry state so they render dynamic data points.
**Acceptance criteria:**
- [ ] All 3 graph components mounted with proper `data-testid` selectors.
- [ ] Graphs utilize Astryx theme tokens and responsive containers.
- [ ] Top creator metric cards display live counters.
**Verification:**
- [ ] Run `cd frontend && npx tsc -b`
- [ ] Run `cd frontend && npm run lint`
- [ ] Run `cd frontend && npm run build`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/app/dashboard/page.tsx`
**Estimated scope:** Small (1 file)

---

## Task 4: Wire News Feed User Interactions to Real-Time Telemetry
**Description:** Update `frontend/src/app/feed/NewsFeedPage.tsx` to wire user interactions to `useAnalytics`:
- Liking/unliking a post calls `recordLikeToggle(isLiked)`.
- Following/unfollowing an author calls `recordFollowToggle(isFollowed)`.
- Adding a comment calls `recordComment()`.
- Ensure changes propagate to the dashboard immediately (<2 seconds).
**Acceptance criteria:**
- [ ] News feed actions update `AnalyticsContext` state.
- [ ] Switching between News Feed and Dashboard tabs displays updated metrics.
- [ ] Tests 1-5 in `creator_dashboard_analytics.test.mjs` turn GREEN.
**Verification:**
- [ ] Run `cd frontend && node --test test/creator_dashboard_analytics.test.mjs`
- [ ] Run `cd frontend && npm test`
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/app/feed/NewsFeedPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint 2: Real-Time Sync & Visual Graphs Green
- [ ] Dashboard displays 3 PDF graphs and feed interactions update metrics in real time; all automated tests pass.

---

## Task 5: Automated Verification, High-Res Screenshots & Branch Push
**Description:** Run full automated test suite (all 5 suites), capture high-resolution screenshot artifacts of the new Creator Analytics Dashboard in both Dark and Light themes, verify zero errors on lint and build, and push to `Hunain-Frontend`.
**Acceptance criteria:**
- [ ] High-res screenshot artifacts saved in artifact directory:
  - `creator_dashboard_overview.png`
  - `creator_dashboard_graphs.png`
  - `creator_dashboard_realtime_sync.png`
- [ ] Full test suite (`npm test`) passes 100%.
- [ ] `tsc -b`, `oxlint`, and `vite build` pass with 0 errors.
- [ ] Changes committed and pushed to `origin/Hunain-Frontend`.
**Verification:**
- [ ] Run `cd frontend && npm test`
- [ ] Run `cd frontend && npm run build`
- [ ] Run `git status`
**Dependencies:** Task 4
**Files likely touched:**
- `tasks/todo.md`
- Documentation/verification reports
**Estimated scope:** Small (1-2 files)
