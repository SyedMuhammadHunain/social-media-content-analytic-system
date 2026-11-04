# Spec: Threads-Style Post Composer Redesign (refine_2_ui)

## Objective

Redesign the post composer at the top of the news feed into a minimal Threads-style prompt bar that expands into a dedicated "New Post" creation modal upon interaction. Eliminate all vertical gap between the composer bar and the first feed post card, creating a single contiguous card stream.

Requirements sourced from `refine_2_ui.md` and reference screenshots:
- `~/Pictures/Screenshots/Screenshot From 2026-11-04 20-18-21.png` (Inline composer bar)
- `~/Pictures/Screenshots/Screenshot From 2026-11-04 20-20-26.png` (New Post modal dialog)

## User Stories & Acceptance Criteria

1. **Inline Composer Bar (Feed Top):**
   - Displays current user circular avatar on the left.
   - Displays "What's new?" placeholder text in secondary color.
   - Displays a compact "Post" button on the right.
   - Clicking anywhere on the bar opens the "New Post" modal dialog.
   - Zero-gap attachment: Top border matches card, bottom border seamlessly connects to the first feed post card (`isFirst` / gap 0).

2. **"New Post" Modal Dialog:**
   - Header:
     - Left: "Cancel" button to dismiss without publishing.
     - Center: "New Post" title (explicit requirement: do NOT write "New thread").
     - Right: Empty (explicit requirement: NO icons at top right).
   - Content:
     - Current user avatar and `@username`.
     - Multiline text input with "What's new?" placeholder.
     - Action toolbar with icons for:
       - **Media**: Triggers file picker for images/videos (uploads to Azure Blob / local preview).
       - **GIF**: Opens inline GIF picker popover to select/append animated GIF reactions.
       - **Emoji**: Opens inline Emoji picker popover to select/append emojis to post text.
     - Bottom:
       - Left: Empty (explicit requirement: NO "Post options").
       - Right: "Post" button (submits post and closes modal).

3. **Astryx Strict Compliance:**
   - 100% Meta Astryx components: `Card`, `VStack`, `HStack`, `Avatar`, `Button`, `TextArea`, `Icon`, `Text`, `Heading`.
   - Responsive to Light/Dark theme modes.
   - Zero custom CSS classes; all styling driven by Astryx design tokens.

## Tech Stack & Commands

- **Framework:** React 19, TypeScript 5.8, Vite 8
- **Design System:** Meta Astryx (`@astryxdesign/core`)
- **Commands:**
  - Build: `cd frontend && npm run build`
  - Type Check: `cd frontend && npx tsc -b`
  - Lint: `cd frontend && npx oxlint .`
  - Test: `cd frontend && npm run test:unit`

## Project Structure

```
frontend/src/app/feed/
├── PostComposer.tsx          → Redesigned into compact Threads-style prompt bar
├── PostCreateModal.tsx       → Redesigned into "New Post" modal dialog matching screenshot 2
├── FeedPostList.tsx          → Ensures zero-gap connection between composer and post cards
├── NewsFeedPage.tsx          → Hosts composer and modal with shared mutations
└── PostMediaToolbar.tsx      → Reusable toolbar with Media, GIF, and Emoji pickers
```

## Code Style & Astryx Component Architecture

```tsx
// Inline Prompt Bar
<Card
  padding={3}
  style={{
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: '1px solid var(--color-border-subtle)',
    cursor: 'pointer',
  }}
  onClick={onOpenModal}
>
  <HStack vAlign="center" hAlign="between" gap={3}>
    <HStack vAlign="center" gap={3} style={{ flex: 1 }}>
      <Avatar size="sm" src={currentUser.avatarUrl} name={currentUser.name} />
      <Text type="body" color="secondary">What's new?</Text>
    </HStack>
    <Button size="sm" variant="primary" label="Post" onClick={onOpenModal} />
  </HStack>
</Card>
```

## Testing Strategy

- **Component Verification:** Verify modal open/close transitions, text change events, and keyboard Esc shortcuts.
- **Media Upload Pipeline:** Verify file selection triggers presigned upload or local blob creation.
- **Static Analysis:** `npx tsc -b` and `npx oxlint .` must pass with 0 errors.
- **Unit Tests:** `npm run test:unit` must maintain 100% pass rate (67 tests).

## Boundaries

- **Always:** Use Astryx components and theme variables; support light/dark modes cleanly; preserve Azure Blob upload pipeline.
- **Ask First:** Adding new external npm packages.
- **Never:** Use third-party CSS frameworks; add "New thread", top-right icons, or "Post options" as explicitly prohibited in `refine_2_ui.md`.

## Success Criteria

1. Top composer matches Screenshot 1 (`Screenshot From 2026-11-04 20-18-21.png`).
2. Modal matches Screenshot 2 (`Screenshot From 2026-11-04 20-20-26.png`) with user's explicit exclusions honored.
3. Media, GIF, and Emoji icons functional.
4. Composer bar attaches to first post card with 0px gap.
5. `npx tsc -b` and `npm run build` pass cleanly.

## Open Questions

None — all requirements and constraints resolved from `refine_2_ui.md` and user interview.
