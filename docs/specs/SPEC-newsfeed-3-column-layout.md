# Spec: News Feed 3-Column Social Discovery Architecture

## Objective
Enrich the desktop News Feed experience by replacing the blank lateral gutters with an enterprise 3-column social layout adhering strictly to Meta Astryx design patterns.
- **Left Rail (280px):** [UserProfileCard.tsx](file:///home/hunain/Projects/social-media-content-analysis-system/frontend/src/components/profile/UserProfileCard.tsx) paired with new `FeedShortcutsCard` (All Posts, Media Only, Bookmarks, and Creator Dashboard link).
- **Center Rail (680px):** Chronological feed with [PostComposer.tsx](file:///home/hunain/Projects/social-media-content-analysis-system/frontend/src/app/feed/PostComposer.tsx), [PostCard.tsx](file:///home/hunain/Projects/social-media-content-analysis-system/frontend/src/app/feed/PostCard.tsx), and active filter indicator pill.
- **Right Rail (320px):** `TrendingTopicsCard` (top hashtags with volume), `WhoToFollowCard` (suggested creators with instant follow toggle), and `PlatformInfoFooter` (OOAD academic metadata).
- **Interactivity:** Clicking a hashtag or shortcut filters feed in-place without page reload; follow toggle syncs state reactively across feed posts and analytics.

## Tech Stack
- **Design System:** Strictly Meta Astryx (`@astryxdesign/core`)
- **Frontend Framework:** React 19, TypeScript 5.8, Vite 8
- **Testing:** Node.js native test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP)

## Commands
- Build: `cd frontend && npm run build`
- Test: `cd frontend && npm test`
- Typecheck: `cd frontend && npx tsc -b`
- Lint: `cd frontend && npm run lint`
- Dev Server: `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`

## Project Structure
```
frontend/
  src/
    app/
      feed/
        NewsFeedPage.tsx           # Layout container, active filter & bookmark state
        FeedShortcutsCard.tsx      # Left rail navigation shortcuts
        TrendingTopicsCard.tsx     # Right rail trending hashtags with counts
        WhoToFollowCard.tsx        # Right rail recommended creators with follow toggle
        PlatformInfoFooter.tsx     # Right rail academic OOAD footer
        PostComposer.tsx           # Post creator
        PostCard.tsx               # Post card with bookmark toggle
    mock/
      socialSeedData.ts          # Seed data for trending tags and recommended users
  tests/
    feed-3-column-layout.test.ts # Native node:test suite covering all new widgets
docs/
  specs/
    SPEC-newsfeed-3-column-layout.md
```

## Code Style
Strictly adhere to Meta Astryx component composition:
```tsx
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Avatar } from '@astryxdesign/core/Avatar';

export function WhoToFollowCard({ users, onToggleFollow }: WhoToFollowCardProps) {
  return (
    <Card padding={4} elevation="low">
      <VStack gap={3}>
        <Heading level={4}>Who to Follow</Heading>
        {users.map(u => (
          <HStack key={u.id} justify="space-between" vAlign="center">
            <HStack gap={2} vAlign="center">
              <Avatar src={u.avatarUrl} alt={u.name} size="sm" />
              <VStack gap={0}>
                <Text type="body" weight="medium">{u.name}</Text>
                <Text type="caption" color="secondary">@{u.username}</Text>
              </VStack>
            </HStack>
            <Button
              size="sm"
              variant={u.isFollowed ? 'secondary' : 'primary'}
              onPress={() => onToggleFollow(u.id)}
            >
              {u.isFollowed ? 'Following' : 'Follow'}
            </Button>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
}
```

## Testing Strategy
1. **Component Unit Tests:** Verify `FeedShortcutsCard`, `TrendingTopicsCard`, `WhoToFollowCard`, and `PlatformInfoFooter` render correct Astryx elements, labels, and badges.
2. **Interactive State Tests:**
   - Filter selection ("Media Only", "Bookmarks", `#systemdesign`) computes correct subset of posts.
   - Clicking "Clear Filter" restores complete post feed.
   - Follow toggle updates user state and calls `recordFollowToggle`.
3. **End-to-End DevTools Verification:** Confirm responsive 3-column layout at 1440px desktop, 1024px tablet, and 375px mobile viewports via CDP.

## Boundaries
- **Always:** Use Meta Astryx core components (`Card`, `Badge`, `Avatar`, `Button`, `VStack`, `HStack`, `Text`, `Heading`, `Divider`).
- **Always:** Preserve backwards compatibility with existing feed capabilities (composer, edit, delete, comments, likes).
- **Ask first:** Modifying core `Post` or `UserProfile` schema in `types/social.ts`.
- **Never:** Use raw unstyled HTML buttons or ad-hoc custom CSS stylesheets.
- **Never:** Break existing test suites (`36/36` tests must stay green).

## Success Criteria
1. On viewports `>= 1280px`, Left Rail (`280px`), Center Rail (`680px`), and Right Rail (`320px`) display side-by-side without horizontal scrolling.
2. `FeedShortcutsCard` renders with All Posts, Media Only, Bookmarks, and Creator Analytics jump link.
3. `TrendingTopicsCard` displays top 5 hashtags with formatted post counts (`1.4k posts`, etc.).
4. Clicking any hashtag filters center feed in-place and renders active filter chip: `Filtered by #tag (N posts)` with `Clear` button.
5. `WhoToFollowCard` displays 3 suggested creators with interactive `Follow`/`Following` toggle wired to feed post author state and `useAnalytics`.
6. `PlatformInfoFooter` renders course metadata and Meta Astryx system signature.
7. Layout collapses gracefully on smaller screens: hides right rail below `1280px`, stacks left rail below `1024px`.
8. `cd frontend && npm test` and `cd frontend && npx tsc -b` pass with zero errors.

## Open Questions
- None. All requirements clarified and confirmed during intent interview.
