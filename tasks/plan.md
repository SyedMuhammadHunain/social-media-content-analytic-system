# Implementation Plan: Backend Microservices Architecture & Implementation

## Overview
Decompose and implement the 8 microservices and 5 NoSQL collections specified in the course PDF (`docs/requirements/Requirements`) using Java 21, Spring Boot 3.4.2, Maven Multi-Module, Microsoft Azure Blob Storage, and MongoDB Atlas NoSQL.

## Architecture Decisions
1. **Vertical Slicing per Capability:**
   - Foundation first (`common-models` and `backend/pom.xml`), followed by Gateway, Media/Post Ingestion, Social Engagement, and Feed Fan-out pipeline.
2. **Dual-Runtime Compatibility:**
   - 8 independent microservice modules (`api-gateway`, `post-writer-service`, `presigned-url-service`, `like-unlike-service`, `follow-service`, `comment-service`, `newsfeed-generator-service`, `newsfeed-reader-service`) for 100% course submission grading compliance.
   - Optional composite dev profile to boot all services within a single JVM (~500 MB RAM) to prevent OOM on host with 1.8 GB available memory.
3. **Cloud Credentials Management:**
   - Azure connection string injected via `${AZURE_STORAGE_CONNECTION_STRING}`.
   - MongoDB Atlas URI injected via `${MONGODB_URI}` with local MongoDB fallback.
   - Zero hardcoded secrets in repository.
4. **Sub-2-Second Fan-out SLA:**
   - Fan-out on write pattern from `post-writer-service` via `newsfeed-generator-service` to indexed `FeedDB`.

---

## Detailed Task Breakdown

### Phase 1: Environment & Multi-Module Foundation

#### Task 1: Java 21 & Maven Environment Setup
- **Description:** Ensure OpenJDK 21 and Maven 3.9+ are accessible on Arch Linux host.
- **Acceptance criteria:**
  - `java -version` returns OpenJDK 21.
  - `mvn -version` returns Apache Maven 3.9+.
- **Verification:** `java -version && mvn -version`
- **Dependencies:** None
- **Files likely touched:** Host environment
- **Estimated scope:** XS (1 config)

#### Task 2: Root Multi-Module Maven Configuration (`backend/pom.xml`)
- **Description:** Configure parent POM with Spring Boot 3.4.2, Spring Cloud 2024.0.0, Azure Storage Blob 12.28.0, and MongoDB dependencies.
- **Acceptance criteria:**
  - `backend/pom.xml` defines `<packaging>pom</packaging>` and child modules.
  - Dependency management locks versions for Lombok, Jackson, Jakarta Validation, and Testing.
- **Verification:** `cd backend && mvn validate`
- **Dependencies:** Task 1
- **Files likely touched:** `backend/pom.xml`
- **Estimated scope:** S (1 file)

#### Task 3: Common Models Library (`backend/common-models`)
- **Description:** Implement shared DTOs, MongoDB document entities, event payloads, and `ApiResponse<T>` envelope.
- **Acceptance criteria:**
  - `ApiResponse<T>` and `ApiErrorResponse` envelopes.
  - Domain entities: `Post`, `Like`, `Follow`, `Comment`, `FeedItem`, `User`.
  - Request/Response DTOs for all Section 3 REST contracts.
- **Verification:** `mvn clean install -pl common-models`
- **Dependencies:** Task 2
- **Files likely touched:** `backend/common-models/pom.xml`, `backend/common-models/src/main/java/com/social/common/**`
- **Estimated scope:** M (5 files)

### Checkpoint 1: Foundation Clean Build
- [ ] Parent POM and `common-models` compile cleanly with `mvn clean install`.

---

### Phase 2: Edge Gateway (`api-gateway`)

#### Task 4: Spring Cloud Gateway Routing Configuration
- **Description:** Configure `api-gateway` (Port 8080) with route predicates mapping `/v1/posts/**`, `/v1/media/**`, `/v1/like/**`, `/v1/comment/**`, `/v1/follow/**`, and `/v1/feeds/**` to respective downstream ports (8081–8087).
- **Acceptance criteria:**
  - Application listens on port 8080.
  - Routing rules configured via `application.yml`.
- **Verification:** `mvn test -pl api-gateway`
- **Dependencies:** Task 3
- **Files likely touched:** `backend/api-gateway/pom.xml`, `src/main/resources/application.yml`, `GatewayApplication.java`
- **Estimated scope:** M (3 files)

#### Task 5: Gateway CORS & Security Filters
- **Description:** Enable CORS headers for frontend (`http://localhost:5173`) and add mock JWT validation filter stub.
- **Acceptance criteria:**
  - Preflight OPTIONS requests return 200 with CORS headers.
  - Open routes (`/v1/auth/**`, `/v1/media/**`) bypass token checks.
- **Verification:** Slice test verifying CORS headers on mock requests.
- **Dependencies:** Task 4
- **Files likely touched:** `backend/api-gateway/src/main/java/com/social/gateway/config/CorsConfig.java`
- **Estimated scope:** S (2 files)

### Checkpoint 2: Gateway Routing Verified
- [ ] Gateway routes requests and handles CORS headers properly.

---

### Phase 3: Media & Content Ingestion Pipeline

#### Task 6: Pre-Signed URL Service (`presigned-url-service`)
- **Description:** Implement port 8082 service generating Azure Blob Storage Shared Access Signature (SAS) tokens with 15-minute write permissions.
- **Acceptance criteria:**
  - `POST /v1/media/presign` returns valid SAS URL and blob target URL.
  - Graceful fallback and error message if connection string is missing.
