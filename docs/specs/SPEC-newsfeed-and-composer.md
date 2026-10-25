# Spec: Social Media News Feed and Post Composer

## 1. Objective
Build the interactive Post Composer and chronological News Feed interface (PDF Section 4.1). Allow users to compose Text, Image, and Video posts, browse posts from followed users, like/unlike, comment, and follow/unfollow with instant UI state updates using official Meta Astryx Design System components in neutral dark mode.

## 2. Tech Stack & Dependencies
- **UI Framework:** React 19 (`react`, `react-dom`) + TypeScript 5
- **Design System:** Meta Astryx Design System (`@astryxdesign/core` v0.7.4)
- **Theme:** Meta Astryx Neutral Theme (`@astryxdesign/theme-neutral` v0.7.4) in dark mode
- **Styling:** StyleX (`@stylexjs/stylex`) with Astryx CSS custom properties
- **Icons:** `@heroicons/react` (outline + solid)
- **Build & Dev Tooling:** Vite 8.3 + TypeScript (`tsc -b`) + Oxlint

## 3. Commands
- **Dev Server:** `npm run dev` (runs on `http://127.0.0.1:5173/`)
- **Type Check:** `npx tsc -b`
- **Lint Check:** `npm run lint` (`oxlint`)
- **Production Build:** `npm run build` (`tsc -b && vite build`)

## 4. Project Structure
```
frontend/src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx            # Existing Astryx analytics dashboard
│   └── feed/
│       ├── PostComposer.tsx     # Astryx Card with Text/Image/Video format selector & form
│       ├── PostCard.tsx         # Astryx Card with user Avatar, content, media, like/comment actions
│       ├── CommentSection.tsx   # Astryx Card/List with comment items and comment input field
│       └── NewsFeedPage.tsx     # Chronological feed layout with top navigation tab bar
├── types/
│   └── social.ts               # Post, Comment, User, Reaction types matching PDF Section 6/9
├── mock/
│   └── socialSeedData.ts       # Initial chronological posts matching Section 5 capacity ratios
├── App.tsx                     # Top navigation switching between News Feed and Analytics Dashboard
└── main.tsx                    # Astryx Theme provider (<Theme mode="dark">)
```

## 5. Code Style & Conventions
Strictly adhere to Meta Astryx design primitives. No raw `<div>` styling hacks or custom invented CSS classes.
```tsx
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Icon } from '@astryxdesign/core/Icon';

export function ExampleCard({ title, user }: { title: string; user: string }) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <Avatar name={user} size="md" />
          <VStack gap={0}>
            <Heading level={4}>{user}</Heading>
            <Text type="supporting" color="secondary">Just now</Text>
          </VStack>
        </HStack>
        <Text type="body">{title}</Text>
      </VStack>
    </Card>
  );
}
```

## 6. Functional Requirements (PDF Section 4.1 Traceability)
1. **Create Social Media Post (Req 4.1.ii):**
   - User can compose a Text Post, Image Post, or Video Post.
   - Format toggle via Astryx `SegmentedControl` or `TabList` (`Text` | `Image` | `Video`).
   - Text post: content body + hashtags (`#systemdesign #social`).
   - Image/Video post: media URL input + caption + hashtags.
   - Form submission prepends new post to chronological feed immediately.
2. **Chronological News Feed (Req 4.1.vi):**
   - Newest to oldest ordering.
   - Displays author `Avatar`, username, timestamp, content text, media render (image/video player), hashtags, and interaction counters.
3. **Like / Unlike Interaction (Req 4.1.iii):**
   - Interactive Like button with instant toggle and counter increment/decrement.
4. **Comment on Posts (Req 4.1.v):**
   - Collapsible comment drawer/section per post.
   - Text input field + Submit button (`/v1/comment`).
   - Adds comment with author and timestamp in real time.
5. **Follow / Unfollow Creator (Req 4.1.iv):**
   - Follow/Unfollow toggle button on post header.
6. **Top Navigation Switching:**
   - Astryx `TabList` or header buttons toggling between `News Feed` and `Analytics Dashboard`.

## 7. Non-Functional Requirements (PDF Section 4.2)
- **Eventual Consistency / Latency:** Feed updates immediately (<2s feedback).
- **Usability:** Fast rendering without layout shifts; clean dark neutral styling.
- **Accessibility:** Proper button labels, ARIA landmarks, WCAG contrast compliance via theme tokens.

## 8. Boundaries
- **Always do:** Use official Astryx components and theme tokens. Keep branch on `Hunain-Frontend`. Run type checks and build verification.
- **Ask first:** Installing new third-party UI libraries (beyond Astryx and Heroicons).
- **Never do:** Write custom CSS overrides that fight Astryx theme tokens. Never merge to `main` without explicit user instruction.

## 9. Success Criteria
1. `npm run build` succeeds with zero TypeScript and linter errors.
2. Top navigation toggles seamlessly between `News Feed` and `Analytics Dashboard`.
3. User can create Text, Image, and Video posts with validation.
4. Posts list chronologically with interactive Like/Unlike, Comments, and Follow/Unfollow states.
5. DevTools test confirms zero console errors, zero network errors, and proper dark theme rendering.

## 10. Open Questions
None. Intent and constraints confirmed in interview.
