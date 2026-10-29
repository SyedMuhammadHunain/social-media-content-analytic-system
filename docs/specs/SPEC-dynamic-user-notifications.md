# Spec: Dynamic User Notifications Engine

## Objective
Enable full-stack, generalized dynamic notifications for every user across both frontend and backend. Eliminate all hardcoded user conditionals (`isAfzal`, `isHunain`), prevent self-notifications (a user receiving alerts from themselves), ensure isolated notification state upon user switching, and dynamically generate realistic social alerts (LIKE, COMMENT, FOLLOW) from the platform's creator pool.

---

## Current Deficiencies & Root Causes
1. **Hardcoded User Special-Casing:**
   - In `useNotificationPolling.ts`, `generateDynamicNotificationsForUser` branches on `isAfzal` and `isHunain`. Other users receive static defaults that include self-notifications (e.g. Alice receiving `"Alice Walker started following you"`, Bob receiving `"Bob Creator liked your post"`).
   - In `simulateDynamicAlert`, actors are conditionally chosen based on `userId.toLowerCase().includes('afzal')`, leaving other users vulnerable to self-alert simulations.
2. **Notification Bleeding on User Switch:**
   - When switching users in `AppTopNav.tsx`, React state in `useNotificationPolling.ts` does not immediately reset before fetching the new user's notifications.
   - In `fetchNotifications`, `if (prev.length > 0) return prev;` causes the previous user's notifications to be retained and erroneously saved into the new user's local storage key.
3. **Backend Static Seed Generation:**
   - In `GatewayNotificationService.java`, `generateDynamicNotificationsForUser(String userId)` unconditionally uses `"user_afzal"` and `"user_hunain"` as actors. When Afzal logs in, he receives notifications from himself.

---

## Architecture & Implementation Plan

### 1. Frontend: Dynamic Actor Pool & Generator (`useNotificationPolling.ts`)
- **Actor Pool Definition:**
  Define a rich, standard pool of platform creators (with handles, names, avatars) plus any dynamic `demoUsers` passed in.
- **Self-Exclusion Filter:**
  Given any recipient user (`id`, `name`, `username`), filter the actor pool to guarantee `actor.id !== recipient.id` and `actor.name !== recipient.name`.
- **Dynamic Content & Template Engine:**
  Generate distinct, contextual notification messages for each event type:
  - `LIKE`: e.g. `"${actor.name} liked your latest post: '${postTitle}'"`
  - `COMMENT`: e.g. `"${actor.name} commented: '${commentSnippet}'"`
  - `FOLLOW`: e.g. `"${actor.name} started following you."`
- **Varied Temporal Distribution:**
  Assign realistic relative timestamps (e.g. 5 mins ago, 24 mins ago, 1 hour ago, 3 hours ago).
- **User-Switch State Isolation:**
  When `userId` changes:
  - Immediately reset `notifications` and `unreadCount` to empty, or load from `localStorage.getItem(NOTIF_STORAGE_PREFIX + userId)`.
  - When setting generated fallback notifications, only set them if the response matches the current `activeUserIdRef.current`.
- **Generalized Dynamic Simulation (`simulateDynamicAlert`):**
  Picks an actor strictly from other users (never active user), selects a random action type, updates state, and dispatches to `/v1/notifications`.

### 2. Frontend TopNav Integration (`AppTopNav.tsx`)
- Pass `demoUsers` into `useNotificationPolling(currentUser, demoUsers)` so dynamic simulation and fallbacks draw from the active list of platform demo users and registered accounts.

### 3. Backend: Reactive Dynamic Notification Generator (`GatewayNotificationService.java`)
- In `generateDynamicNotificationsForUser(String userId)`:
  - Maintain a candidate pool of standard demo creators (Hunain, Alice, Bob, Charlie, Afzal, TechLead, etc.).
  - Filter out any candidate whose ID or name matches `userId`.
  - Build dynamic `Notification` records with unique timestamps and persist via `notificationRepository.saveAll(...)`.

### 4. Verification & Quality Gates
- Node.js native test runner: `frontend/test/notifications.test.mjs` verifying:
  - Dynamic generation produces no self-notifications for any user (`user_hunain`, `user_alice`, `user_bob`, `user_charlie`, `user_afzal`, `user_new123`).
  - Switching users cleanly isolates notifications.
- TypeScript compiler: `npx tsc -b` (0 errors).
- Linter: `npm run lint` (0 errors).
