# Implementation Plan: Mobile Refinements & Animated GIF Integration

Spec: `docs/specs/SPEC-mobile-responsive-navigation.md`

## Overview
Decompose the requested refinements into two focused, verifiable slices:
1. **Task 4 (Mobile Post Actions & Header)**: Verify top-left Hamburger, centered App Logo without text, and render post action buttons (Like, Comment, Bookmark, Share) icon-only without text strings on mobile viewports (< 768px).
2. **Task 5 (Animated GIF Provider & Search)**: Upgrade `GifPickerPopover` with search input, instant keyword filtering, animated `.gif` reaction library (Tenor/Giphy CDN animated assets), custom GIF link input, and seamless attachment to the post composer.

## Architecture Decisions
- **Mobile Icon-Only Actions:** Scope `@media (max-width: 767px)` rules so post action buttons in `PostCardActionBar.tsx` hide text labels on mobile while keeping labels and counts on desktop screens (≥ 768px). Maintain `aria-label` for screen reader accessibility.
- **GIF Provider & Search Architecture:**
  - In `MediaPickerPopovers.tsx`, create an expandable search-driven GIF picker.
  - Curate popular animated reaction GIFs categorized by keywords (e.g., `celebration`, `clap`, `funny`, `mind blown`, `dance`, `fire`, `love`, `thumbs up`, `agree`, `shocked`, `cat`).
  - Search input filters GIFs by title, category, and tags in real time.
  - Custom GIF URL input tab allows pasting any valid animated GIF link directly.
  - Selected GIF attaches to `PostComposerForm` / `PostCreateModal` as `mediaUrl` and renders in `PostMediaViewer.tsx`.

## Task List

### Phase 1: Mobile Icon-Only Post Actions & Header
- [x] Task 4: Mobile Icon-Only Post Actions and Top Header Polishing (`tasks/todo.md`)

### Phase 2: Animated GIF Support & Search
- [ ] Task 5: Animated GIF Provider, Search & Direct URL Attachment (`tasks/todo.md`)

### Checkpoint: Complete
- [ ] All unit and CDP test suites pass (`npm test`)
- [ ] TypeScript compilation clean (`npx tsc -b`)
- [ ] Linter clean (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Mobile viewports display icon-only post actions and top-left hamburger
- [ ] GIF picker searches, filters, and attaches animated GIFs to posts

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| GIF loading latency | Low | Use high-speed CDN URLs and tiny preview thumbnails |
| Desktop post button counts hidden accidentally | Med | Enforce strict `@media (max-width: 767px)` CSS scoping |
