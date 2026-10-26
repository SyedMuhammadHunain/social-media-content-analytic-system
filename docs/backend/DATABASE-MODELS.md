# MongoDB Atlas NoSQL Database Models & Indexing

## 1. Overview & Connection Architecture

The system uses **MongoDB Atlas NoSQL** cloud clusters configured via `${MONGODB_URI}`.
Data models align 1:1 with the 5 course collections specified in the PDF (`docs/requirements/Requirements`, Section 5 & 6), plus an identity collection (`UsersDB`).

---

## 2. Document Schema Definitions

### 2.1 Posts Collection (`PostsDB`)
Stores posts authored by users across text, image, and video formats.

```json
{
  "_id": "671cb0a84d41234567892001",
  "userId": "671cb0a84d41234567891001",
  "text": "Exploring distributed microservices on Azure and MongoDB Atlas!",
  "mediaUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg",
  "mediaType": "IMAGE",
  "hashtags": ["Java21", "SpringBoot", "Cloud"],
  "likeCount": 14,
  "commentCount": 3,
  "deleted": false,
  "createdAt": "2026-10-26T20:00:05.000Z",
  "updatedAt": "2026-10-26T20:00:05.000Z"
}
```

**Indexes:**
- `{ "_id": 1 }` (Primary key, unique)
- `{ "userId": 1, "createdAt": -1 }` (Creator profile post queries)
- `{ "hashtags": 1 }` (Topic discovery)
- `{ "deleted": 1 }` (Filter out soft-deleted posts)

---

### 2.2 Likes Collection (`LikesDB`)
Tracks like ledger to guarantee idempotent likes and prevent double-liking.

```json
{
  "_id": "671cb0a84d41234567894001",
  "userId": "671cb0a84d41234567891001",
  "postId": "671cb0a84d41234567892001",
  "likedAt": "2026-10-26T20:00:12.000Z"
}
```

**Indexes:**
- `{ "userId": 1, "postId": 1 }` (Compound unique index; enforces single like per user per post)
- `{ "postId": 1 }` (Fast post like audit)

---

### 2.3 Follows Collection (`FollowDB`)
Maintains directional social relationships (`followerId` -> `followingId`).

```json
{
  "_id": "671cb0a84d41234567895001",
  "followerId": "671cb0a84d41234567891001",
  "followingId": "671cb0a84d41234567891002",
  "followedAt": "2026-10-26T20:00:18.000Z"
}
```

**Indexes:**
- `{ "followerId": 1, "followingId": 1 }` (Compound unique index; prevents duplicate follows)
- `{ "followingId": 1 }` (Fast follower lookup during fan-out generation)

---

### 2.4 Comments Collection (`CommentsDB`)
Stores threaded post comments.

```json
{
  "_id": "671cb0a84d41234567893001",
  "postId": "671cb0a84d41234567892001",
  "userId": "671cb0a84d41234567891001",
  "content": "Super clear architecture diagram!",
  "parentCommentId": null,
  "createdAt": "2026-10-26T20:00:15.000Z"
}
```

**Indexes:**
- `{ "postId": 1, "createdAt": -1 }` (Post comment retrieval)
- `{ "parentCommentId": 1 }` (Nested reply threads)

---

### 2.5 Feed Collection (`FeedDB`)
Stores pre-computed user feeds for instant $O(1)$ reverse-chronological retrieval.

```json
{
  "_id": "671cb0a84d41234567896001",
  "userId": "671cb0a84d41234567891001",
  "postId": "671cb0a84d41234567892001",
  "authorId": "671cb0a84d41234567891002",
  "createdAt": "2026-10-26T20:00:05.000Z"
}
```

**Indexes:**
- `{ "userId": 1, "createdAt": -1 }` (Compound index; powers paginated feed queries under 20ms)
- `{ "userId": 1, "postId": 1 }` (Compound unique index; prevents duplicate feed entries)

---

### 2.6 Users Collection (`UsersDB`)
Stores authenticated user accounts, supporting local credentials and extensible OAuth (Google, Apple).

```json
{
  "_id": "671cb0a84d41234567891001",
  "username": "hunain",
  "email": "hunain@example.com",
  "passwordHash": "$2a$12$e8Yq9xH8FzL8aY1...",
  "fullName": "Syed Muhammad Hunain",
  "authProvider": "LOCAL",
  "avatarUrl": "https://socialmediahunain.blob.core.windows.net/avatars/hunain.jpg",
  "createdAt": "2026-10-26T19:00:00.000Z"
}
```

**Indexes:**
- `{ "username": 1 }` (Unique index)
- `{ "email": 1 }` (Unique index)
