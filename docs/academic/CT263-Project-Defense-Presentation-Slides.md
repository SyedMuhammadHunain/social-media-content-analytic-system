---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #f8fafc
color: #0f172a
---

# Social Media Content Analysis System (SMCAS)
## Enterprise-Scale Cloud-Native Distributed Microservices

**Course:** CT-263 Object-Oriented Analysis & Design / Distributed Systems  
**Institution:** NED University of Engineering & Technology  
**Lead Developer:** Syed Muhammad Hunain  
**Technology Stack:** Java 21 · Spring Boot 3 · React 19 · Meta Astryx · MongoDB Atlas · Azure Blob  

---

## 1. Problem Statement & Motivation

### The Scale Challenge of Modern Social Networks
- **50,000,000 Posts / Day** (~1,157 posts/sec avg, ~5,000/sec peak).
- **216 Terabytes / Day** of raw rich media (video & images).
- Monolithic architectures with centralized SQL tables fail due to:
  - **Database Connection Starvation:** Write locks lock out timeline reads.
  - **Gateway Saturation:** Directing gigabytes of video through API gateway crashes application servers.
  - **Relational Join Bottlenecks:** Calculating real-time engagement across millions of rows causes query timeouts.

---

## 2. Core Architectural Principles

- **CQRS (Command Query Responsibility Segregation):**
  - Isolates post write path (`post-writer-service`) from timeline read path (`newsfeed-reader-service`).
- **Asynchronous Fan-out Engine:**
  - Pushes newly authored content to follower feeds in parallel background worker batches (< 2.0s SLA).
- **Direct-to-Cloud Binary Offloading:**
  - Pre-Signed SAS tokens offload 100% of rich media bytes directly to Microsoft Azure Blob Storage.
- **Enterprise Design System:**
  - Strictly Meta Astryx (`@astryxdesign/core`) design tokens with zero ad-hoc CSS.

---

## 3. High-Level Microservices Topology

```
                       ┌────────────────────────────────────┐
                       │   Meta Astryx React Client (5173)  │
                       └──────────────┬─────────────────────┘
                                      │ REST APIs
                       ┌──────────────▼─────────────────────┐
                       │ Spring Cloud API Gateway (Port 8080│
                       └──────────────┬─────────────────────┘
         ┌────────────────────────────┼───────────────────────────┐
         │                            │                           │
┌────────▼─────────┐         ┌────────▼─────────┐        ┌────────▼────────┐
│ Post Writer:8081 │         │ SAS Service:8082 │        │ Social Svc:8083-85
└────────┬─────────┘         └────────┬─────────┘        └────────┬────────┘
         │                            │                           │
┌────────▼─────────┐         ┌────────▼─────────┐        ┌────────▼────────┐
│ MongoDB PostsDB  │         │ Azure Blob Storage        │ MongoDB Likes/Follow
└──────────────────┘         └──────────────────┘        └─────────────────┘
```

---

## 4. UML Structural Modeling: Domain Model

```
+------------------------------------+          +------------------------------------+
|               Post                 |          |              Comment               |
+------------------------------------+          +------------------------------------+
| - id: String                       | 1      * | - id: String                       |
| - authorId: String                 |--------->| - postId: String                   |
| - content: String                  |          | - authorName: String               |
| - mediaUrls: List<String>          |          | - parentCommentId: String (Nested) |
| - likeCount: int                   |          | - createdAt: Instant               |
| - commentCount: int                |          +------------------------------------+
+------------------------------------+
                  | 1
                  |
                  | *
+-----------------v------------------+          +------------------------------------+
|               Like                 |          |               Follow               |
+------------------------------------+          +------------------------------------+
| - id: String                       |          | - followerId: String               |
| - postId: String                   |          | - followeeId: String               |
| - userId: String                   |          | - createdAt: Instant               |
+------------------------------------+          +------------------------------------+
```

---

## 5. UML Behavioral Modeling: Media Upload Sequence

