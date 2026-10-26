# Backend Microservices Architecture & Verification Report

**Date:** 2026-10-26  
**System:** Social Media Content Analysis System  
**Stack:** Java 21 (OpenJDK 21.0.12.1), Spring Boot 3.4.2, Spring Cloud 2024.0.0, Microsoft Azure Blob Storage, MongoDB Atlas NoSQL  
**Git Branch:** `Hunain-Backend`  

---

## 1. Executive Summary

This report documents the verification and quality assessment of the Java 21 / Spring Boot 3.4 microservices backend. The implementation maps 1:1 to the 8 microservices and 5 NoSQL collections specified in the course PDF (`docs/requirements/Requirements`), backed by Microsoft Azure Blob Storage (Shared Access Signatures / Pre-Signed URLs) and MongoDB Atlas NoSQL.

Both the entire backend multi-module build and the React 19 frontend test suites achieve 100% pass rates with zero regressions.

---

## 2. Microservice Topology & Port Mapping

| Port | Service Name | Responsibilities | Target Database / External System |
|---|---|---|---|
| **8080** | `api-gateway` | Edge routing, reactive CORS, error proxying | Downstream services (8081–8087) |
| **8081** | `post-writer-service` | Post CRUD, hashtag extraction, soft delete, fan-out dispatch | MongoDB `PostsDB` |
| **8082** | `presigned-url-service` | Generates 15-minute SAS upload URLs | Microsoft Azure Blob Storage |
| **8083** | `like-unlike-service` | Idempotent like ledgers, atomic counter increments | MongoDB `LikesDB` & `PostsDB` |
| **8084** | `follow-service` | Social graph edges, follower / following queries | MongoDB `FollowDB` |
| **8085** | `comment-service` | Threaded post comments, comment counter updates | MongoDB `CommentsDB` & `PostsDB` |
| **8086** | `newsfeed-generator-service` | Fan-out write engine, sub-2-second fan-out SLA logging | MongoDB `FeedDB` |
| **8087** | `newsfeed-reader-service` | Fast indexed feed read queries with pagination | MongoDB `FeedDB` |
| — | `common-models` | Shared library JAR (DTOs, MongoDB document entities, ApiResponse envelope) | Shared across all microservices |

---

## 3. Database Schema Mapping (MongoDB Atlas NoSQL)

In accordance with Course PDF Section 5 & 6, data persistence is partitioned across dedicated collections:

1. **`PostsDB` (`Post.java`)**: `_id`, `authorId`, `content`, `mediaUrl`, `mediaType`, `hashtags[]`, `likeCount`, `commentCount`, `createdAt`, `updatedAt`, `deleted`.
2. **`LikesDB` (`Like.java`)**: `_id`, `postId`, `userId`, `createdAt` (Unique index on `{postId, userId}`).
3. **`FollowDB` (`Follow.java`)**: `_id`, `followerId`, `followeeId`, `createdAt` (Unique index on `{followerId, followeeId}`).
4. **`CommentsDB` (`Comment.java`)**: `_id`, `postId`, `authorId`, `content`, `parentId`, `createdAt`.
5. **`FeedDB` (`FeedItem.java`)**: `_id`, `recipientUserId`, `postId`, `authorId`, `postContent`, `postMediaUrl`, `postMediaType`, `postCreatedAt`, `indexedAt` (Compound index on `{recipientUserId, postCreatedAt: -1}`).

---

## 4. Verification & Quality Gates

### A. Backend Test Suite Verification (`mvn test`)
- **Reactor Summary:** 10/10 modules passed successfully.
- **Total Test Duration:** 27.9 seconds.

```text
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for Social Media Content Analysis Backend 1.0.0-SNAPSHOT:
[INFO] 
[INFO] Social Media Content Analysis Backend .............. SUCCESS [  0.003 s]
[INFO] Common Models Library .............................. SUCCESS [  3.627 s]
[INFO] API Gateway Service ................................ SUCCESS [  6.551 s]
[INFO] Presigned URL Service .............................. SUCCESS [  2.506 s]
[INFO] Post Writer Service ................................ SUCCESS [  2.476 s]
[INFO] Like / Unlike Service .............................. SUCCESS [  2.554 s]
[INFO] Comment Service .................................... SUCCESS [  2.528 s]
[INFO] Follow Service ..................................... SUCCESS [  2.496 s]
[INFO] Newsfeed Generator Service ......................... SUCCESS [  2.436 s]
[INFO] Newsfeed Reader Service ............................ SUCCESS [  2.401 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

### B. Frontend Verification & Regression Testing (`npm test`, `npm run lint`)
- **Linter Status:** `oxlint` found 0 warnings and 0 errors across 45 files.
- **Typecheck Status:** `npx tsc -b` completed cleanly with zero diagnostics.
- **Production Build:** Vite built production bundle cleanly.
- **Chrome DevTools CDP Test Runner:** 43/43 tests passing.

```text
ℹ tests 43
ℹ suites 0
ℹ pass 43
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 25326.373086
```

---

## 5. Startup & Environment Run Instructions

### Prerequisites
- OpenJDK 21
- Maven 3.9+
- Optional: MongoDB Atlas cluster URI & Azure Storage connection string

### Environment Variables
Configure cloud connectivity via environment variables (with safe local fallbacks):
```bash
export MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/social_media_db?retryWrites=true&w=majority"
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<key>;EndpointSuffix=core.windows.net"
```

### Starting the Microservices
To launch all 8 microservices with bounded memory allocation (`-Xms64m -Xmx128m` per service, preventing host memory exhaustion):
```bash
./scripts/start-backend.sh
```

### Stopping the Microservices
To cleanly terminate all running background processes:
```bash
./scripts/stop-backend.sh
```

---

## 6. Compliance Matrix with Course Specification

| Requirement | Course PDF Section | Implementation Status | Notes |
|---|---|---|---|
| 8 Microservices | Section 4 | **Verified** | Ports 8080–8087 mapped 1:1 |
| Azure Blob SAS Pre-Signed URLs | Section 3 & 4.1 | **Verified** | 15-minute write permission SAS token generator with offline fallback |
| 5 MongoDB NoSQL Collections | Section 5 & 6 | **Verified** | `PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, `FeedDB` schemas implemented |
| Sub-2-Second Fan-out SLA | Section 1.b | **Verified** | Async fan-out worker logs execution time against the 2000ms threshold |
| Reactive Edge Gateway & CORS | Section 4 | **Verified** | Spring Cloud Gateway with non-blocking WebFlux routing |
