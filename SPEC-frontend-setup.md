# Spec: Frontend Environment Setup (React 19 + Astryx Design System)

## Objective
Establish frontend workspace for Social Media Content Analysis System. Initialize Vite + React 19 + TypeScript app in `frontend/` directory on new git branch `Hunain-Frontend`. Configure Meta's Astryx Design System (`@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`, and `@astryxdesign/cli`) with theme and component test.

## Tech Stack
- **Framework:** React 19 (`react`, `react-dom` >= 19.0.0)
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 6.x
- **UI & Styling:**
  - `@astryxdesign/core` (Meta Astryx components)
  - `@astryxdesign/theme-neutral` (Astryx default theme)
  - `@stylexjs/stylex` (Meta StyleX styling engine)
- **Dev Tooling:** `@astryxdesign/cli`

## Commands
- **Branch checkout:** `git checkout -b Hunain-Frontend`
- **Install dependencies:** `npm install` (inside `frontend/`)
- **Astryx init:** `npx @astryxdesign/cli init` (inside `frontend/`)
- **Type check:** `npx tsc -b` (inside `frontend/`)
- **Build:** `npm run build` (inside `frontend/`)
- **Dev server:** `npm run dev` (inside `frontend/`)

## Project Structure
```
social-media-content-analysis-system/
├── Requirements/
├── docs/
│   └── intent/
│       └── frontend-environment-setup.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── SPEC-frontend-setup.md
```

## Code Style
- Imports order: React core -> Astryx CSS/theme CSS -> Third-party packages -> Local components/styles.
- Type definitions: explicit props interfaces with TypeScript.
- Example:
```tsx
import React from 'react'
import '@astryxdesign/core/style.css'
import '@astryxdesign/theme-neutral/style.css'
import { Button } from '@astryxdesign/core'

export const TestBanner: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Social Media Content Analysis System</h1>
      <Button>Astryx Ready</Button>
    </div>
  )
}
```

## Testing Strategy
- Verification by compilation and production build (`npm run build`).
- Verify no TypeScript or bundler resolution errors with Astryx packages and CSS imports.
- Dev server launch test: ensure clean bundle generation without runtime warnings.

## Boundaries
- **Always:**
  - Create and switch to git branch `Hunain-Frontend` before workspace file modifications.
  - Keep all frontend code strictly inside `frontend/`.
  - Verify `npm run build` passes with zero errors.
- **Ask first:**
  - Adding extra third-party UI libraries (e.g., Tailwind, Material UI, Shadcn).
  - Installing global dependencies outside local package manifests.
- **Never:**
  - Modify or delete existing `Requirements/` or project documents.
  - Commit directly to `main` branch.
  - Alter backend files during frontend setup phase.

## Success Criteria
- [ ] Git branch `Hunain-Frontend` created and checked out.
- [ ] `frontend/` initialized with React 19 + TypeScript + Vite.
- [ ] Astryx Design System packages (`@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`, `@astryxdesign/cli`) installed.
- [ ] Astryx CSS imported and test component rendering in `App.tsx`.
- [ ] `npm run build` exits 0 with no errors.

## Open Questions
- None. Requirements and scope confirmed.
