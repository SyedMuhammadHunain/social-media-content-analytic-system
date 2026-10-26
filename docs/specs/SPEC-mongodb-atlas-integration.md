# Spec: MongoDB Atlas Cloud Integration & Demo Data Seeding

## 1. Assumptions Surface
1. **Cloud Database Provider:** MongoDB Atlas free tier cluster (`SMCAS` / `smcas.d8avoun.mongodb.net`) hosted on AWS.
2. **Database Name:** Confirmed as `SocialMediaContentAnalysisSystem` (`mongodb+srv://.../SocialMediaContentAnalysisSystem?retryWrites=true&w=majority`).
3. **Secret Storage:** Credentials must live exclusively in local uncommitted environment files (`backend/.env` and `.env.local`), never checked into git.
4. **Seed Content Scope:** Clean wipe existing collections, then populate 5 primary collections (`PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, `FeedDB`), with seed users, realistic multimedia posts, hashtags, and social graph relationships.
5. **Spring Boot Native Integration:** Spring Boot microservices read `${MONGODB_URI}` directly from environment variables.

---

## 2. Objective
Connect all 8 backend microservices to the live MongoDB Atlas cloud cluster and populate realistic demonstration data so that:
- Microservices persist and read records from the cloud database without local MongoDB daemon dependencies.
- The newsfeed generator, feed reader, post writer, like/unlike, follow, and comment services can immediately operate on interconnected seed data.
- The frontend client application can consume live data through the API Gateway (`http://localhost:8080`).

---

## 3. Tech Stack & Dependencies
- **Language & Runtime:** Java 21, Spring Boot 3.4.2
- **Driver / Starter:** `spring-boot-starter-data-mongodb` (MongoDB Java Driver 5.2.x)
- **Cloud Database:** MongoDB Atlas M0 (AWS)
- **Tooling:** Maven 3.9+, Node.js / Shell seeding helper or Spring Boot Seeder runner
- **Security:** Git hygiene enforcing `.env` exclusion

---

## 4. Commands
- **Git Protection:**
  ```bash
  echo -e "\n.env\n*.env\n.env.local\n" >> .gitignore
  ```
- **Environment Configuration:**
  ```bash
  cp ~/Downloads/atlas-credentials.env backend/.env
  ```
- **Connection Verification:**
  ```bash
  export MONGODB_URI="mongodb+srv://hunain4700570_db_user:QTV6Uh0SyTFdM1BP@smcas.d8avoun.mongodb.net/social_db?retryWrites=true&w=majority"
  mvn test -pl post-writer-service,like-unlike-service,follow-service,comment-service,newsfeed-reader-service,newsfeed-generator-service
  ```
- **Database Seeding Execution:**
  ```bash
  ./scripts/seed-mongodb.sh
  ```
- **Start Backend with Cloud Atlas:**
  ```bash
  ./scripts/start-backend.sh
  ```

---

## 5. Project Structure
```text
social-media-content-analysis-system/
├── backend/
│   ├── .env                                  # Local Atlas credentials (gitignored)
│   ├── .env.example                          # Safe template without secrets
│   └── seed/                                 # Seed data definitions & scripts
│       ├── seed-data.json                    # Seed JSON documents for 5 collections
│       └── MongoAtlasDatabaseSeeder.java     # Java or script seeder harness
├── scripts/
│   ├── seed-mongodb.sh                       # Cloud seed execution runner
│   ├── start-backend.sh                      # Passes MONGODB_URI to JVM processes
│   └── stop-backend.sh
└── docs/
    └── specs/
        └── SPEC-mongodb-atlas-integration.md # This specification document
```

---

## 6. Code Style & Seed Schema Conventions
Seed documents must match `@Document` entities in `common-models`:

### `PostsDB` (Collection: `posts`)
```json
{
  "_id": "post-001",
  "authorId": "user-hunain",
  "authorName": "Syed Hunain",
  "authorHandle": "hunain",
  "authorAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "content": "Designing distributed systems with microservices on MongoDB Atlas and Azure Blob Storage! #cloud #architecture #java",
  "mediaType": "IMAGE",
  "mediaUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
  "tags": ["cloud", "architecture", "java"],
  "likesCount": 42,
  "commentsCount": 5,
  "sharesCount": 12,
  "status": "PUBLISHED",
  "createdAt": "2026-10-26T18:00:00Z",
  "updatedAt": "2026-10-26T18:00:00Z"
}
```

### `FollowDB` (Collection: `follows`)
```json
{
  "_id": "follow-001",
  "followerId": "user-alice",
  "followeeId": "user-hunain",
  "status": "ACTIVE",
  "createdAt": "2026-10-26T12:00:00Z"
}
```

### `FeedDB` (Collection: `feeds`)
```json
{
  "_id": "feed-001",
  "userId": "user-alice",
  "postId": "post-001",
  "authorId": "user-hunain",
  "authorName": "Syed Hunain",
  "content": "Designing distributed systems with microservices on MongoDB Atlas...",
  "publishedAt": "2026-10-26T18:00:00Z"
}
```

---

## 7. Testing & Verification Strategy
1. **Connectivity Ping Test:**
   - Execute a lightweight MongoDB driver ping against `smcas.d8avoun.mongodb.net` to verify network access (confirming IP whitelist `0.0.0.0/0` is active).
2. **Idempotent Seed Runner:**
   - Seeding script checks if collections exist. Option to clear and re-populate (clean state) or append.
3. **Multi-Service Roundtrip:**
   - Verify `newsfeed-reader-service` can read user feed from Atlas.
   - Verify `post-writer-service` can insert a new post to Atlas.
   - Verify `like-unlike-service` can record like in Atlas.

---

## 8. Boundaries
- **Always:**
  - Keep real credentials in `.env`, ignored in `.gitignore`.
  - Provide a safe `.env.example` in repo.
  - Verify IP whitelist access before running full tests.
- **Ask First:**
  - Dropping/wiping existing collections in MongoDB Atlas if already populated.
- **Never:**
  - Commit MongoDB connection strings with passwords to Git.
  - Hardcode passwords in `application.yml` or source code.

---

## 9. Success Criteria
- [ ] `.gitignore` updated so `.env` and `*.env` files are never tracked.
- [ ] `backend/.env` configured with user's MongoDB Atlas URI.
- [ ] `scripts/start-backend.sh` automatically exports `MONGODB_URI` from `backend/.env`.
- [ ] Database seeder script creates and populates `PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, and `FeedDB` on MongoDB Atlas.
- [ ] Integration verification passes: all microservices can read and write to MongoDB Atlas cluster.

---

## 10. Resolved Design Decisions
1. **Database Name:** Confirmed as `SocialMediaContentAnalysisSystem`.
2. **Cluster Name:** `SMCAS` (`smcas.d8avoun.mongodb.net`).
3. **Clean Slate Policy:** Confirmed. Wipes existing collections completely before running seed data generation.
