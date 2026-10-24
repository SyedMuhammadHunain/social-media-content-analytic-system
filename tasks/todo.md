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

## Task 2: Scaffold Official Astryx Dashboard Template
**Description:** Run `npx astryx template dashboard` to scaffold the official Meta template into `frontend/src/components/dashboard/DashboardPage.tsx`.
**Acceptance criteria:**
- [x] `frontend/src/components/dashboard/DashboardPage.tsx` created from official template.
- [x] Imports resolve without missing package errors.
**Verification:**
- [x] Build: `cd frontend && npx tsc -b`
**Dependencies:** Task 1
**Files likely touched:**
- `frontend/src/components/dashboard/DashboardPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint 1: Scaffold
- [x] Official template scaffolded.
- [x] Dependencies resolve cleanly.

---

## Task 3: Define Creator Analytics Types & Mock Data
**Description:** Create `types/analytics.ts` and `mock/creatorMetrics.ts` with typed points for follower trend, like/unlike distribution, and engagement volume based on Section 5 ratios.
**Acceptance criteria:**
- [x] Interfaces exported for `FollowerPoint`, `LikeUnlikePoint`, `EngagementPoint`, and `KPISummary`.
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
**Description:** Adapt top-band metric cards in `DashboardPage.tsx` to display Total Followers (+growth), Total Likes vs Unlikes (+ratio), and Total Comments (+engagement rate).
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
3. Engagement Graph (`BarChart`/`LineChart` tracking comments and interactions)
**Acceptance criteria:**
- [x] All 3 graphs render with tooltips, axes, and Astryx card headers.
- [x] Top content table displays post performance metrics.
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
**Description:** Run linter, typecheck, production build, and headless Chrome browser test verifying chart SVG elements and console health.
**Acceptance criteria:**
- [x] `npm run lint` and `npm run build` pass with 0 errors.
- [x] Headless Chrome verifies SVG nodes and clean console (0 errors, 0 warnings).
**Verification:**
- [x] Run `cd frontend && npm run lint && npm run build`
- [x] DevTools script checks `http://127.0.0.1:5173/`
**Dependencies:** Task 6
**Files likely touched:** None
**Estimated scope:** Verification only

---

## Checkpoint 3: Complete
- [x] All 7 tasks completed and checked.
- [x] Creator Analytics Dashboard fully functional and verified.