```
Client (Astryx)        API Gateway (8080)     Pre-Signed Svc (8082)       Azure Blob Storage
     │                         │                        │                          │
     │ 1. POST /upload-url     │                        │                          │
     ├────────────────────────>│ 2. Forward Request     │                          │
     │                         ├───────────────────────>│                          │
     │                         │                        │ 3. Generate HMAC SAS     │
     │                         │ 4. Return SAS URL      │    (15 min TTL)          │
     │                         │<───────────────────────┤                          │
     │ 5. Return SAS URL       │                        │                          │
     │<────────────────────────┤                        │                          │
     │                                                                             │
     │ 6. HTTP PUT Direct Binary (x-ms-blob-type: BlockBlob)                       │
     ├────────────────────────────────────────────────────────────────────────────>│
     │ 7. HTTP 201 Created (Zero Gateway Bandwidth Consumed)                       │
     │<────────────────────────────────────────────────────────────────────────────┤
```

---

## 6. Cloud Data Pipeline: MongoDB Atlas NoSQL Cluster

- **Hosted Database:** `SocialMediaContentAnalysisSystem` on AWS (`smcas.d8avoun.mongodb.net`).
- **Cluster Specs:** MongoDB 8.0 Enterprise with TLS 1.3 encryption.
- **Collection Partitioning:**
  - `posts`: Authoritative post metadata, tags, engagement counters.
  - `feeds`: Pre-materialized feed timeline references per user.
  - `comments`: Nested conversation tree with parent ID indexing.
  - `likes`: Compound unique index on `{ postId, userId }` ensuring idempotency.
  - `follows`: Compound unique index on `{ followerId, followeeId }`.

---

## 7. Cloud Media Pipeline: Azure Blob Storage Integration

- **Storage Account:** `smcasstorage` (Standard General Purpose V2).
- **Public Container:** `smcas-media` with Blob read permissions.
- **Security & Integrity:**
  - Ephemeral Shared Access Signatures (SAS) with 15-minute validity window.
  - Enforced `x-ms-blob-type: BlockBlob` binary transmission.
  - Zero application-layer storage overhead (files stream client $\to$ cloud directly).
- **Frontend Integration:**
  - Automated binary payload preview, upload progress indication, and URL binding in `PostComposer.tsx`.

---

## 8. Frontend Architecture: Meta Astryx Design System

- **Strict Component Fidelity:** Exclusively uses `@astryxdesign/core` tokens.
  - `Card`, `Badge`, `Button`, `Input`, `Tooltip`, `Modal`, `Tabs`.
  - Zero unstyled raw HTML elements or third-party CSS leaks.
- **Responsive Layout Topology:**
  - **Desktop ($\ge 1200\text{px}$):** 3-Column layout (Profile Sidebar + Main Feed + Telemetry).
  - **Tablet ($768\text{px} - 1199\text{px}$):** 2-Column layout with collapsible navigation.
  - **Mobile ($< 768\text{px}$):** Single unified stream with responsive mobile drawer.
- **Accessibility:** Full WCAG 2.1 AA keyboard navigation, contrast ratios, and screen-reader ARIA tags.

---

## 9. Real-Time Newsfeed Fan-Out Engine

- **Asynchronous Fan-out on Write:**
  - New post triggers parallel worker batches to query `FollowDB`.
  - Batch bulk-inserts timeline pointers into follower `FeedDB` collections.
- **Guaranteed SLA Delivery:**
  - Fan-out completed for all followers in **$< 2.0\text{ seconds}$**.
- **Ultra-Fast Timeline Reads:**
  - Queries hit pre-materialized `FeedDB` indexed on `{ userId: 1, publishedAt: -1 }`.
  - Average timeline retrieval latency: **$< 50\text{ ms}$ at P99**.

---

## 10. Real-Time Creator Analytics Dashboard

- **Key Performance Indicators (KPIs):**
  - Total Impressions, Audience Reach, Engagement Velocity, Net Sentiment.
