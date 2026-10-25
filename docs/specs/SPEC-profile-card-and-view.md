# Spec: User Profile Card & Full Profile View

## 1. Objective
Equip the Social Media Content Analysis System with a left-sidebar User Profile Card (`ClickableCard`) on the News Feed, providing immediate identity context for the active user (`Syed Muhammad Hunain`). Clicking anywhere on this card transitions to a dedicated full-page User Profile View featuring a cover banner (`AspectRatio`), avatar (`Avatar`), user tags (`Badge`), an interactive rich bio editor (`TextArea`, `Toolbar`, `Markdown`), confirmation alerts (`Banner`), and the user's past post history (`Card`, `TabList`, `Skeleton`, `PostCard`), with a "Back to Feed" navigation button.

## 2. Tech Stack & Official Dependencies
Strictly use official Meta Astryx components with zero invented HTML/CSS wrappers:
- **Profile Card Primitives:** `@astryxdesign/core/ClickableCard` (`ClickableCard`)
- **Profile Page Primitives:** `@astryxdesign/core/Card` (`Card`), `@astryxdesign/core/AspectRatio` (`AspectRatio`)
- **Identity & Feedback:** `@astryxdesign/core/Avatar` (`Avatar`), `@astryxdesign/core/Badge` (`Badge`), `@astryxdesign/core/Banner` (`Banner`), `@astryxdesign/core/Skeleton` (`Skeleton`)
- **Bio & Rich Text Editing:** `@astryxdesign/core/TextArea` (`TextArea`), `@astryxdesign/core/Toolbar` (`Toolbar`), `@astryxdesign/core/Markdown` (`Markdown`)
- **Navigation & Actions:** `@astryxdesign/core/Button` (`Button`), `@astryxdesign/core/TabList` (`TabList`, `Tab`)
- **Typography & Layout Primitives:** `@astryxdesign/core/Text` (`Heading`, `Text`), `@astryxdesign/core/Layout` (`HStack`, `VStack`), `@astryxdesign/core/Divider` (`Divider`), `@astryxdesign/core/Icon` (`Icon`)
- **Icons:** `@heroicons/react/24/outline` (`ArrowLeftIcon`, `PencilSquareIcon`, `CheckIcon`, `XMarkIcon`, `SparklesIcon`, `DocumentTextIcon`, `PhotoIcon`, `UserIcon`, `ChatBubbleBottomCenterTextIcon`, `HeartIcon`)
- **Language & Build:** React 19 + TypeScript 5.8 + Vite 8.3

## 3. Commands
- **Dev Server:** `cd frontend && npm run dev`
- **Type Check:** `cd frontend && npx tsc -b`
- **Lint Check:** `cd frontend && npm run lint` (`oxlint`)
- **Test Suite:** `cd frontend && npm test`
- **Production Build:** `cd frontend && npm run build`

## 4. Project Structure
```
frontend/src/
├── components/
│   ├── nav/
│   │   └── AppTopNav.tsx           # Official clean TopNav
│   └── profile/
│       ├── UserProfileCard.tsx     # Left-sidebar ClickableCard widget
│       ├── UserProfileView.tsx     # Full-page profile view
│       └── ProfileBioEditor.tsx    # Rich bio viewer & editor (Markdown, TextArea, Toolbar, Banner)
├── app/
│   └── feed/
│       ├── NewsFeedPage.tsx        # 2-column layout (Profile Card + Feed Stream), view switcher
│       ├── PostComposer.tsx        # Post composer
│       ├── PostCard.tsx            # Post card
│       └── CommentSection.tsx      # Comment drawer
├── mock/
│   └── socialSeedData.ts           # Current user definition and authored posts
└── types/
    └── social.ts                   # UserProfile interface and post types
```

## 5. Code Style & Astryx Component Anatomy

### 5.1 Left Profile Card (`UserProfileCard.tsx`)
```tsx
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';

export function UserProfileCard({ user, onOpenProfile }: UserProfileCardProps) {
  return (
    <ClickableCard
      label={`View full profile for ${user.name}`}
      onClick={onOpenProfile}
      variant="default"
    >
      <VStack gap={3} align="stretch">
        <HStack gap={3} vAlign="center">
          <Avatar name={user.name} src={user.avatarUrl} size="lg" />
          <VStack gap={0}>
            <Heading level={4}>{user.name}</Heading>
            <Text type="supporting" color="secondary">@{user.handle}</Text>
          </VStack>
        </HStack>
        <Text type="body">{user.headline}</Text>
        <HStack gap={2} wrap="wrap">
          {user.tags.map(tag => (
            <Badge key={tag} label={tag} variant="neutral" />
          ))}
        </HStack>
        <Divider />
        <HStack hAlign="between">
          <Text type="supporting" color="secondary">Followers: <strong>{user.followerCount}</strong></Text>
          <Text type="supporting" color="secondary">Following: <strong>{user.followingCount}</strong></Text>
        </HStack>
      </VStack>
    </ClickableCard>
  );
}
```

