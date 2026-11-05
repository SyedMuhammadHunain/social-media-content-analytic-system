# Intent: CodeScene Code Health 10/10 & Hotspot Simplification

- **Outcome:** Decompose and refactor bloated hotspot files (`AuthContext`, `AnalyticsContext`, `client.ts`, `useNotificationPolling`, `PostCard`, `PostCreateModal`, `PostMediaToolbar`, `GoogleOAuthModal`, `RegisterForm`, `LoginCardPage`) into modular, single-responsibility files achieving 10/10 Code Health.
- **User:** Engineering team and CodeScene quality auditor evaluating codebase health and maintainability.
- **Why now:** Several files exceed healthy size thresholds (400–700 lines) with high cyclomatic complexity and tangled concerns.
- **Success:** Code Health reaches 10.0 / 10.0 across all target files, zero hotspots remain, and all 97 existing unit tests + build pass cleanly with zero functional regression.
- **Constraint:** Preserve exact runtime behavior, Meta Astryx design tokens, and existing external contracts without altering APIs.
- **Out of scope:** Redesigning backend Java microservices or introducing new third-party libraries.
