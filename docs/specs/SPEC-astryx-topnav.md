# Spec: Meta Astryx Official Mega TopNav & Theme Toggle

## 1. Objective
Replace the temporary header bar in `frontend/src/App.tsx` with the official Meta Astryx `TopNav` suite (`@astryxdesign/core/TopNav`). Equip the application with product-level brand identity, accessible navigation links, a hover-activated `TopNavMegaMenu` detailing Social Feed and Analytics modules, and an interactive Light/Dark theme toggle button (`SunIcon` / `MoonIcon`) switching Astryx Design System tokens dynamically.

## 2. Tech Stack & Dependencies
- **UI Primitives:** `@astryxdesign/core/TopNav` (`TopNav`, `TopNavHeading`, `TopNavItem`, `TopNavMegaMenu`, `TopNavMegaMenuItem`, `TopNavMegaMenuFeaturedCard`)
- **Theme Provider:** `@astryxdesign/core/theme` (`Theme`) + `@astryxdesign/theme-neutral`
- **Actions & Feedback:** `@astryxdesign/core/Button`, `@astryxdesign/core/Avatar`, `@astryxdesign/core/Icon`, `@astryxdesign/core/Badge`
- **Icons:** `@heroicons/react/24/outline` (`SunIcon`, `MoonIcon`, `SparklesIcon`, `ChartBarSquareIcon`, `NewspaperIcon`, `ServerStackIcon`)
- **Language & Runtime:** React 19 + TypeScript 5.8 + Vite 8.3

## 3. Commands
- **Dev Server:** `npm run dev`
- **Type Check:** `npx tsc -b`
- **Linter:** `npm run lint` (`oxlint`)
- **Production Build:** `npm run build`

## 4. Project Structure
```
frontend/src/
├── components/
│   └── nav/
│       └── AppTopNav.tsx       # Dedicated official Astryx TopNav component
├── App.tsx                     # State-driven mode ('dark' | 'light') and view ('feed' | 'dashboard')
└── main.tsx                    # Theme root provider
```

## 5. Code Style & Astryx Component Anatomy
Strict adherence to official Astryx components with zero invented wrappers:
```tsx
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuItem,
  TopNavMegaMenuFeaturedCard,
} from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';

export function ExampleNav({ mode, onToggleTheme, activeTab, onSelectTab }) {
  return (
    <TopNav
      label="Social Media Content Analysis Navigation"
      heading={
        <TopNavHeading
          logo={<Icon icon={SparklesIcon} size="md" style={{ color: '#0171E3' }} />}
          heading="Social Media Content Analysis"
          subheading="Meta Astryx • Section 4.1 System Client"
        />
      }
      startContent={
        <>
          <TopNavItem
            label="News Feed"
            isSelected={activeTab === 'feed'}
            onClick={() => onSelectTab('feed')}
          />
          <TopNavItem
            label="Analytics Dashboard"
            isSelected={activeTab === 'dashboard'}
            onClick={() => onSelectTab('dashboard')}
          />
          <TopNavMegaMenu
            label="Explore Platform"
            items={
              <>
                <TopNavMegaMenuItem
                  title="Real-Time Feed"
                  description="Chronological media stream with sub-second fan-out"
                  onClick={() => onSelectTab('feed')}
                />
                <TopNavMegaMenuItem
                  title="Creator Analytics"
                  description="Audience growth, reactions, and engagement metrics"
                  onClick={() => onSelectTab('dashboard')}
                />
              </>
            }
            featured={
              <TopNavMegaMenuFeaturedCard
                title="500M DAU Architecture"
                description="Designed for 2.5B daily interactions and 216 TB/day storage"
                linkLabel="Read System Spec"
                linkHref="#spec"
              />
            }
          />
        </>
      }
      endContent={
        <HStack gap={3} vAlign="center">
          <Button
            label={mode === 'dark' ? 'Light mode' : 'Dark mode'}
            variant="ghost"
            size="sm"
            icon={<Icon icon={mode === 'dark' ? SunIcon : MoonIcon} size="sm" />}
            onClick={onToggleTheme}
          />
          <Avatar name="Syed Muhammad Hunain" size="sm" />
        </HStack>
      }
    />
  );
}
```

## 6. Functional Requirements
1. **Official TopNav Slot Structure:**
   - `heading`: Renders `TopNavHeading` with brand icon, product title, and system client context.
   - `startContent`: Renders `TopNavItem` for "News Feed", `TopNavItem` for "Analytics Dashboard", and `TopNavMegaMenu` for "Explore Platform".
   - `TopNavMegaMenu`: Displays hover popover containing `TopNavMegaMenuItem` elements for system modules and a `TopNavMegaMenuFeaturedCard` highlighting Section 5 capacity figures.
   - `endContent`: Renders Light/Dark theme toggle button with `SunIcon`/`MoonIcon` and user `Avatar`.
2. **Dynamic Light & Dark Theme Toggle:**
   - App maintains state `mode: 'dark' | 'light'`.
   - `<Theme theme={themes[defaultThemeSlug]} mode={mode}>` dynamically updates all Astryx CSS variables.
   - `<html>` element `data-theme` and `style.colorScheme` updated reactively (`dark` <-> `light`).
   - App body background responds via CSS variable `var(--color-background-body)`.
3. **Tab Switching Synchronization:**
   - Clicking `News Feed` or `Analytics Dashboard` (or selecting them from the Mega Menu) activates that view with `isSelected` styling.

## 7. Boundaries
- **Always do:** Use only components exported by `@astryxdesign/core`. Keep work on branch `Hunain-Frontend`. Run type checks and build verification.
- **Ask first:** Any third-party navigation components or global CSS changes.
- **Never do:** Write raw `<nav>` HTML tags or invented CSS classes when official Astryx primitives exist. Never merge to `main` without explicit instruction.

## 8. Success Criteria
1. `npm run build` succeeds with zero TypeScript and linter errors.
2. Official `TopNav` renders on desktop with brand heading, nav items, and mega menu.
3. Hovering `Explore Platform` triggers `TopNavMegaMenu` displaying items and featured card.
4. Clicking Theme Toggle button switches between dark mode (`#111111`) and light mode (`#FFFFFF`) with correct Astryx tokens.
5. DevTools test verifies 0 console errors and 0 network failures.

## 9. Open Questions
None. Intent and constraints confirmed in interview.
