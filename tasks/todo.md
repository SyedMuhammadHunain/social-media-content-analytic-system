# Active Tasks: Backend Microservices Architecture & Implementation

## Phase 1: Environment & Multi-Module Foundation
- [x] Task 1: Java 21 & Maven Environment Setup
- [x] Task 2: Root Multi-Module Maven Configuration (`backend/pom.xml`)
- [x] Task 3: Common Models Library (`backend/common-models`)
- [x] Checkpoint 1: Foundation Clean Build (`mvn clean install -pl common-models`)

## Phase 2: Edge Gateway (`api-gateway`)
- [x] Task 4: Spring Cloud Gateway Routing Configuration (Port 8080)
- [x] Task 5: Gateway CORS & Security Filters
- [x] Checkpoint 2: Gateway Routing Verified

## Phase 3: Media & Content Ingestion Pipeline
- [x] Task 6: Pre-Signed URL Service (`presigned-url-service`, Port 8082, Azure Blob SAS)
- [x] Task 7: Post Writer Service (`post-writer-service`, Port 8081, `PostsDB`)
- [x] Checkpoint 3: Ingestion Pipeline Verified

## Phase 4: Social Engagement Services
- [x] Task 8: Like / Unlike Service (`like-unlike-service`, Port 8083, `LikesDB`)
- [x] Task 9: Comment Service (`comment-service`, Port 8085, `CommentsDB`)
- [x] Task 10: Follow Service (`follow-service`, Port 8084, `FollowDB`)
- [x] Checkpoint 4: Social Services Verified

## Phase 5: Newsfeed Fan-out & Reader Services
- [x] Task 11: Newsfeed Generator Service (`newsfeed-generator-service`, Port 8086, Fan-out Engine)
- [x] Task 12: Newsfeed Reader Service (`newsfeed-reader-service`, Port 8087, `FeedDB`)
- [x] Checkpoint 5: Feed Pipeline Verified (<2.0s SLA)

## Phase 6: Unified Dev Profile & Final Verification
- [x] Task 13: Lightweight Composite Local Dev Profile (<500 MB RAM)
- [x] Task 14: Verification Report & Quality Gate (`docs/reports/backend-verification.md`)
- [x] Checkpoint 6: Full Backend Verification Complete
