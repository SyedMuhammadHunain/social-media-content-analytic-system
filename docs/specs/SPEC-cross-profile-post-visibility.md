# Feature Specification: Shared Cross-Profile Post Visibility & Feed Distribution

## 1. Problem Statement
When a user (e.g. `AFZAL iqbal`) publishes a post in the Post Composer, the post is only held in the transient in-memory state of that specific component view.
Switching profiles via the top navigation user switcher, navigating between accounts, or reloading the feed causes newly authored posts to disappear from other users' feeds and profiles.
Per Course PDF Section 4.1.i (Fan-out on write architecture), every published post must be distributed to the feeds of all users across the platform, and must remain visible on the author's profile page as well as on the global newsfeed for every logged-in user.

## 2. Objectives & Scope
- **Shared Cross-Profile Store:** Create a centralized posts repository (`sharedPostsStore.ts`) backed by `localStorage` (`smcas_shared_posts`) with fallback to `INITIAL_POSTS`.
- **Global Broadcast upon Post Creation:** When any profile publishes a post (text, image, or video), it is immediately recorded in the shared store and broadcasted via `social:posts-updated` events.
- **Persistent Visibility across User Switching:** When switching active accounts via `AppTopNav` (e.g., between AFZAL iqbal, Syed Muhammad Hunain, Sarah Chen, Alex Rivera, Elena Rostova, David Kim), the news feed displays all posts including newly authored ones.
- **Author Profile Mapping:** When navigating to the author's profile (`UserProfileView`), the authored post is correctly filtered and rendered under their posts.
- **Synchronized Social Actions:** Liking, bookmarking, commenting, editing, and deleting posts update the shared store so interaction counts remain synchronized across all profiles.

## 3. Technical Design

### A. Shared Posts Store (`frontend/src/utils/sharedPostsStore.ts`)
- Key: `smcas_shared_posts`.
- `getSharedPosts(): Post[]`:
  - Retrieves posts from `localStorage`.
  - Merges with `INITIAL_POSTS` to ensure baseline seed posts are preserved.
- `saveSharedPost(post: Post): Post[]`:
  - Prepends `post` to storage.
  - Fires `social:posts-updated` custom event and `storage` synchronization.
- `updateSharedPost(postId: string, updater: (p: Post) => Post): Post[]`:
  - Updates post matching `postId`.
  - Fires `social:posts-updated`.
- `deleteSharedPost(postId: string): Post[]`:
  - Removes post matching `postId`.
  - Fires `social:posts-updated`.

### B. Feed State & Lifecycle Integration (`NewsFeedPage.tsx`)
- Initialize `posts` state with `getSharedPosts()`.
- Add window event listeners for `social:posts-updated` and `storage` to keep state in sync.
- Wire `usePostCrud` and `useSocialInteractions` mutations into `sharedPostsStore`.

## 4. Verification Plan
- Unit tests:
  - Test `sharedPostsStore` CRUD operations.
  - Verify optimistic post creation updates shared storage.
  - Verify switching active profile displays authored posts in feed.
- Quality Gates:
  - `npx tsc -b` passes.
  - `npm run lint` passes.
  - `npm run test:unit` passes.
