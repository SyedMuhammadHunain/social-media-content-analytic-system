# Spec: Post Edit and Delete Capabilities (PDF Section 4.1.ii)

## Objective
Enable content creators to edit and delete their own authored posts across the News Feed and User Profile view, completing the full Create/Edit/Delete lifecycle specified in PDF Report Section 4.1.ii.

## Tech Stack
- **Framework:** React 19, TypeScript 5.8
- **Design System:** Meta Astryx (`@astryxdesign/core`)
- **Icons:** `@heroicons/react/24/outline` and `@heroicons/react/24/solid`
- **Testing:** Node.js native test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP)

## Commands
- **Dev:** `npm run dev -- --host 127.0.0.1 --port 5173`
- **Build:** `npm run build` (`tsc -b && vite build`)
- **Lint:** `npm run lint` (`oxlint`)
- **Test:** `npm test` (`node --test --test-concurrency=1 test/**/*.test.mjs`)
- **Targeted Test:** `node --test test/post_edit_and_delete.test.mjs`

## Assumptions
1. Only the author of a post (`post.author.id === currentUser.id`) can edit or delete that post. Non-authored posts do not display edit/delete actions.
2. Editing allows modifying text content, captions, and hashtags. Media URL can be replaced or cleared.
3. Deleting a post permanently removes it from the client-side post collection, updating the News Feed and Profile View immediately.
4. An Astryx confirmation dialog or confirm button is required before executing a delete to prevent accidental removal.

## Project Structure
```
frontend/src/app/feed/
├── PostCard.tsx            → Post display; add author action menu (Edit/Delete)
├── PostEditModal.tsx       → Astryx modal/dialog for editing post text and tags
├── NewsFeedPage.tsx        → Feed state; add handleEditPost and handleDeletePost
frontend/src/components/profile/
├── UserProfileView.tsx     → Pass edit/delete handlers to authored post list
frontend/src/types/
├── social.ts               → Add UpdatePostInput interface
frontend/test/
├── post_edit_and_delete.test.mjs → Automated CDP integration tests
```

## Code Style & Conventions
- Pure Astryx design tokens (`VStack`, `HStack`, `Card`, `Button`, `TextInput`, `Dialog`, `Icon`).
- Strict TypeScript typing with no `any`.
- Clear `data-testid` attributes (`data-testid="post-edit-btn"`, `data-testid="post-delete-btn"`, `data-testid="post-edit-save"`).

```tsx
// Example Action Menu in PostCard
{isAuthor && (
  <HStack gap={1} vAlign="center">
    <Button
      data-testid={`post-edit-btn-${post.id}`}
      variant="ghost"
      size="sm"
      icon={<Icon icon={PencilSquareIcon} size="xsm" />}
      onClick={() => setIsEditing(true)}
      label="Edit"
    />
    <Button
      data-testid={`post-delete-btn-${post.id}`}
      variant="ghost"
      size="sm"
      icon={<Icon icon={TrashIcon} size="xsm" color="error" />}
      onClick={() => setIsDeleting(true)}
      label="Delete"
    />
  </HStack>
)}
```

## Testing Strategy
- Create `frontend/test/post_edit_and_delete.test.mjs` on dedicated CDP port `9229`.
- Verify:
  1. Author actions (Edit/Delete) render only on posts created by `hunain_creator`.
  2. Clicking Edit opens the editor with current text, saving updates post text immediately.
  3. Clicking Delete prompts confirmation and removes the post from News Feed.
  4. Author post count and profile history update immediately.

## Boundaries
- **Always do:** Restrict edit and delete controls strictly to the post author.
- **Ask first:** Modifying feed sorting order or seed user identifiers.
- **Never do:** Allow editing or deleting other users' posts; commit failing tests.

## Success Criteria
- [ ] Author posts display Edit and Delete controls.
- [ ] Non-author posts do not display Edit and Delete controls.
- [ ] Editing post updates text and hashtags in feed and profile without page reload.
- [ ] Deleting post removes it from feed and profile immediately.
- [ ] All automated tests pass (35/35 across 6 test suites).
- [ ] 0 TypeScript errors (`tsc -b`), 0 lint warnings (`oxlint`), clean `vite build`.

## Open Questions
- None. Requirements strictly follow PDF Section 4.1.ii.