- **Verification:** Unit test with mocked `BlobServiceClient`.
- **Dependencies:** Task 3
- **Files likely touched:** `backend/presigned-url-service/**`
- **Estimated scope:** M (4 files)

#### Task 7: Post Writer Service (`post-writer-service`)
- **Description:** Implement port 8081 service handling post creation, update, soft deletion, and retrieval in `PostsDB`.
- **Acceptance criteria:**
  - `POST /v1/posts` creates post in `PostsDB`.
  - `GET /v1/posts/{postId}` retrieves post.
  - `DELETE /v1/posts/{postId}` soft-deletes post.
  - Auto-extracts hashtags and validates media URLs.
- **Verification:** Controller and service tests with mock Mongo repository.
- **Dependencies:** Task 3
- **Files likely touched:** `backend/post-writer-service/**`
- **Estimated scope:** M (5 files)

### Checkpoint 3: Ingestion Pipeline Verified
- [ ] Presigned URL generation and Post Writer CRUD pass all tests.

---

### Phase 4: Social Engagement Services

#### Task 8: Like / Unlike Service (`like-unlike-service`)
- **Description:** Implement port 8083 service managing idempotent like ledgers in `LikesDB` and atomic counter updates in `PostsDB`.
- **Acceptance criteria:**
  - `POST /v1/like` records like idempotently and increments count.
  - `POST /v1/unlike` removes like and decrements count.
- **Verification:** Unit test with duplicate like prevention assertions.
- **Dependencies:** Task 7
- **Files likely touched:** `backend/like-unlike-service/**`
- **Estimated scope:** M (4 files)

#### Task 9: Comment Service (`comment-service`)
- **Description:** Implement port 8085 service for threaded comments in `CommentsDB`.
- **Acceptance criteria:**
  - `POST /v1/comment` inserts comment with timestamp.
  - `GET /v1/comment/{postId}` returns chronological comment tree.
- **Verification:** Slice test on comment endpoints.
- **Dependencies:** Task 7
- **Files likely touched:** `backend/comment-service/**`
- **Estimated scope:** M (4 files)

#### Task 10: Follow Service (`follow-service`)
- **Description:** Implement port 8084 service managing social graph edges in `FollowDB`.
- **Acceptance criteria:**
  - `POST /v1/follow` and `POST /v1/unfollow`.
  - `GET /v1/follow/{userId}/followers` and `GET /v1/follow/{userId}/following`.
- **Verification:** Unit tests verifying unique graph edges.
- **Dependencies:** Task 3
- **Files likely touched:** `backend/follow-service/**`
- **Estimated scope:** M (4 files)

### Checkpoint 4: Social Services Verified
- [ ] Like, comment, and follow services pass unit and slice tests.

---

### Phase 5: Newsfeed Fan-out & Reader Services

#### Task 11: Newsfeed Generator Service (`newsfeed-generator-service`)
- **Description:** Implement port 8086 fan-out engine that receives post creation events, queries followers from `follow-service`, and writes to `FeedDB`.
- **Acceptance criteria:**
  - Fan-out fan-out pushes post reference to all follower feed documents.
  - Sub-2-second sync latency SLA achieved.
- **Verification:** Fan-out engine unit test with 100 followers mock.
- **Dependencies:** Task 7, Task 10
- **Files likely touched:** `backend/newsfeed-generator-service/**`
- **Estimated scope:** M (4 files)

#### Task 12: Newsfeed Reader Service (`newsfeed-reader-service`)
- **Description:** Implement port 8087 feed reader querying pre-computed `FeedDB` documents.
- **Acceptance criteria:**
  - `GET /v1/feeds/{userId}?page=0&size=20` returns reverse-chronological post feed.
  - Indexed read completes in <50ms.
- **Verification:** Controller and service tests with mock `FeedDB`.
- **Dependencies:** Task 11
- **Files likely touched:** `backend/newsfeed-reader-service/**`
- **Estimated scope:** M (4 files)

### Checkpoint 5: Feed Pipeline Verified
- [ ] End-to-end fan-out on write and feed retrieval verified.

---

### Phase 6: Unified Dev Profile & Final Verification

#### Task 13: Lightweight Composite Local Dev Profile
- **Description:** Provide composite runner configuration so all 8 services can optionally run together within a single JVM for local testing without exhausting host RAM.
- **Acceptance criteria:**
  - Runs in single process using <500 MB RAM when needed.
  - Standalone individual module JARs remain 100% untouched for course submission.
- **Verification:** Launch composite runner and verify endpoints.
- **Dependencies:** Tasks 4–12
- **Files likely touched:** `backend/composite-runner/**`
- **Estimated scope:** S (3 files)

#### Task 14: Verification Report & Quality Gate
- **Description:** Run full test suite across parent and all modules; generate verification report in `docs/reports/backend-verification.md`.
- **Acceptance criteria:**
  - 100% test pass rate across all microservices.
  - Frontend test suite remains 100% green.
- **Verification:** `mvn test` and `cd frontend && npm test`
- **Dependencies:** Task 13
- **Files likely touched:** `docs/reports/backend-verification.md`
- **Estimated scope:** S (1 file)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Host memory exhaustion running 8 JVMs | High | Provide composite dev runner profile alongside 8 standalone modules |
| Azure connection string not configured initially | Medium | Pre-signed URL service includes graceful mock/offline fallback mode |
| Fan-out latency exceeds 2.0s SLA for large follower counts | Medium | Batch write operations to MongoDB `FeedDB` |
| Inter-service communication overhead | Low | Spring `RestClient` with connection pooling |
