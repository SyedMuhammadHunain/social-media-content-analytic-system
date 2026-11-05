# Spec: User Search (Sidebar Search Box)

## Objective

Make the existing sidebar search box functional. When a user types a query, a dropdown appears below the input showing matching registered users. Clicking a result navigates to that user's profile via `handleViewUserProfile`. The search box currently exists as a visual stub in `NewsFeedRightSidebar.tsx`.

## Tech Stack

- React 19, TypeScript 5.8
- Meta Astryx design system (`@astryxdesign/core`)
- Heroicons (`@heroicons/react`) for search icon (already used)
- No backend API — client-side matching only

## Commands

```
Build:  cd frontend && npm run build
Test:   cd frontend && npm test
Lint:   cd frontend && npx oxlint .
Types:  cd frontend && npx tsc -b
Dev:    cd frontend && npm run dev
```

## Project Structure

```
frontend/src/app/feed/NewsFeedRightSidebar.tsx  → Search box + dropdown (modify)
frontend/src/app/feed/NewsFeedPage.tsx           → Pass user data sources to sidebar (modify)
frontend/src/utils/userSearchIndex.ts            → Deduplicated user collection + match logic (new)
```

## Data Sources

All registered users come from client-side sources, merged and deduplicated by `id`:

1. `demoUsers` from `AuthContext` (all accounts including dynamically registered)
2. `suggestedCreators` from `NewsFeedPage` state
3. Post authors extracted from `posts` array

Deduplication key: `user.id`. Priority: demoUsers > suggestedCreators > post authors (richest profile data wins).

## Matching Logic

- Case-insensitive substring match on `name` and `username` fields.
- Minimum query length: 1 character.
- Max results shown: 8.
- Exclude current logged-in user from results.
- Empty query: hide dropdown.

## UI Behavior

- **Dropdown position:** Absolutely positioned below search input, same width, dark surface background matching sidebar theme.
- **Result row:** Avatar (32×32 rounded), name (primary text), @username (secondary text). Clickable.
- **Click result:** Calls `onViewProfile(user)` which triggers `handleViewUserProfile` in `NewsFeedPage`.
- **Dismiss:** Click outside dropdown, press Escape, or clear input.
- **No results:** Show "No users found" text in dropdown.
- **Debounce:** Not needed — client-side filtering over <100 users.
- **Keyboard:** Arrow keys to navigate results, Enter to select, Escape to close. Focus trap stays within dropdown while open.

## Code Style

```tsx
// Match function — pure, no side effects
function matchUsers(query: string, users: SearchableUser[], excludeId: string): SearchableUser[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return users
    .filter((u) => u.id !== excludeId && (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    ))
    .slice(0, 8);
}
```

## Testing Strategy

- **Framework:** Node.js native test runner (`node:test`, `node:assert`)
- **Location:** `frontend/test/userSearch.test.ts`
- **Coverage:**
  - `matchUsers` returns correct results for name match, username match, partial match
  - Empty query returns empty array
  - Current user excluded from results
  - Results capped at 8
  - Case-insensitive matching

## Boundaries

- **Always:** Run `npx tsc -b` and `npx oxlint .` before committing. Use Astryx design tokens for colors. Keep existing comments.
- **Ask first:** Adding new dependencies.
- **Never:** Backend API calls for search. Modifying auth logic. Breaking existing tests.

## Success Criteria

1. Type "al" in search box → dropdown shows users whose name or username contains "al" (e.g., "Alice Walker", "Alex Rivera", "Alex Chen").
2. Click a result → profile view opens for that user.
3. Press Escape or click outside → dropdown closes.
4. Logged-in user never appears in own search results.
5. Arrow keys navigate dropdown items, Enter selects highlighted item.
6. "No users found" shown when query matches nobody.
7. `npx tsc -b` clean, `npx oxlint .` clean, all existing tests pass, production build succeeds.

## Open Questions

None.
