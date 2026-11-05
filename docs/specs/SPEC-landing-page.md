# SPEC-landing-page: Astryx Gallery Hero Landing Page

## Objective
Build a standalone, high-craft public landing page for the Social Media Content Analysis System using Meta Astryx (`@astryxdesign/core`) components and Astryx icons only.
The landing page serves as the entry surface for unauthenticated visitors, presenting the product hero, actionable entry points, and an auto-scrolling 4-item photo grid marquee with placeholder image slots ready for user-provided imagery.

### Core User Stories & Behaviors
- **Visitor Lands on App**: When an unauthenticated visitor opens the root application, they see the Astryx Gallery Hero landing page instead of directly dropping onto the login form.
- **"Get Started" Click**: Navigates the visitor directly to the existing Astryx `LoginCardPage` (`./src/app/login-card/page.tsx`).
- **"Learn More" Click**: Retained as a secondary action button with a no-op handler (`onClick={() => {}}`), in compliance with user specifications.
- **Infinite Smooth Photo Marquee**: Displays 4 image slot cards that continuously and smoothly move from right to left using CSS animation / transform without jarring pauses or jump cuts.
- **Image Placeholder Slots**: Clean, styled Astryx placeholder slots (using `AspectRatio`, `Card`, or `Box` with Astryx tokens) left ready for the user to insert images (4 total).
- **Icon Integrity**: All iconography strictly imports from `@astryxdesign/core` (e.g. `ArrowRightIcon`, `SparklesIcon`, etc.). Zero third-party or Lucide/Heroicon icon imports.

## Tech Stack
- **Framework**: React 19, TypeScript 5.8 / 6.0, Vite 8.
- **Design System**: Meta Astryx (`@astryxdesign/core` v0.7.4, `@astryxdesign/theme-neutral` v0.7.4).
- **Styling Architecture**: StyleX (`@stylexjs/stylex`) and Astryx Design Tokens. Strictly zero ad-hoc CSS libraries.
- **Testing**: Node.js native test runner (`node --test`), Testing Library (`@testing-library/react`).

## Commands
- **Template Scaffold**: `cd frontend && npx @astryxdesign/cli template gallery-hero ./src/app/gallery-hero`
- **Lint**: `cd frontend && npm run lint`
- **Typecheck**: `cd frontend && npx tsc -b`
- **Unit & Integration Test**: `cd frontend && npm test`
- **Dev Server**: `cd frontend && npm run dev`

## Project Structure
```
frontend/src/
├── app/
│   ├── gallery-hero/
│   │   ├── page.tsx               # Main GalleryHeroLandingPage component
│   │   └── MarqueeTrack.tsx       # Smooth continuous right-to-left scrolling track
│   ├── login-card/page.tsx        # Existing login view
│   └── feed/NewsFeedPage.tsx      # Authenticated newsfeed view
├── App.tsx                        # Unauthenticated view router (landing vs login)
docs/
└── specs/
    └── SPEC-landing-page.md       # This specification
```

## Code Style
Strict adherence to Astryx component composition and StyleX token conventions:
```tsx
import { Layout, LayoutContent } from '@astryxdesign/core/layout';
import { VStack, HStack } from '@astryxdesign/core/stack';
import { Heading } from '@astryxdesign/core/heading';
import { Text } from '@astryxdesign/core/text';
import { Button } from '@astryxdesign/core/button';
import { AspectRatio } from '@astryxdesign/core/aspect-ratio';
import { ArrowRightIcon } from '@astryxdesign/core/icons';

export function GalleryHeroLandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <Layout padding={6}>
      <LayoutContent padding={6}>
        <VStack gap={10} align="center">
          <Heading level={1}>Analyze Social Media at Meta Scale</Heading>
          <HStack gap={3}>
            <Button variant="primary" endSlot={<ArrowRightIcon />} onClick={onGetStarted}>
              Get Started
            </Button>
            <Button variant="secondary" onClick={() => {}}>
              Learn More
            </Button>
          </HStack>
          {/* Smooth Right-to-Left 4-Photo Marquee */}
        </VStack>
      </LayoutContent>
    </Layout>
  );
}
```

## Testing Strategy
- **Framework**: `node:test` + `@testing-library/react`.
- **Test File**: `frontend/test/landing_page_astryx.test.mjs`.
- **Coverage**:
  1. Renders headline, "Get Started" button, and "Learn More" button.
  2. Renders 4 placeholder photo slots with proper aspect ratio structure.
  3. Clicking "Get Started" fires the navigation callback to show the Login page.
  4. Clicking "Learn More" does not produce errors or unwanted navigation.
  5. Verified against `tsc -b` for strict type validity with `@astryxdesign/core`.

## Boundaries
- **Always do**:
  - Use official Astryx primitives (`Heading`, `Text`, `Button`, `Layout`, `AspectRatio`, `HStack`, `VStack`).
  - Use Astryx tokens for colors and spacing (`var(--color-...)`, StyleX tokens).
  - Use Astryx icons only from `@astryxdesign/core/icons`.
  - Provide an option or button in `LoginCardPage` or browser back to return to the landing page if needed.
- **Ask first**:
  - Adding any external animation or marquee library (e.g. Framer Motion, Splide).
  - Modifying existing backend endpoints or database schemas.
- **Never do**:
  - Introduce Lucide, Heroicons, or FontAwesome in the landing page.
  - Write ad-hoc CSS stylesheets or inline raw hex colors outside Astryx tokens.
  - Break existing authentication tests or NewsFeed integration flows.

## Success Criteria
- [ ] Scaffolded cleanly via `npx @astryxdesign/cli template gallery-hero ./src/app/gallery-hero`.
- [ ] Displays 4 placeholder photo slots moving continuously and smoothly from right to left.
- [ ] "Get Started" smoothly switches view to the Astryx Login page.
- [ ] "Learn More" is active and clickable as a no-op.
- [ ] Zero TypeScript errors (`npx tsc -b`).
- [ ] Linter passes (`npm run lint`).
- [ ] Full automated test suite passes (`npm test`).

## Open Questions
- None currently blocking. Image placeholder dimensions set to default standard 16:9 / 4:3 aspect ratios until image assets are provided.
