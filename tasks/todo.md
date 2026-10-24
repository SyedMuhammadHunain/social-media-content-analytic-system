# Task List: Meta Astryx Creator Analytics Dashboard

## Task 1: Install Template Dependencies
**Description:** Install `recharts` and `@heroicons/react` in `frontend/` required by the Meta Astryx dashboard template.
**Acceptance criteria:**
- [x] `recharts` and `@heroicons/react` added to `frontend/package.json`.
- [x] `npm install` finishes with 0 errors.
**Verification:**
- [x] Check `frontend/package.json` dependencies.
**Dependencies:** None
**Files likely touched:**
- `frontend/package.json`
- `frontend/package-lock.json`
**Estimated scope:** Small (2 files)

---

## Task 2: Configure Neutral Theme & Scaffold Official Template
**Description:** Run `npx @astryxdesign/cli theme add neutral` and scaffold official `dashboard` (Analytics Dashboard) template into `frontend/src/components/dashboard/DashboardPage.tsx`.
**Acceptance criteria:**
- [x] `theme-neutral` verified in `src/astryx-themes.ts`.
- [x] `frontend/src/components/dashboard/DashboardPage.tsx` created from official template.
- [x] Imports resolve without missing package errors.
**Verification:**
- [x] Build: `cd frontend && npx tsc -b`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/astryx-themes.ts`
- `frontend/src/components/dashboard/DashboardPage.tsx`
**Estimated scope:** Small (2 files)

---

## Checkpoint 1: Scaffold
- [x] Official template scaffolded.
- [x] Dependencies and theme resolve cleanly.

---

## Task 3: Define Creator Analytics Types & Mock Data
**Description:** Create `types/analytics.ts` and `mock/creatorMetrics.ts` with typed points for follower trend, like/unlike distribution, and engagement volume based on Section 5 ratios.
**Acceptance criteria:**
- [x] Interfaces exported for `FollowerPoint`, `LikeUnlikePoint`, `EngagementPoint`, `TopPostMetric`, and `KPISummary`.
- [x] Realistic data generated across 24h, 7d, and 30d timeframes.
**Verification:**
- [x] Build: `cd frontend && npx tsc -b`
**Dependencies:** Task 2
**Files likely touched:**
- `frontend/src/types/analytics.ts`
- `frontend/src/mock/creatorMetrics.ts`
**Estimated scope:** Small (2 files)

---

## Task 4: Adapt Headline KPI Metric Tiles
**Description:** Adapt top-band metric cards in `DashboardPage.tsx` to display Total Followers (+growth), Total Likes vs Unlikes (+ratio), and Total Comments (+engagement rate) using Astryx `Card padding={4}` and `Badge`.
**Acceptance criteria:**
- [x] Astryx `Card` tiles display live values, subtitles, and trend `Badge` indicators.
**Verification:**
- [x] Build: `cd frontend && npx tsc -b`
**Dependencies:** Task 3
**Files likely touched:**
- `frontend/src/components/dashboard/DashboardPage.tsx`
**Estimated scope:** Small (1 file)

---

## Task 5: Adapt The 3 Creator Analytics Graphs
**Description:** Adapt chart cards in `DashboardPage.tsx` to render the 3 PDF graphs:
1. Followers Graph (`AreaChart` with audience net growth over time)
2. Like / Unlike Graph (`BarChart` comparing likes vs unlikes)
3. Engagement Graph (`LineChart` tracking comments and interactions)
4. Top Posts performance table using Astryx `Table` with format badges.
**Acceptance criteria:**
- [x] All 3 graphs render with tooltips, axes, and Astryx card headers.
- [x] Top content table displays post performance metrics and badges.
**Verification:**
- [x] Build: `cd frontend && npx tsc -b`
**Dependencies:** Task 4
**Files likely touched:**
- `frontend/src/components/dashboard/DashboardPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint 2: Feature Complete
- [x] All 3 PDF graphs and KPI tiles adapted inside the Meta Astryx layout.
- [x] Type check passes cleanly.

---

## Task 6: Mount DashboardPage in App.tsx
**Description:** Replace the initial placeholder test button in `frontend/src/App.tsx` with `<DashboardPage />`.
**Acceptance criteria:**
- [x] `App.tsx` renders `DashboardPage` within Astryx Theme provider.
- [x] Clean layout margins and responsive behavior verified.
**Verification:**
- [x] Build: `cd frontend && npm run build`
**Dependencies:** Task 5
**Files likely touched:**
- `frontend/src/App.tsx`
**Estimated scope:** Small (1 file)

---

## Task 7: Quality Checks & Browser Runtime Test
**Description:** Run linter, typecheck, production build, and automated Chrome DevTools Protocol runtime test verifying chart SVG elements, button interactivity, and console health.
**Acceptance criteria:**
- [x] `npm run lint` and `npm run build` pass with 0 errors.
- [x] Chrome DevTools Protocol test verifies 0 console errors, 0 network errors, and interactive button state changes.
**Verification:**
- [x] Run `cd frontend && npm run lint && npm run build`
- [x] Run `node /tmp/devtools_test.mjs`
**Dependencies:** Task 6
**Files likely touched:** None
**Estimated scope:** Verification only

---

## Checkpoint 3: Complete
- [x] All 7 tasks completed and checked.
- [x] Creator Analytics Dashboard fully functional and verified.
