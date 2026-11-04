# Spec: Refine UI

## Objective

Polish the existing social media analytics app UI before university submission. 10 discrete changes targeting visual consistency, layout structure, and Astryx Design System compliance. No new features, no backend changes.

**User:** NED University student preparing for course demo/submission.

**Success:** All 10 items visually correct, Astryx-only components, light/dark theme consistent, clean minimal look.

## Source of Truth

- Intent: Confirmed via interview (this session)
- Raw requirements: `refine_ui.md` (project root)

## Tech Stack

- React 19, TypeScript ~6.0, Vite 8
- `@astryxdesign/core` ^0.7.4, `@astryxdesign/theme-neutral` ^0.7.4
- `recharts` ^3.10.1 (charts only)
- No React Router — state-driven tab navigation via `useState<AppTab>`

## Commands

```
Build:   cd frontend && npx tsc -b && npx vite build
Test:    cd frontend && npm test
Lint:    cd frontend && npx oxlint .
Dev:     cd frontend && npm run dev
```

## Project Structure

```
frontend/src/
├── App.tsx                    # App shell, auth gate, tab routing
├── app/auth/                  # AuthPage (re-exports login)
├── app/login-split/           # Current split-card login (REPLACE)
├── app/dashboard/             # Analytics dashboard page + charts
├── app/feed/                  # News feed, sidebars, post cards
├── components/nav/            # AppTopNav, tabs, actions, drawer
├── components/profile/        # Profile view components
├── context/                   # Auth + Analytics providers
├── mock/                      # Seed data
├── types/                     # TypeScript types
└── utils/                     # Utilities
```

## Capability Map

| # | Item | Files Affected | Complexity |
|---|------|---------------|------------|
| 1 | Login card swap | `app/login-split/`, `app/auth/`, new `app/login-card/` | Medium — scaffold via CLI, rewire auth gate |
| 2 | Logo change | `public/`, navbar, login | Low — copy image, update refs |
| 3 | Navbar strip-down | `components/nav/AppTopNav.tsx`, `DesktopNavTabs.tsx`, `DesktopNavActions.tsx`, `MobileNavMenu.tsx` | Medium — remove tabs, actions, keep logo only |
| 4 | Sidebar shortcut links | `app/feed/FeedShortcutsCard.tsx` | Low — add Notification, Appearance, Logout items |
| 5 | Remove info card | `app/feed/NewsFeedRightSidebar.tsx`, `app/feed/PlatformInfoFooter.tsx` | Low — delete component, remove import |
| 6 | Level panels | `app/feed/NewsFeedPage.tsx` | Low — fix top offset alignment |
| 7 | Persistent side panels | `App.tsx`, `app/feed/NewsFeedPage.tsx`, `app/dashboard/page.tsx` | **High** — extract sidebars to App shell, route content through center column |
| 8 | Analytics interpretation card | `app/dashboard/DashboardAnalyticsInterpretation.tsx` | Medium — replace custom markup with Astryx components, fix theme |
| 9 | Remove tags | `app/dashboard/page.tsx`, `DashboardHeader.tsx`, KPI cards | Low — delete badge/tag elements |
| 10 | Zero-gap posts | `app/feed/PostCard.tsx`, `app/feed/FeedPostList.tsx` | Low — remove gap/margin between cards |

**Build order:** 2 → 1 → 3 → 4 → 5 → 9 → 10 → 6 → 8 → 7

Rationale: Logo (2) first since login card (1) needs it. Navbar (3) before sidebar links (4) since links replace navbar items. Simple removals (5, 9, 10, 6) before complex refactors. Analytics card (8) before persistent panels (7) since 7 restructures the app shell.

## Detailed Requirements

### 1. Login Card Swap
- Run `npx @astryxdesign/cli template login-card ./src/app/login-card`
- Keep only "Continue with Google" button from current auth flow
- Remove email/password form, register toggle, demo sign-in bar
- Preserve Google OAuth modal logic from `GoogleOAuthModal.tsx`
- Wire new login-card into auth gate in `App.tsx`
- Old `app/login-split/` directory can be deleted after swap

### 2. Logo Change
- Copy `~/Downloads/Gemini_Generated_Image_655y7d655y7d655y.jpeg` to `frontend/public/logo.jpeg` (overwrite or replace existing `logo.png`)
- Update all logo references (navbar brand, login page)
- No app name text — logo image only

### 3. Navbar Strip-Down
- Keep: App logo (top-left, links to feed)
- Remove: Feed tab, Dashboard tab, New Post button, User selection, Notification bell, Theme toggle, Logout button, Profile icon
- Result: minimal navbar with logo only
- Keep responsive behavior (sticky header)

