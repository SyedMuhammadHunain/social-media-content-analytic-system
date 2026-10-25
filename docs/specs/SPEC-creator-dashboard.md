# Spec: Creator Analytics Dashboard (Meta Astryx Analytics Dashboard Template)

## Objective
Implement the Creator Analytics Dashboard for the Social Media Content Analysis System by using Meta's official **Analytics Dashboard** template (`id: dashboard`) from `https://astryx.atmeta.com/templates` ("Dashboard" tab) styled with the official **neutral** theme (`npx @astryxdesign/cli theme add neutral`). The three-band layout delivers real-time visual feedback to users based on post reactions, strictly covering Section 4.1 of the system specification:
1. **Followers Graph (Req 4.1.viii):** Audience increasing and decreasing curve over time (`AreaChart`).
2. **Like / Unlike Graph (Req 4.1.vii):** Comparative positive vs negative post reactions (`BarChart`).
3. **Engagement Graph (Req 4.1.ix):** User comments directly proportional to audience engagements (`LineChart`).
4. **Top Content Performance Table:** Breakdown of Text, Image, and Video posts published by the user (`Table`).

## Tech Stack
- **Framework:** React 19 (`react`, `react-dom` ^19.3.1)
- **Language:** TypeScript 5.x / 6.x
- **Build Tool:** Vite 8.x
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`)
- **Theme:** Official Astryx `neutral` theme (`@astryxdesign/theme-neutral/built`)
- **Template Engine:** `@astryxdesign/cli` (`dashboard` / Analytics Dashboard template)
- **Chart Primitives:** `recharts` (^3.x)
- **Icons:** `@heroicons/react` (^2.x)

## Commands
- **Add Theme:** `cd frontend && npx @astryxdesign/cli theme add neutral`
- **Install Chart Dependencies:** `cd frontend && npm install recharts @heroicons/react`
- **Scaffold Official Template:** `cd frontend && npx @astryxdesign/cli template dashboard src/components/dashboard/DashboardPage.tsx --overwrite`
- **Type Check:** `cd frontend && npx tsc -b`
- **Lint:** `cd frontend && npm run lint`
- **Production Build:** `cd frontend && npm run build`
- **Dev Server:** `cd frontend && npm run dev`
- **Browser Runtime Test:** `node /tmp/devtools_test.mjs`

## Project Structure
```
frontend/src/
├── components/
│   └── dashboard/
│       └── DashboardPage.tsx       # Analytics Dashboard three-band layout
├── types/
│   └── analytics.ts                # TypeScript interfaces for creator metrics (TopPostMetric)
├── mock/
│   └── creatorMetrics.ts           # 24h, 7d, and 30d creator metrics derived from Section 5 ratios
├── astryx-themes.ts                # Generated theme registry containing 'neutral'
├── App.tsx                         # Mounts DashboardPage inside the theme container
└── main.tsx                        # Root entry point with Astryx reset.css, astryx.css, & Theme provider
```

## Code Style
- Use official Meta Astryx layout primitives (`Layout`, `LayoutContent`, `VStack`, `HStack`, `Grid`).
- Use Astryx `Card` with `padding={4}` (cards do not accept `elevation`).
- Use Astryx `Table` with typed columns using `key`, `header`, `width: proportional(n)`, and `renderCell: (item) => ReactNode`.
- Use Astryx `Badge` with semantic variants (`success`, `error`, `purple`, `teal`, `neutral`).
- Use Recharts chart components within `ResponsiveContainer` (100% width, fixed pixel height).
- Example:
```tsx
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function FollowersCard({ data }: { data: Array<{ date: string; followers: number }> }) {
  return (
    <Card padding={4}>
      <Heading level={3}>Followers Graph</Heading>
      <Text type="supporting" color="secondary">Audience increasing / decreasing curve across selected timeframe</Text>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="followers" stroke="#1877F2" fill="#E7F3FF" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

## Testing Strategy
- **Type Check:** `cd frontend && npx tsc -b` verifying 0 type errors.
- **Lint Check:** `cd frontend && npm run lint` (oxlint) verifying 0 errors and 0 warnings.
- **Production Build:** `cd frontend && npm run build` verifying clean bundle generation.
- **Runtime DevTools Test:** Automated Chrome DevTools Protocol verification verifying:
  - 0 console errors and 0 console warnings.
  - 0 failed network requests.
  - All 3 Recharts chart containers and 12 SVG visual elements rendered.
  - Timeframe filter buttons (`24 Hours`, `7 Days`, `30 Days`) update metric values correctly.

## Boundaries
- **Always:**
  - Use the official Meta Astryx `dashboard` (`Analytics Dashboard`) template from `astryx.atmeta.com/templates`.
  - Use official Astryx theme `neutral` (`@astryxdesign/theme-neutral`).
  - Maintain the 3 specific requirements from Section 4.1 of the system specification.
  - Test via DevTools and verify 0 console errors before finishing.
- **Ask first:**
  - Switching to administrative infrastructure monitoring (`Service Monitoring Dashboard`).
  - Introducing third-party CSS or non-Astryx layout libraries.
- **Never:**
  - Hardcode raw un-themed CSS or bypass Astryx StyleX theme variables.
  - Commit untested code or leave console errors unresolved.

## Success Criteria
- [x] Official `neutral` theme added and active via `npx @astryxdesign/cli theme add neutral`.
- [x] Official Meta Astryx `dashboard` (Analytics Dashboard) scaffolded in `frontend/src/components/dashboard/DashboardPage.tsx`.
- [x] Three mandatory PDF graphs rendered: Followers Graph, Like / Unlike Graph, Engagement Graph.
- [x] Top Creator Content Performance table rendered with format badges (`Video`, `Image`, `Text`).
- [x] Dynamic timeframe filter buttons (`24h`, `7d`, `30d`) and refresh button interactive.
- [x] Mounted in `App.tsx` and wrapped in `<Theme theme={themes['neutral']}>`.
- [x] `npx tsc -b`, `npm run lint`, and `npm run build` pass with 0 errors.
- [x] Headless Chrome DevTools Protocol test confirms 0 console errors, 0 network errors, and visual chart rendering.

## Open Questions
- None. Requirements and template selection confirmed.
