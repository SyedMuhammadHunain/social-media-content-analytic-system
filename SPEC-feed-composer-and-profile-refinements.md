# Spec: News Feed, Post Composer & Profile Layout Refinements

## 1. Objective
Refine the Social Media Content Analysis System across four core interaction areas:
1. **Fixed Left Profile Card & Centered Feed:** Pin the left `UserProfileCard` (`position: sticky; top: 24px;`) so it stays visible while the centered news feed stream scrolls smoothly.
2. **Unified Post Composer with Local PC Media Attachment:** Replace the 3 separate post-type tabs (`Text`, `Image`, `Video`) with a single unified composer. Allow users to select image or video files directly from their PC, displaying an inline preview with removal option and automatically setting post type (`IMAGE`, `VIDEO`, `TEXT`).
3. **Correct Profile Avatar Placement:** Position the avatar anchored to the bottom-left edge of the cover banner, overlapping smoothly into the identity section with a background-matching ring border (`border: 4px solid var(--color-background-body)`).
4. **Profile Photo & Cover Banner Upload:** Allow users to upload and change both their Profile Avatar and Cover Banner image directly from their local PC using file pickers, updating profile state in real-time.

## 2. Tech Stack & Official Dependencies
- **UI Framework:** React 19 + TypeScript 5.8 + Vite 8.3
- **Official Astryx Design System Components:**
  - `@astryxdesign/core/ClickableCard` (`ClickableCard`)
  - `@astryxdesign/core/Card` (`Card`)
  - `@astryxdesign/core/Avatar` (`Avatar`)
  - `@astryxdesign/core/AspectRatio` (`AspectRatio`)
  - `@astryxdesign/core/Badge` (`Badge`)
  - `@astryxdesign/core/Banner` (`Banner`)
  - `@astryxdesign/core/Button` (`Button`)
  - `@astryxdesign/core/Skeleton` (`Skeleton`)
  - `@astryxdesign/core/TabList` (`TabList`, `Tab`)
  - `@astryxdesign/core/TextArea` (`TextArea`)
  - `@astryxdesign/core/Toolbar` (`Toolbar`)
  - `@astryxdesign/core/Markdown` (`Markdown`)
  - `@astryxdesign/core/Layout` (`Layout`, `LayoutContent`, `HStack`, `VStack`)
  - `@astryxdesign/core/Text` (`Heading`, `Text`)
  - `@astryxdesign/core/Divider` (`Divider`)
- **Icons:** `@heroicons/react/24/outline` (`PhotoIcon`, `VideoCameraIcon`, `ArrowLeftIcon`, `XMarkIcon`, `ArrowUpTrayIcon`)

## 3. Commands
- **Dev Server:** `cd frontend && npm run dev`
- **Type Check:** `cd frontend && npx tsc -b`
- **Lint Check:** `cd frontend && npm run lint` (`oxlint`)
- **Test Suite:** `cd frontend && npm test`
- **Build:** `cd frontend && npm run build`

## 4. Project Structure
```
frontend/src/
├── app/
│   └── feed/
│       ├── NewsFeedPage.tsx       # Sticky left sidebar (300px) + centered feed stream (680px)
│       ├── PostComposer.tsx       # Unified composer with local media file attachment
│       └── PostCard.tsx           # Feed post card
├── components/
│   └── profile/
│       ├── UserProfileCard.tsx    # Left sidebar clickable card
│       ├── UserProfileView.tsx    # Full profile view with banner/avatar uploads and overlapping avatar
│       └── ProfileBioEditor.tsx   # Rich bio markdown viewer & editor
├── mock/
│   └── socialSeedData.ts          # Seed user and posts data
└── types/
    └── social.ts                  # UserProfile, Post, CreatePostInput types
```

## 5. Code Style & Astryx Component Anatomy

### 5.1 Sticky Sidebar & Centered Feed Layout (`NewsFeedPage.tsx`)
```tsx
<div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'center' }}>
  {/* Sticky Left Profile Card */}
  <aside style={{ flex: '0 0 280px', position: 'sticky', top: 24, zIndex: 10 }}>
    <UserProfileCard user={user} onOpenProfile={handleOpenProfile} />
  </aside>

  {/* Centered Scrollable Feed Stream */}
  <main style={{ flex: '1 1 680px', maxWidth: 680, minWidth: 0 }}>
    <VStack gap={6}>
      <PostComposer currentUser={user} onCreatePost={handleCreatePost} />
      {/* Posts */}
    </VStack>
  </main>
</div>
```

### 5.2 Unified Post Composer with PC Media Selection (`PostComposer.tsx`)
- Eliminates 3 type tabs (`Text`, `Image`, `Video`).
- Single `TextArea` for post text and hashtags.
- "Add Photo/Video" button triggering a hidden `<input type="file" accept="image/*,video/*" />`.
- Reads selected file via `URL.createObjectURL(file)`.
- Displays thumbnail preview with a remove button (`XMarkIcon`).
- Automatically assigns `type: 'IMAGE'` or `VIDEO` when media is attached, defaulting to `TEXT`.

### 5.3 Overlapping Avatar & Image Uploads (`UserProfileView.tsx`)
- **Banner Container:** `AspectRatio ratio={4 / 1}` with overlay "Upload Banner" button (`ArrowUpTrayIcon`).
- **Avatar Container:** Positioned at `bottom: -48px; left: 32px; position: absolute;` or negative offset, with `border: 4px solid var(--color-background-body, #111111); border-radius: 9999px;` and "Change Photo" action overlay.
- Clicking either triggers a hidden file input and updates `user.avatarUrl` or `user.coverBannerUrl`.

## 6. Testing Strategy
- Automated Node test runner (`node:test`) + Chrome DevTools Protocol (`CDP`).
- Test suite in `frontend/test/refinements_feed_and_profile.test.mjs`:
  1. Verify left profile card has `position: sticky` and feed is centered.
  2. Verify unified post composer has no multi-tabs and allows media attachment.
  3. Verify profile page displays avatar overlapping the banner with ring border.
  4. Verify avatar upload and banner upload trigger file selection and update profile view.
  5. Verify full test suite `npm test` passes 100%.

## 7. Boundaries
- **Always do:**
  - Strictly use official `@astryxdesign/core` components and style tokens.
  - Keep active development on git branch `Hunain-Frontend`.
  - Maintain 100% clean builds (`npx tsc -b`, `oxlint`, `npm test`, `vite build`).
- **Ask first:**
  - Modifying backend APIs or database schemas.
  - Adding third-party packages for file uploads.
- **Never do:**
  - Hardcode unthemed colors.
  - Introduce raw HTML styling replacing Astryx components.
  - Merge to `main` without explicit human instruction.

## 8. Success Criteria
1. Left profile card remains sticky at `top: 24px` while feed scrolls smoothly.
2. News feed is horizontally centered.
3. Post composer has a single unified interface with local media upload from PC.
4. Profile avatar cleanly overlaps cover banner with ring border.
5. User can change avatar photo and cover banner from their PC.
6. `npx tsc -b`, `npm run lint`, `npm run build`, and `npm test` pass with 0 errors.

## 9. Open Questions
None. All 4 features and layout behaviors confirmed during interview.
