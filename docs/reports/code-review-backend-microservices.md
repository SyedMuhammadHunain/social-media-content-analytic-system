# 5-Axis Code Review Report: Backend Microservices Architecture

**Date:** 2026-10-26  
**Target:** Branch `Hunain-Backend` (Commits `f13127c` through `8efcb8a`)  
**Scope:** 8 Spring Boot 3.4 microservices (`api-gateway`, `post-writer-service`, `presigned-url-service`, `like-unlike-service`, `follow-service`, `comment-service`, `newsfeed-generator-service`, `newsfeed-reader-service`), shared library `common-models`, and process runners in `scripts/`.  
**Review Standard:** Multi-dimensional quality gate across Correctness, Readability & Simplicity, Architecture, Security, and Performance.

---

## 1. Executive Verdict: APPROVED (No Blockers)

The backend implementation achieves full architectural compliance with the Course PDF specifications (`docs/requirements/Requirements`), clean microservice isolation, zero hardcoded cloud credentials, and passing tests across 100% of the build reactor.

---

## 2. Five-Axis Assessment

### Axis 1: Correctness
- **Specification Alignment:** Endpoints match Course Section 3 contracts (`/v1/posts`, `/v1/media/presign`, `/v1/like`, `/v1/unlike`, `/v1/comment`, `/v1/follow`, `/v1/unfollow`, `/v1/feeds/{userId}`).
- **Idempotency & Boundary Safety:**
  - `LikeService`: Checks `existsByUserIdAndPostId` before inserting to guarantee idempotent likes; checks `.gt(0)` floor on decrement.
  - `FollowService`: Blocks self-following (`followerId.equals(followingId)`); checks `existsByFollowerIdAndFollowingId`.
  - `PostWriterService`: Soft delete (`deleted = true`) preserves audit integrity while `findByIdAndDeletedFalse` hides deleted content from readers.
- **Serialization Safety:** Jackson getter serialization explicitly hardened with `@JsonProperty("isFollowing")` on `FollowResponse.java` to prevent Boolean property truncation.
- **Test Coverage:** All 10 modules pass `mvn test` in 27.9s with JUnit 5 and Mockito.

### Axis 2: Readability & Simplicity
- **Simplicity & Brevity:** Average class size < 100 lines. Methods follow single-responsibility principle with clear domain naming.
- **Uniform Envelopes:** All 8 services use standard `ApiResponse<T>` (`status`, `data`, `message`, `timestamp`) and `ApiErrorResponse`.
- **Zero Dead Code:** No orphaned interfaces, unused parameters, or legacy compatibility shims.

### Axis 3: Architecture
- **Microservice Separation:** 8 independent Spring Boot modules run on assigned ports (8080–8087) without inter-JAR classloader leaking. Repackaged executable JARs are decoupled; shared code is isolated strictly in `common-models`.
- **Edge Gateway Decoupling:** `api-gateway` operates statelessly using Spring Cloud Gateway and Netty WebFlux with `MongoAutoConfiguration` explicitly excluded.
- **Database Partitioning:** Data models map 1:1 to Course PDF Section 5 & 6 collections (`PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, `FeedDB`).

### Axis 4: Security
- **Cloud Credential Hygiene:** No secrets in source control. Connection strings injected via `${AZURE_STORAGE_CONNECTION_STRING}` and `${MONGODB_URI}` with safe local offline defaults.
- **Path Traversal Protection:** `AzureBlobSasService.sanitizeFileName()` sanitizes uploaded filenames against path traversal attacks (`[^a-zA-Z0-9._-]`).
- **Authorization Verification:** Post edit/delete and comment deletion enforce identity check (`userId.equals(authorId)`).
- **CORS Hardening:** Reactive `CorsWebFilter` restricts origins explicitly to localhost patterns (`http://localhost:[*]`, `http://127.0.0.1:[*]`).

### Axis 5: Performance
- **Zero N+1 Hydration:** `FeedReaderService` executes a single bulk MongoDB query (`Criteria.where("id").in(postIds).and("deleted").is(false)`) to hydrate feed post items in batch.
- **Sub-2-Second Fan-out SLA:** `FeedFanoutService` performs batch insertion (`feedItemRepository.saveAll(feedItems)`) and instruments latency with `Duration.between()` logging against the 2000ms threshold.
- **Non-Blocking Counters:** Likes and comments update post counters atomically via `MongoTemplate.updateFirst(..., new Update().inc(...))` avoiding document write locks.
- **Memory Footprint:** Local process runners ([`scripts/start-backend.sh`](file:///home/hunain/Projects/social-media-content-analysis-system/scripts/start-backend.sh)) constrain heap to `-Xms64m -Xmx128m` per service, allowing all 8 services to run within 600–800 MB RAM on memory-constrained dev hosts.

---

## 3. Findings & Suggestions

| Severity | Location | Finding | Recommendation |
|---|---|---|---|
| **Optional:** | `FeedFanoutService.java` | Fan-out is synchronous within the REST endpoint invocation. | In high-scale production, transition HTTP trigger to a RabbitMQ/Kafka queue for background asynchronous fan-out worker processing. |
| **Optional:** | `GatewayStatusController.java` | Hardcoded route mapping map in status response. | Route map is informational for dev inspection; could be pulled dynamically from `RouteLocator` in future phases. |
| **Nit:** | `application.yml` files | Duplicate default MongoDB URI across services. | Can be extracted to a shared Spring Cloud Config Server or unified profile if external configuration management is adopted. |

---

## 4. Final Verdict

**APPROVED.** The codebase satisfies all quality gates and specification requirements. Ready for branch merge or pull request.
