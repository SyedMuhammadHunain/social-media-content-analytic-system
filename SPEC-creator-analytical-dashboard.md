# Spec: Dedicated Creator Analytical Dashboard & Real-Time Sync

## 1. Objective
Update the Social Media Content Analysis System dashboard ([frontend/src/app/dashboard/page.tsx](file:///home/hunain/Projects/social-media-content-analysis-system/frontend/src/app/dashboard/page.tsx)) to replace generic website-traffic demo tables with the 3 dedicated creator analytical graphs specified in the project PDF, and establish live 2-second synchronization between user actions on the News Feed and the analytical dashboard:
1. **Like / Unlike Graph (PDF Section 4.1.vii & 4.2):** Visual comparative bar chart representing user likes vs. unlikes across posts.
2. **Followers Graph (PDF Section 4.1.viii & 4.2):** Audience trend line graph tracking follower growth, gains, and losses over time.
3. **Engagement Graph (PDF Section 4.1.ix & 4.2):** Post comments and interaction area graph demonstrating comments directly proportional to engagement.
4. **Real-Time 2-Second Synchronization (PDF Section 4.2 Non-Functional Requirements):**
   - Liking or unliking a post in the feed updates the Like / Unlike graph and metric within 2 seconds.
   - Following or unfollowing a user updates the Followers graph and total follower count within 2 seconds.
   - Commenting on a post updates the Engagement graph within 2 seconds.

## 2. Tech Stack & Dependencies
- **Framework:** React 19 (`react`, `react-dom` ^19.3.1)
- **Language:** TypeScript 5.8 / 6.0
- **Build Tool:** Vite 8.3
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- **Theme:** Official Astryx `neutral` theme
- **Chart Library:** `recharts` (^3.10.1) — already utilized in Astryx dashboard template
- **Icons:** `@heroicons/react` (^2.2.0)

## 3. Commands
- **Dev Server:** `cd frontend && npm run dev`
- **Type Check:** `cd frontend && npx tsc -b`
- **Lint:** `cd frontend && npm run lint` (`oxlint`)
- **Test Suite:** `cd frontend && npm test`
- **Production Build:** `cd frontend && npm run build`

## 4. Project Structure
```
frontend/src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                     # Dedicated Creator Analytics Dashboard with 3 PDF graphs
│   └── feed/
│       ├── NewsFeedPage.tsx             # Interactive News Feed wired to shared analytics telemetry
│       ├── PostComposer.tsx             # Post creation (Text/Image/Video)
│       └── PostCard.tsx                 # Post interactions (like, follow, comment)
├── context/
│   ├── AnalyticsContext.tsx             # Shared creator telemetry state for real-time 2s sync
│   └── useAnalytics.ts                  # React hook for reading and mutating analytics data
├── mock/
│   └── analyticsSeedData.ts             # Baseline seed data for likes, follower curve, and comments
└── types/
    └── analytics.ts                     # TypeScript interfaces for Like/Unlike, Follower, and Engagement series
```

## 5. Component Anatomy & Astryx Reuse
Reuse existing chart scaffolding from the official Astryx Dashboard template without adding new libraries:

### 5.1 Like / Unlike Graph Component (`LikeUnlikeChart`)
```tsx
<Card padding={5} data-testid="like-unlike-graph">
  <VStack gap={3}>
    <HStack hAlign="between" vAlign="center">
      <VStack gap={1}>
        <Heading level={3}>Like / Unlike Graph</Heading>
        <Text type="supporting" color="secondary">
          PDF Req 4.1.vii • Post likes vs. unlikes ratio over time
        </Text>
      </VStack>
      <Badge variant="blue" label="Live Telemetry" />
    </HStack>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={likeUnlikeData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border, rgba(255,255,255,0.08))" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip content={<AstryxChartTooltip />} />
        <Bar dataKey="likes" name="Likes" fill="var(--color-data-categorical-blue, #0171E3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="unlikes" name="Unlikes" fill="var(--color-data-categorical-pink, #EC4899)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </VStack>
</Card>
```

### 5.2 Followers Trend Graph Component (`FollowersTrendChart`)
```tsx
<Card padding={5} data-testid="followers-trend-graph">
  <VStack gap={3}>
    <HStack hAlign="between" vAlign="center">
      <VStack gap={1}>
        <Heading level={3}>Followers Graph</Heading>
        <Text type="supporting" color="secondary">
          PDF Req 4.1.viii • Audience increasing / decreasing trend curve
        </Text>
      </VStack>
      <HStack gap={2} vAlign="center">
        <Icon icon={ArrowTrendingUpIcon} size="sm" style={{ color: '#10B981' }} />
        <Text type="body" weight="bold" style={{ color: '#10B981' }}>+12.4% this week</Text>
      </HStack>
    </HStack>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={followersData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border, rgba(255,255,255,0.08))" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} />
        <Tooltip content={<AstryxChartTooltip />} />
        <Line type="monotone" dataKey="followers" name="Followers" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </VStack>
</Card>
```

### 5.3 Engagement & Comments Graph Component (`EngagementChart`)
```tsx
<Card padding={5} data-testid="engagement-graph">
  <VStack gap={3}>
    <HStack hAlign="between" vAlign="center">
      <VStack gap={1}>
        <Heading level={3}>Engagement Graph</Heading>
        <Text type="supporting" color="secondary">
          PDF Req 4.1.ix • Comments directly proportional to overall creator engagement
        </Text>
      </VStack>
      <Badge variant="purple" label="Event Driven" />
    </HStack>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={engagementData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border, rgba(255,255,255,0.08))" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip content={<AstryxChartTooltip />} />
        <Line type="monotone" dataKey="comments" name="Comments Count" stroke="#8B5CF6" strokeWidth={2.5} />
        <Line type="monotone" dataKey="engagementScore" name="Total Engagement Score" stroke="#0171E3" strokeWidth={2.5} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  </VStack>
</Card>
```

## 6. Testing Strategy
- Automated integration test suite in `frontend/test/creator_dashboard_analytics.test.mjs` using Chrome DevTools Protocol (CDP):
  1. **Dashboard Mounting:** Verifies `data-testid="like-unlike-graph"`, `data-testid="followers-trend-graph"`, and `data-testid="engagement-graph"` mount cleanly.
  2. **Feed-to-Dashboard Liking Synchronization:** Toggling a like button on a post updates post like count in feed, and reflects in the Dashboard like graph and metric within 2 seconds.
  3. **Feed-to-Dashboard Follow Synchronization:** Following an author in the feed increments author follow status and reflects in the Dashboard followers metric within 2 seconds.
  4. **Feed-to-Dashboard Comment Synchronization:** Submitting a comment adds the comment to post and increments the engagement count in the Dashboard within 2 seconds.
  5. **Top Summary Cards:** Verifies total followers, total likes, engagement rate, and post counts display accurately.

## 7. Boundaries
- **Always:**
  - Strictly use Astryx design tokens and components (`Card`, `VStack`, `HStack`, `Grid`, `Heading`, `Text`, `Badge`, `Icon`).
  - Maintain backwards compatibility with existing authentication and profile test suites.
  - Keep 0 errors on `tsc -b` and `oxlint`.
- **Ask first:**
  - Adding persistent backend server daemons (e.g. Node/Express or Docker containers).
- **Never:**
  - Introduce third-party chart libraries (e.g. Chart.js, D3) beyond existing `recharts`.
  - Delete user profile card, top navigation, or news feed functionality.

## 8. Success Criteria
- [ ] Dashboard displays 3 dedicated creator analytical graphs: Like/Unlike, Followers, Engagement.
- [ ] Like/Unlike actions in Feed reflect in Dashboard metrics within 2 seconds.
- [ ] Follow/Unfollow actions in Feed reflect in Dashboard metrics within 2 seconds.
- [ ] Comment actions in Feed reflect in Dashboard metrics within 2 seconds.
- [ ] All 24 existing tests continue to pass; new test suite passes 100%.
- [ ] `tsc -b`, `oxlint`, and `vite build` complete with 0 errors.

## 9. Open Questions
1. Should time range filters on the dashboard (`24 Hours`, `7 Days`, `30 Days`) slice the mock dataset dynamically or remain fixed to the active session? (Default: slice dynamically between 24h, 7d, and 30d).