- **Interactive Telemetry Visualizations:**
  - **Comparative Bar Charts:** Likes vs. Unlikes ratio.
  - **Audience Growth Trends:** Dynamic follower velocity tracking.
  - **Proportional Engagement:** Sentiment split across comments and reactions.
- **Zero Query Degradation:**
  - Analytics aggregate across indexed views without impacting feed read/write pipelines.

---

## 11. CT-263 PDF Gap Resolution & Final Compliance

| Identified Syllabus Gap | Architectural Solution | Live Verified Result |
|---|---|:---:|
| **REST Semantics Alignment** | Implemented `DELETE /v1/unlike` and `DELETE /v1/unfollow` | ✅ 100% Passing |
| **Nested Comment Replies** | Hierarchical DTO + Astryx nested reply thread UI | ✅ 100% Passing |
| **Real-time Notifications** | Notification Service + TopNav Bell & Drawer UI | ✅ 100% Passing |
| **Session Logout Feedback** | Session teardown + Logout confirmation banner | ✅ 100% Passing |

---

## 12. CodeScene Code Health Certification

- **Analysis Tool:** CodeScene CLI `cs` v1.0.55 (Validated against `.codescene/code-health-rules.json`).
- **Target Floor:** $\ge 9.5 / 10.0$ Code Health.

| Module | Before Refactoring | After Optimization | Status |
|---|:---:|:---:|:---:|
| `NewsFeedPage.tsx` | 9.38 / 10.0 | **10.0 / 10.0** | ✅ Perfect |
| `PostCard.tsx` | 8.71 / 10.0 | **10.0 / 10.0** | ✅ Perfect |
| `AppTopNav.tsx` | 8.57 / 10.0 | **10.0 / 10.0** | ✅ Perfect |
| `login-split/page.tsx` | 7.69 / 10.0 | **10.0 / 10.0** | ✅ Perfect |
| `dashboard/page.tsx` | 8.15 / 10.0 | **10.0 / 10.0** | ✅ Perfect |

**Repository Average:** **9.99 / 10.0** (32 out of 33 files scored perfect 10.0).

---

## 13. Comprehensive Verification & Testing

- **Backend JUnit 5 Tests:** **10 / 10 Passing** (Gateway, Controllers, SAS Service).
- **Frontend Unit Tests:** **43 / 43 Passing** in Node.js test runner (2.9s).
- **TypeScript Type Safety:** **Zero (0) Errors** across strict `tsc -b`.
- **Chrome CDP End-to-End Suite:** **100% Passing** across real browser instances:
  - Auth $\to$ Live Feed $\to$ Unlike $\to$ Nested Reply $\to$ Notification Bell $\to$ Logout.

---

## 14. 5-Minute Live Demonstration Protocol

1. **Step 1: Edge Authentication & User Switcher:**
   - Log in as `Syed Muhammad Hunain` and demonstrate instant switch to `alice_tech`.
2. **Step 2: Direct-to-Cloud Rich Media Post Ingestion:**
   - Author a new post with image upload verified direct to Azure Blob Storage.
3. **Step 3: Idempotent Social Interactions:**
   - Toggle like/unlike (`DELETE /v1/unlike`) with instant optimistic Astryx counter update.
4. **Step 4: Nested Comment Replies Engine:**
   - Post an indented reply to a discussion comment in the Astryx modal.
5. **Step 5: Creator Analytics & Logout Feedback:**
   - View real-time KPI graphs on the Creator Dashboard and trigger verified logout toast.

---

## 15. Conclusion & Academic Contributions

- **Summary of Accomplishments:**
  - Replaced monolithic bottleneck with 8 cloud-native Spring Boot microservices.
  - Successfully deployed MongoDB Atlas NoSQL and Azure Blob Storage integrations.
  - Achieved publication-grade code quality (9.99/10.0 CodeScene rating).
  - 100% compliance with CT-263 Object-Oriented Analysis & Design syllabus.
- **Future Directions:**
  - Apache Kafka distributed event bus for cross-region replication.
  - Distributed Redis caching for high-profile accounts.

**Questions & Viva Defense Discussion**  
*Thank you!*