### 5.2 Rich Bio Editor with Banner Feedback (`ProfileBioEditor.tsx`)
```tsx
import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';

export function ProfileBioEditor({ bio, onSaveBio }: ProfileBioEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(bio);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  return (
    <Card variant="default">
      <VStack gap={3} align="stretch">
        {showSavedBanner && (
          <Banner
            status="success"
            title="Bio updated successfully"
            description="Your public profile about section has been updated."
            onDismiss={() => setShowSavedBanner(false)}
          />
        )}
        <HStack hAlign="between" vAlign="center">
          <Heading level={3}>About</Heading>
          {!isEditing && (
            <Button
              label="Edit Bio"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            />
          )}
        </HStack>
        {isEditing ? (
          <VStack gap={2}>
            <Toolbar
              label="Bio formatting toolbar"
              startContent={
                <HStack gap={1}>
                  <Button label="Bold" size="sm" variant="ghost" onClick={() => setContent(c => c + ' **bold**')} />
                  <Button label="Code" size="sm" variant="ghost" onClick={() => setContent(c => c + ' `code`')} />
                </HStack>
              }
            />
            <TextArea
              label="About Bio"
              isLabelHidden
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
            />
            <HStack gap={2} hAlign="end">
              <Button label="Cancel" variant="ghost" size="sm" onClick={() => setIsEditing(false)} />
              <Button label="Save Changes" variant="primary" size="sm" onClick={() => {
                onSaveBio(content);
                setIsEditing(false);
                setShowSavedBanner(true);
              }} />
            </HStack>
          </VStack>
        ) : (
          <Markdown content={content} />
        )}
      </VStack>
    </Card>
  );
}
```

### 5.3 Full Profile View (`UserProfileView.tsx`)
Composes:
- `AspectRatio` cover banner with Astryx background styling.
- `Avatar` overlay (`size="xl"` / 96px).
- Profile details (Name, handle, tags, follower counters).
- `ProfileBioEditor` component.
- Past Post History:
  - `TabList` with `Tab` for "All Posts" and "Media".
  - `Skeleton` loading simulation when switching/loading tabs.
  - Renders user's authored `PostCard` items.
- "Back to Feed" `Button` at top with `ArrowLeftIcon`.

## 6. Testing Strategy
- **Framework:** `node:test` + Node v24 built-in test runner via `npm test`.
- **Test File:** `frontend/test/profile_card_and_view.test.mjs`.
- **Assertions:**
  1. Profile card renders in feed with user avatar, name, tags, and headline.
  2. Clicking `ClickableCard` transitions view state to Full Profile View.
  3. Full Profile View renders cover banner (`AspectRatio`), avatar, and tags.
  4. About Bio editor switches to edit mode with `TextArea` + `Toolbar`, saves content, and displays success `Banner`.
  5. Past Post History renders author's posts with `Skeleton` loaders on initial render.
  6. Clicking "Back to Feed" button returns to standard news feed view.

## 7. Boundaries
- **Always do:**
  - Strictly use official `@astryxdesign/core` components (`ClickableCard`, `Card`, `Avatar`, `AspectRatio`, `Banner`, `Skeleton`, `Badge`, `TextArea`, `Toolbar`, `Markdown`, `Button`, `TabList`).
  - Keep active development on git branch `Hunain-Frontend`.
  - Maintain 100% clean builds (`npx tsc -b`, `oxlint`, `npm test`, `vite build`).
- **Ask first:**
  - Introducing third-party profile packages or external style sheets.
  - Modifying top-level routing or global state outside `NewsFeedPage` / `App`.
- **Never do:**
  - Write raw HTML `<div class="card">` or custom CSS classes for cards and banners.
  - Hardcode un-themed colors outside Astryx tokens.
  - Merge to `main` without explicit human instruction.

## 8. Success Criteria
1. `npm test` passes with 100% green assertions.
2. `npx tsc -b`, `npm run lint`, and `npm run build` succeed with zero errors.
3. Left-sidebar `ClickableCard` renders cleanly on desktop next to the news feed stream.
4. Clicking anywhere on the card switches view to the full profile page.
5. Full profile displays cover banner, avatar, about section, and past posts.
6. Editing bio updates text and displays Astryx success `Banner`.
7. Post history displays `Skeleton` loading placeholders and author's posts.
8. "Back to Feed" button returns seamlessly to the news feed.

## 9. Open Questions
None. Scope, components, and interactions confirmed during interview.
