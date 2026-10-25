# Implementation Plan: Post Edit and Delete Capabilities (PDF Section 4.1.ii)

## Overview
Implement post edit and delete capabilities for authored social media posts in the News Feed and Profile View, ensuring full compliance with PDF Report Section 4.1.ii.

## Architecture Decisions
1. **Author-Only Scoping:** Post action controls (Edit and Delete) only render when `post.author.id === currentUser.id` (or matches active session user). Non-authored posts omit these controls.
2. **Astryx Modal Editing:** Use official Astryx `Card`/`Dialog` layout (`PostEditModal.tsx`) for non-destructive editing of text, captions, media URLs, and hashtags.
3. **Safe Deletion Guard:** Include confirmation before post removal to prevent accidental data loss.
4. **Synchronized State:** Updating or deleting a post instantly reflects across both the News Feed and the Profile view post history.

## Task Breakdown
- **Task 1:** Create Failing TDD Test Suite (`frontend/test/post_edit_and_delete.test.mjs`)
- **Task 2:** Add Update Post Types and State Mutators (`social.ts`, `NewsFeedPage.tsx`)
- **Task 3:** Implement Author Action Controls & `PostEditModal` in `PostCard.tsx`
- **Task 4:** Wire Edit and Delete into `UserProfileView.tsx`
- **Task 5:** Automated Test Verification, High-Res Screenshots & Branch Push

## Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Deleting post breaks feed indexing | Med | Filter post collections immutably by `post.id !== targetId` |
| Non-authors seeing edit/delete controls | High | Strictly assert `author.id === currentUser.id` in `PostCard` |
| Modal state desynchronizing during edit | Low | Initialize form state directly from target post props |
