# Spec: Mobile Responsive App Shell & Navigation

## Objective
Provide an accessible, mobile-first responsive experience for the Social Media Content Analysis System. On viewports below 768px (smartphones and handheld devices), collapse the multi-column feed into a clean, distraction-free single-column view with native touch scrolling, a dedicated top mobile header, an Astryx left slide-out drawer, and an Astryx 5-icon bottom navigation bar. On desktop viewports (≥ 768px), preserve the existing 3-column workspace layout.

## User Stories & Functional Flow
1. **Viewport & Scroll Unlocking:** As a user on any device (especially mobile touchscreens), the page content must scroll naturally without being trapped or blocked by root CSS `overflow: hidden` on `html` and `body`.
2. **Mobile Header:** On mobile viewports (< 768px), display a sticky top header with:
   - Centered App Logo / Title.
   - Top-right action group: Search icon button (`search`) and Hamburger Menu icon button (`menu`).
   - Left side remains clear for slide-out transition.
3. **Left Off-Canvas Drawer:** Tapping the top-right Hamburger button opens an Astryx Drawer from the left side:
   - Content: Current user identity summary, Appearance toggle (Dark/Light mode with Astryx styling), and Logout action.
   - Smooth slide animation shifting or overlaying the main viewport, with backdrop dismiss and escape key support.
4. **Bottom Icon Navigation Bar:** On mobile viewports (< 768px), display a fixed bottom navigation bar containing 5 icons in strict sequential order:
   1. **Saved Posts** (`bookmark` / `viewColumns`)
   2. **Creator Analytics** (`calendar` / `arrowUp` / `moreHorizontal`)
   3. **Create Post (+)** at center (highlighted accent button that opens post creation modal)
   4. **Notifications** (`info` / `checkDouble`) with live unread badge
   5. **Profile** (`success` / user avatar icon)
5. **In-Place Center Page View Swapping:**
   - On mobile, sidebars are hidden.
   - Tapping an icon in the bottom bar or drawer updates the center view dynamically (e.g., Creator Analytics displays analytical charts in place of feed, Saved shows saved posts, Notifications shows notification list, Profile shows user profile card).
   - Back action or tapping Feed returns to the primary newsfeed.

## Tech Stack
- **Framework:** React 19, TypeScript 5.8, Vite 8
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- **Icons:** Astryx Design System Icon registry (`Icon`, `IconButton`, `getIconRegistry()`, `registerIcons()`)
- **Styling:** Astryx semantic tokens (`var(--color-...)`, `var(--space-...)`), CSS modules / Astryx styled primitives
- **Testing:** Node.js native test runner (`node:test`, `node:assert`), Chrome DevTools Protocol (CDP) headless testing

## Commands
```bash
# Frontend build
cd frontend && npm run build

# TypeScript validation
cd frontend && npx tsc -b

# Linter
cd frontend && npm run lint

# Automated test suite
cd frontend && npm test
```

## Project Structure
```
frontend/src/
  ├── App.tsx                                  # Remove root overflow locks; manage viewport media query state
  ├── app/
  │   ├── feed/
  │   │   ├── NewsFeedPage.tsx                 # Responsive 3-column vs single-column rendering & mobile view switcher
  │   │   ├── MobileAppHeader.tsx              # Mobile sticky top bar (centered logo + right search & hamburger)
  │   │   ├── MobileBottomNav.tsx              # Astryx 5-icon bottom bar ([Saved, Analytics, +, Notifs, Profile])
  │   │   ├── MobileNavigationDrawer.tsx       # Astryx left slide-out drawer (Appearance, Logout, user info)
  │   │   └── SearchModal.tsx                  # Mobile search overlay triggered from top header
  │   ├── dashboard/                           # Creator analytics view (loaded in center column on mobile)
  │   └── notifications/                       # Notifications list view (loaded in center column on mobile)
  tests/                                       # Node native + CDP headless tests
```

## Code Style
Use functional React components with strict TypeScript types, Astryx component primitives, and tokenized CSS:
```tsx
import { Icon, IconButton } from '@astryxdesign/core';

export function MobileAppHeader({ onOpenDrawer, onOpenSearch }: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-spacer" />
      <div className="mobile-header-logo">
        <span className="mobile-app-title">SocialPulse</span>
      </div>
      <div className="mobile-header-actions">
        <IconButton
          icon={<Icon icon="search" size="sm" />}
          aria-label="Search"
          onClick={onOpenSearch}
        />
        <IconButton
          icon={<Icon icon="menu" size="sm" />}
          aria-label="Menu"
          onClick={onOpenDrawer}
        />
      </div>
    </header>
  );
}
```

## Testing Strategy
1. **Unit & Component Testing:**
   - Verify removal of `document.documentElement.style.overflow = 'hidden'` in `App.tsx`.
   - Verify rendering and ordering of 5 bottom navigation icons (`Saved`, `Analytics`, `+`, `Notifications`, `Profile`).
   - Verify top header elements: centered logo, right Search button, right Hamburger button.
   - Verify mobile drawer toggle state and actions (Appearance mode toggle, Logout trigger).
2. **CDP Headless Browser Verification:**
   - Emulate mobile viewport (`390x844` iPhone 14 / Android viewport).
   - Verify body and feed container scroll heights > client height and verify vertical scroll dispatch.
   - Verify clicking bottom icons switches center view from Feed to Analytics and Notifications.
   - Emulate desktop viewport (`1440x900`) and verify 3-column layout remains intact.

## Boundaries
- **Always:** Use Meta Astryx components and Astryx design tokens; maintain 100% passing tests and zero TypeScript errors.
- **Ask first:** Modifying desktop navigation hierarchy or introducing additional bottom bar items.
- **Never:** Use third-party CSS frameworks (Tailwind, Bootstrap) or ad-hoc non-Astryx icon packages. Never restore global `overflow: hidden` on root `html`/`body`.

## Success Criteria
- [ ] Root `overflow: hidden` removed from `App.tsx`; viewport scrolls naturally on all devices.
- [ ] On viewports < 768px, left and right desktop sidebars are hidden; center content occupies full viewport width.
- [ ] Mobile sticky header displays centered App Logo with top-right Search and Hamburger icons.
- [ ] Mobile bottom navigation renders 5 icons in exact order: Saved, Creator Analytics, + Create Post (center), Notifications, Profile.
- [ ] Tapping bottom nav icons switches center content between Newsfeed, Analytics, Notifications, Saved, and Profile.
- [ ] Tapping Hamburger opens Astryx left drawer displaying Appearance theme switch and Logout.
- [ ] Desktop layout (≥ 768px) is unaffected and retains standard 3-column workspace.
- [ ] All frontend unit tests and CDP headless tests pass with 0 errors.

## Open Questions
- None. Requirements clarified and confirmed through interview.
