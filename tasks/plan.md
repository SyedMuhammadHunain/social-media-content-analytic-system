# Implementation Plan: Dedicated Creator Analytical Dashboard & Real-Time Sync

## Overview
Implement the 3 dedicated creator analytical graphs specified in the project PDF (Section 1.2, Section 4.1.vii–ix, and Section 4.2):
1. **Like / Unlike Graph (Req 4.1.vii):** Comparative BarChart for post likes vs. unlikes over time.
2. **Followers Graph (Req 4.1.viii):** Follower trend LineChart tracking audience gain/loss over time.
3. **Engagement Graph (Req 4.1.ix):** Comments directly proportional to creator engagement LineChart/AreaChart.
4. **2-Second Real-Time Synchronization (Req 4.2):** User interactions in News Feed (like/unlike, follow/unfollow, comment) directly update the analytical graphs and metrics within 2 seconds.

---

## Architecture Decisions
1. **Astryx Component Reuse (Zero Reinvention):**
   - Reuse existing Astryx dashboard primitives (`LineChart`, `BarChart`, `MetricCard`, `Card`, `VStack`, `HStack`, `Heading`, `Text`, `Badge`, `Icon`) already present in `dashboard/page.tsx`.
   - Strip out irrelevant website-traffic tables (`/pricing`, bounce rate, country visits) and replace them with the 3 social media creator performance graphs.
2. **Shared Telemetry State (`AnalyticsContext`):**
   - Provide a shared React context (`AnalyticsProvider` / `useAnalytics`) storing creator telemetry:
     - `likeUnlikeData: Array<{ date: string; likes: number; unlikes: number }>`
     - `followersData: Array<{ date: string; followers: number }>`
     - `engagementData: Array<{ date: string; comments: number; engagementScore: number }>`
     - Summary counters: `totalLikes`, `totalUnlikes`, `totalFollowers`, `totalComments`, `engagementRate`.
   - Expose mutators: `recordLikeToggle(isLiked)`, `recordFollowToggle(isFollowed)`, `recordComment()`.
   - Wrap `AppContent` in `AnalyticsProvider` alongside `AuthProvider` so both News Feed and Dashboard share live telemetry.
3. **2-Second Real-Time Synchronization:**
   - When a user performs an action in `NewsFeedPage` (like post, follow author, add comment), the interaction mutates `AnalyticsContext` state, updating the dashboard graphs in real time (satisfying Section 4.2 eventual consistency under 2s).

---

## Task Breakdown

### Phase 1: Test Suite & Shared Telemetry Foundation
- [ ] **Task 1:** Create Failing TDD Integration Test Suite (`frontend/test/creator_dashboard_analytics.test.mjs`)
- [ ] **Task 2:** Implement Shared `AnalyticsContext` & Seed Data (`frontend/src/context/AnalyticsContext.tsx`, `useAnalytics.ts`, `types/analytics.ts`, `mock/analyticsSeedData.ts`)

### Checkpoint 1: Analytics Foundation Verified
- `AnalyticsContext` compiles cleanly and provides state & mutators; tests run cleanly against foundation.

### Phase 2: Dedicated Creator Dashboard & News Feed Synchronization
- [ ] **Task 3:** Implement 3 Dedicated PDF Graphs in `frontend/src/app/dashboard/page.tsx`
- [ ] **Task 4:** Wire News Feed Actions (`NewsFeedPage.tsx`) to `useAnalytics` with 2-Second Synchronization

### Checkpoint 2: Real-Time Sync & Visual Graphs Green
- Dashboard displays 3 PDF graphs; feed likes, follows, and comments update dashboard metrics live within 2s; all tests pass.

### Phase 3: Verification, Artifacts & Commit
- [ ] **Task 5:** Capture Dashboard Screenshot Artifacts, Run Full Test Suite, and Push to `Hunain-Frontend`

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Existing 24 tests broken by App state changes | High | Keep `AnalyticsProvider` non-blocking with default seed state matching existing test expectations. |
| Recharts chart animation delay during automated tests | Medium | Set `isAnimationActive={false}` in automated test mode or allow 300ms transition buffer. |
| Dark/Light mode color token discrepancies | Low | Use official Astryx theme variables (`var(--color-data-categorical-blue)`, `var(--color-border)`, `var(--color-text-secondary)`). |
