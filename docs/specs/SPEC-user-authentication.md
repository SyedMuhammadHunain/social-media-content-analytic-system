# Spec: User Authentication (Login Split Card)

## Objective
Implement user authentication according to Project Document Section 4.1.i ("Authentication: The user can register and login account in software"), Section 6 (API Design: `/v1/auth/signup`, `/v1/auth/login`), and Section 10.6 (Activity Diagram: Register/Login → Validate Credentials → Create Session).

The user interface adopts the official Meta Astryx **Login Split Card Template** (`login-split`):
- **Left Pane:** Credential form supporting both "Sign In" and "Create Account" (Register) with input validation and inline feedback.
- **Right Pane:** Full-bleed platform branding highlighting "Social Media Content Analysis System", real-time news feed telemetry, and high-scale 500M DAU architecture.
- **Session Lifecycle:** `AuthContext` managing session state, credentials verification, mock account seeding, and logout functionality accessible from TopNav.

---

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Design System:** Meta Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`)
- **Icons:** `@heroicons/react` (outline) + `@astryxdesign/core/Icon`
- **Testing:** Node.js native test runner (`node:test`) + Chrome DevTools Protocol (CDP)

---

## Commands
```bash
# Development
npm run dev

# Testing
npm test
node --test test/authentication_flow.test.mjs

# Quality Gates
npx tsc -b
npm run lint
npm run build
```

---

## Project Structure
```text
frontend/src/
├── app/
│   ├── auth/
│   │   ├── AuthPage.tsx             # Login Split Card Template container
│   │   ├── LoginForm.tsx            # Sign-in form pane
│   │   └── RegisterForm.tsx         # Registration form pane
│   ├── feed/                        # Protected News Feed view
│   └── dashboard/                   # Protected Analytics Dashboard view
├── components/
│   ├── nav/
│   │   └── TopNav.tsx               # Updated with user menu & Logout button
│   └── profile/                     # User profile card & view
├── context/
│   └── AuthContext.tsx              # Session state, login, register, logout
└── mock/
    └── authSeedData.ts              # Pre-seeded test accounts
frontend/test/
└── authentication_flow.test.mjs     # End-to-end CDP test suite
```

---

## Code Style & Pattern
Use strict Astryx component imports with TypeScript interfaces:

```tsx
import type { FC, FormEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Center } from '@astryxdesign/core/Center';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: FC = () => {
  const { login, error, isLoading } = useAuth();
  // ...
};
```

---

## Testing Strategy
- **Framework:** `node:test` + Chrome DevTools Protocol (CDP) on headless Chrome.
- **File:** `frontend/test/authentication_flow.test.mjs`
- **Test Scenarios:**
  1. Unauthenticated user visits app → Render Astryx Login Split Card view.
  2. Switch between "Sign In" and "Create Account" modes.
  3. Register with new username, email, and password → Session created → User enters News Feed.
  4. Log out via TopNav → Session cleared → Return to Login Split view.
  5. Sign in with valid seed credentials (`hunain_creator` / `password123`) → Access granted.
  6. Sign in with invalid credentials → Display Astryx `Banner` error message without crash.

---

## Boundaries
- **Always do:** Use official Astryx components (`Card`, `Center`, `TextInput`, `Button`, `Banner`, `Divider`).
- **Always do:** Support both dark and light modes via CSS tokens.
- **Ask first:** Adding external authentication dependencies or backend server daemons.
- **Never do:** Store plain-text passwords in unencrypted cookies or local storage; use simulated token session.
- **Never do:** Break existing 18 passing tests in `npm test`.

---

## Success Criteria
1. When not authenticated, app displays two-pane Login Split Card view (`data-testid="auth-split-card"`).
2. Left pane contains toggleable Sign In / Register forms with `username`, `email`, and `password` fields.
3. Successful login/register sets `currentUser` and opens the News Feed / Analytics Dashboard.
4. TopNav shows active user identity and provides a working "Log Out" trigger.
5. Clicking "Log Out" terminates the session and returns user to Login Split Card.
6. All existing 18 tests + new authentication tests pass (`npm test`).
7. `npx tsc -b`, `oxlint`, and `vite build` pass with 0 errors.

---

## Open Questions
- None. Requirements mapped directly from PDF Section 4.1.i, Section 6 API design, and Section 10.6 Activity Diagram.
