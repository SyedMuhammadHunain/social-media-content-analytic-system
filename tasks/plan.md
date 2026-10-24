# Implementation Plan: Meta Astryx Creator Analytics Dashboard

## Overview
Scaffold Meta's official `dashboard` template from `astryx.atmeta.com/templates` (`npx astryx template dashboard`) into `frontend/`, then adapt its layout to feature the Social Media Content Analysis System's 3 required creator metric graphs:
1. **Followers Graph** (audience growth and net change over time)
2. **Like / Unlike Graph** (comparative positive vs negative reactions)
3. **Engagement Graph** (comments and interaction volume)

## Architecture Decisions
- **Template Foundation:** Direct scaffolding from `@astryxdesign/cli` ensures 100% adherence to Meta Astryx's design tokens, responsive grid layouts, and spacing conventions.
- **Official Charting Engine:** Use Recharts with `@heroicons/react` icons as designed in Meta's official template.
- **Decoupled Data Modeling:** Isolate metric datasets in `types/analytics.ts` and `mock/creatorMetrics.ts` with values derived from Section 5 throughput ratios.

## Task List

### Phase 1: Dependencies & Template Scaffold
- [x] Task 1: Install `recharts` and `@heroicons/react` in `frontend/`
- [x] Task 2: Scaffold official Astryx `dashboard` template to `frontend/src/components/dashboard/DashboardPage.tsx`

### Checkpoint: Scaffold
- [x] Dependencies installed, template scaffolded, and compiles with `npx tsc -b`

### Phase 2: Adaptation & Creator Metrics
- [x] Task 3: Define creator analytics types and mock data generator (`types/analytics.ts`, `mock/creatorMetrics.ts`)
- [x] Task 4: Adapt KPI metric tiles (Followers count, Like/Unlike ratio, Comments/Engagement rate)
- [x] Task 5: Adapt chart slots to render Followers Graph, Like/Unlike Graph, and Engagement Graph

### Checkpoint: Feature Complete
- [x] All 3 PDF graphs rendered inside Astryx cards with mock metrics

### Phase 3: App Mount & Runtime Verification
- [x] Task 6: Mount `DashboardPage` in `frontend/src/App.tsx` within Astryx Theme provider
- [x] Task 7: Execute linter (`oxlint`), production build (`npm run build`), and Chrome DevTools runtime verification

### Checkpoint: Quality & Verification Gate
- [x] Production build succeeds with 0 errors
- [x] Zero console errors or warnings in live browser test

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing sub-components from template | Medium | Inspect scaffolded file immediately and resolve any Astryx export paths |
| Chart container responsive sizing | Low | Retain template's tested `ResponsiveContainer` aspect-ratio pattern |
| React 19 peer warnings | Low | Verified Recharts compatibility with React 19 |

## Open Questions
- None.
