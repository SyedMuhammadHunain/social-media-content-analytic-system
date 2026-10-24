# Spec: Creator Analytics Dashboard (Meta Astryx Official Template)

## Objective
Implement the Creator Analytics Dashboard for the Social Media Content Analysis System by scaffolding Meta's official `dashboard` template from `astryx.atmeta.com/templates` (`npx astryx template dashboard`) and adapting its three-band layout to feature our 3 PDF-mandated creator graphs:
1. **Followers Graph:** Audience growth and follower net change over time.
2. **Like / Unlike Graph:** Comparative positive vs negative post reaction metrics.
3. **Engagement Graph:** Comments and audience engagement volume over time.

## Tech Stack
- **Framework:** React 19 (`react`, `react-dom` ^19.3.1)
- **Language:** TypeScript 5.x / 6.x
- **Build Tool:** Vite 8.x
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`)
- **Template Engine:** `@astryxdesign/cli` (`dashboard` template)
- **Chart Primitives:** `recharts` (^2.x / ^3.x)
- **Icons:** `@heroicons/react` (^2.x)

## Commands
- **Install Template Dependencies:** `cd frontend && npm install recharts @heroicons/react`
- **Scaffold Official Template:** `cd frontend && npx astryx template dashboard src/components/dashboard/DashboardPage.tsx --overwrite`
- **Type Check:** `cd frontend && npx tsc -b`
- **Lint:** `cd frontend && npm run lint`
- **Build:** `cd frontend && npm run build`
- **Dev Server:** `cd frontend && npm run dev`

## Project Structure
```
frontend/src/
├── components/
│   └── dashboard/
│       ├── DashboardPage.tsx       # Scaffolding from Meta Astryx official template
│       ├── FollowersChart.tsx      # Followers Graph (Area/Line)
│       ├── LikesUnlikesChart.tsx   # Like / Unlike Graph (Bar)
│       └── EngagementChart.tsx     # Engagement Graph (Bar/Line)
├── types/
│   └── analytics.ts                # TypeScript interfaces for creator metrics
├── mock/
│   └── creatorMetrics.ts           # Realistic creator metrics matching Section 5 ratios
├── App.tsx                         # Renders DashboardPage inside Astryx Theme
└── main.tsx                        # Root entry point with Astryx CSS & Theme provider
```

## Code Style
- Use official Meta Astryx component imports (`@astryxdesign/core/Layout`, `@astryxdesign/core/Card`, `@astryxdesign/core/Grid`, `@astryxdesign/core/Text`, `@astryxdesign/core/Button`).
- Maintain exact StyleX / Astryx conventions from the scaffolded template.
- Embed Recharts within `ResponsiveContainer` wrapped in Astryx `Card` surfaces.
- Example:
```tsx
import { Card } from '@astryxdesign/core/Card'
import { Heading, Text } from '@astryxdesign/core/Text'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export const FollowersCard = ({ data }: { data: Array<{ date: string; followers: number }> }) => (
  <Card elevation="sm">
    <Heading level={3}>Followers Graph</Heading>
    <Text tone="neutral">Audience growth and retention over time</Text>
    <div style={{ width: '100%', height: 260, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="followers" stroke="var(--primary)" fill="var(--primary-subtle)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
)
```

## Testing Strategy
- **Type Check:** `npx tsc -b` confirms zero type errors across Astryx components, Recharts, and template props.
- **Linter:** `oxlint` passes with zero errors and zero warnings.
- **Production Build:** `npm run build` succeeds cleanly.
- **Runtime DevTools Test:** Headless Chrome verification ensures:
  - Full three-band layout renders with headline tiles, chart cards, and data table.
  - All 3 metric graphs render interactive SVG elements (`<svg>`, `<path>`, `<rect>`).
  - Zero console errors or unhandled exceptions.

## Boundaries
- **Always:**
  - Scaffold and run the official Meta Astryx `dashboard` template directly via `npx astryx template dashboard`.
  - Maintain the 3 specific requirements from Section 4.1 of the PDF (Follower graph, Like/Unlike graph, Engagement graph).
  - Verify `npm run build` passes with zero errors before committing.
- **Ask first:**
  - Changing the base theme from `neutral` to another Astryx theme (`butter`, `chocolate`, `matcha`, etc.).
  - Adding UI dependencies outside `recharts` and `@heroicons/react`.
- **Never:**
  - Replace Astryx layout primitives with external CSS frameworks (e.g. Tailwind).
  - Mutate root repository requirement documents.

## Success Criteria
- [ ] Dependencies `recharts` and `@heroicons/react` installed cleanly.
- [ ] Official Meta Astryx `dashboard` template scaffolded into `frontend/src/components/dashboard/DashboardPage.tsx`.
- [ ] Template adapted to feature the 3 PDF-mandated graphs (Followers, Likes/Unlikes, Engagement) alongside KPI headline cards.
- [ ] `DashboardPage` mounted in `App.tsx` inside the Astryx `<Theme>` provider.
- [ ] `npx tsc -b` and `npm run build` succeed with 0 errors.
- [ ] Browser runtime test confirms SVG chart rendering and clean console.

## Open Questions
- None.