### 4. Sidebar Shortcut Links
- Add to `FeedShortcutsCard.tsx`:
  1. **Notification** — Astryx `Icon` (bell), switches center content to notification list
  2. **Appearance** — Astryx `Icon`, on click expands to show Light/Dark theme toggle buttons
  3. **Logout** — Astryx `Icon`, triggers logout action
- Keep existing shortcut items as-is
- All icons from Astryx Design System only (no `@heroicons/react` for new items)

### 5. Remove Info Card
- Delete `PlatformInfoFooter.tsx` (the "OOAD Content Analysis v1.0" card)
- Remove import and render from `NewsFeedRightSidebar.tsx`

### 6. Level Panels
- Left sidebar, center feed, and right sidebar must start at same vertical position
- Current issue: sidebars `top: 88px` fixed positioning may differ from feed scroll start
- Fix: ensure consistent `top` offset or use flex/grid alignment

### 7. Persistent Side Panels (Highest Complexity)
- Extract `NewsFeedLeftSidebar` and `NewsFeedRightSidebar` from `NewsFeedPage.tsx` to `App.tsx` shell
- Center column renders different content based on active tab:
  - `feed` → PostComposer + FeedPostList
  - `dashboard` → DashboardTemplate (charts/analytics)
  - `notifications` → Notification list (new)
  - `profile` → UserProfileView
- Remove "Back to News Feed" button
- Side panels remain static across all tab switches
- Tab type expands: `'feed' | 'dashboard' | 'notifications' | 'profile'`

### 8. Analytics Interpretation Card
- Replace custom HTML/CSS in `DashboardAnalyticsInterpretation.tsx` with Astryx components (`Card`, `Section`, `Text`, `Icon`, `VStack`, `HStack`)
- Must respond to light/dark theme toggle (currently stuck on dark)
- Use only Astryx Design System icons
- Remove verbose/overwhelming text, keep key insights concise

### 9. Remove Tags
- Delete from dashboard: "Live Telemetry (<2s sync)", "(PDF Sections 4.1.vii-ix & 4.2)", "96.7% Positive", and similar academic/demo tags
- Likely in `DashboardHeader.tsx` or `DashboardKpiCards.tsx` as `<Badge>` elements

### 10. Zero-Gap Posts
- Remove `gap`, `margin-bottom`, or spacing between `PostCard` components in `FeedPostList.tsx`
- Each post card directly touches the next — no visible separation between cards
- Cards stick bottom-to-top with zero distance

## Code Style

Per-component deep imports from Astryx:
```tsx
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
```

Inline styles via Astryx CSS variables:
```tsx
style={{ color: 'var(--color-text-primary)' }}
```

No custom CSS files. No `@heroicons/react` for new elements (existing usage stays unless touched).

## Testing Strategy

- `npx tsc -b` — type-check passes after each item
- `npx oxlint .` — no new lint errors
- Visual verification in browser (dev server) after each item
- Existing tests in `frontend/test/` must not break

## Boundaries

- **Always:** Use Astryx Design System components and icons. Run `npx tsc -b` before considering item done. Preserve existing functionality (auth flow, analytics data, social features).
- **Ask first:** Deleting entire component directories (e.g., `app/login-split/`). Changing auth context logic. Adding new dependencies.
- **Never:** Introduce custom CSS files. Use non-Astryx UI libraries. Change backend API contracts. Modify mock data structure. Remove existing tests.

## Success Criteria

1. Login uses Astryx login-card template with Google-only auth
2. New logo visible in navbar and login, no app name text
3. Navbar shows only logo — no tabs, buttons, or icons
4. Shortcuts card has Notification, Appearance (with theme toggle), Logout
5. "OOAD Content Analysis" info card gone from right sidebar
6. All three columns (left, center, right) start at same vertical level
7. Side panels persist across feed, dashboard, notifications, profile views
8. Analytics interpretation card uses Astryx components, respects theme
9. No academic/demo tags in dashboard
10. Post cards have zero gap between them

## Open Questions

All resolved:

1. **Astryx icons:** Use Astryx `Icon` component for bell, appearance, logout. No fallback — if icon name differs, find correct Astryx icon name from docs.
2. **Notification view:** Build new full-page notification list in center column. Do not reuse `NotificationDrawer`.
3. **Login-card CLI:** Run `npx @astryxdesign/cli template login-card ./src/app/login-card` first to inspect scaffold, then adapt.
