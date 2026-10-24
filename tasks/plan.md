# Implementation Plan: Meta Astryx Creator Analytics Dashboard

## Overview
Implement the Creator Analytics Dashboard using Meta's official **Analytics Dashboard** template (`id: dashboard`) from `https://astryx.atmeta.com/templates` ("Dashboard" tab) with the official **neutral** theme (`npx @astryxdesign/cli theme add neutral`). The layout adapts its three-band structure to feature the 3 required creator metric graphs from Section 4.1 of the system PDF:
1. **Followers Graph (Req 4.1.viii):** Audience growth / retention over time.
2. **Like / Unlike Graph (Req 4.1.vii):** Comparative positive vs negative post reactions.
3. **Engagement Graph (Req 4.1.ix):** User comments directly proportional to audience engagements.
4. **Top Content Performance Table:** Post breakdown across Video, Image, and Text formats.

## Architecture Decisions
- **Template Foundation:** Direct scaffolding from `@astryxdesign/cli` (`dashboard` template) ensures 100% adherence to Meta Astryx's design tokens, responsive grid layouts, and spacing conventions.
- **Official Theme:** Theme `neutral` (`@astryxdesign/theme-neutral/built`) loaded in `astryx-themes.ts` and wrapped via `<Theme>`.
- **Chart Primitives:** Recharts inside `ResponsiveContainer` wrapped in Astryx `Card padding={4}` surfaces.
- **Decoupled Mock Modeling:** Isolate metric datasets in `types/analytics.ts` and `mock/creatorMetrics.ts` with values derived from Section 5 throughput ratios across `24h`, `7d`, and `30d` timeframes.

## Task List

### Phase 1: Theme & Template Scaffold
- [x] Task 1: Install `recharts` and `@heroicons/react` dependencies in `frontend/`
- [x] Task 2: Configure `neutral` theme (`npx @astryxdesign/cli theme add neutral`) and scaffold `dashboard` template to `frontend/src/components/dashboard/DashboardPage.tsx`

### Checkpoint: Scaffold
- [x] Dependencies installed, `neutral` theme active, template scaffolded, and compiles cleanly with `npx tsc -b`.

### Phase 2: Creator Metrics & Visual Charts
- [x] Task 3: Define creator analytics types (`types/analytics.ts`) and mock data generator (`mock/creatorMetrics.ts`)
- [x] Task 4: Adapt headline KPI metric tiles (Followers count, Like/Unlike ratio, Comments/Engagement rate)
- [x] Task 5: Adapt chart slots to render Followers Graph (`AreaChart`), Like/Unlike Graph (`BarChart`), and Engagement Graph (`LineChart`)

### Checkpoint: Feature Complete
- [x] All 3 PDF graphs rendered inside Astryx cards with realistic metrics and format badges.

### Phase 3: App Mount & Runtime Verification
- [x] Task 6: Mount `DashboardPage` in `frontend/src/App.tsx` within Astryx Theme provider
- [x] Task 7: Execute linter (`oxlint`), production build (`npm run build`), and Chrome DevTools Protocol runtime test

### Checkpoint: Quality & Verification Gate
- [x] Production build succeeds with 0 errors.
- [x] Zero console errors, zero network errors, and interactive button state changes verified via Chrome DevTools Protocol.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Incompatible Card props (`elevation`) | Low | Removed `elevation="sm"`; used Astryx-supported `Card padding={4}`. |
| TableColumn contract mismatch | Medium | Specified typed columns using `{ key, header, width, renderCell }`. |
| Chart container responsive sizing | Low | Maintained template's tested `ResponsiveContainer` aspect-ratio pattern. |

## Open Questions
- None.
