# CT-263 Viva Voce Defense Guide & 5-Minute Live Demo Protocol

**Project:** Social Media Content Analysis System (SMCAS)  
**Course:** CT-263: Object-Oriented Analysis & Design / Distributed Systems  
**Institution:** NED University of Engineering & Technology  
**Lead Developer / Student:** Syed Muhammad Hunain  
**Document Purpose:** Strategic examination manual, live presentation protocol, and technical defense reference.

---

## Part 1: Five-Minute Live Demonstration Protocol

This script provides an exact, step-by-step procedure to execute during the live viva examination before the faculty board. Follow the sequence precisely.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               5-MINUTE LIVE DEMO TIMELINE               │
                    ├──────────┬──────────┬──────────┬──────────┬────────────┤
                    │ Min 0-1  │ Min 1-2  │ Min 2-3  │ Min 3-4  │  Min 4-5   │
                    │ Edge Auth│ Azure SAS│ Social & │ Nested   │ Analytics  │
                    │ & Switch │ Upload   │ Unlike   │ Comments │ & Logout   │
                    └──────────┴──────────┴──────────┴──────────┴────────────┘
```

### 1.1 Pre-Flight Setup Checklist (Execute 2 Minutes Before Defense)

```bash
# Verify microservices daemon is operational on Port 8080
curl -s http://127.0.0.1:8080/v1/auth/users | jq .

# Verify frontend Vite server is live on Port 5173
curl -s -I http://127.0.0.1:5173 | head -n 1
# Expected output: HTTP/1.1 200 OK

# Open Chrome browser at the application URL
google-chrome http://127.0.0.1:5173 &
```

---

### 1.2 Step-by-Step Viva Execution Script

#### Minute 0:00 – 1:00: Edge Authentication & Instant User Persona Switcher
1. **Examiner Screen:** Navigate to `http://127.0.0.1:5173/login-split`.
2. **Action:** Point out the Meta Astryx branding pane and responsive split screen layout.
3. **Action:** Click the quick demo login pill: **"Syed Muhammad Hunain (Lead Dev)"**.
4. **Verbal Statement to Examiners:**  
   > *"The Edge API Gateway on Port 8080 authenticates the session, queries MongoDB Atlas `UsersDB`, and establishes a reactive user context. Notice the Meta Astryx top navigation header updating immediately with the user's avatar, notification bell, and persona switcher."*
5. **Action:** Click the top user switcher dropdown and select **"Alice Tech (@alice_tech)"**. Show that the active persona and timeline re-render dynamically. Switch back to **Hunain**.

#### Minute 1:00 – 2:00: Direct-to-Cloud Media Ingestion (Azure SAS Upload)
1. **Action:** Focus on the `PostComposer` component at the top of the newsfeed.
2. **Action:** Enter content: `"Demonstrating Azure Blob Storage direct-to-cloud upload for CT-263 viva defense! #DistributedSystems #SpringBoot"`.
3. **Action:** Click the image upload button and select a test image (e.g. `tests/fixtures/sample.png`).
4. **Action:** Open Chrome DevTools Network Tab (`F12`).
5. **Verbal Statement to Examiners:**  
   > *"Notice in the network tab: the frontend first calls our Pre-Signed URL Service on Port 8082 to acquire an ephemeral HMAC-SHA256 SAS URL. The multi-megabyte binary payload is then uploaded directly to Azure Blob Storage via HTTP PUT with `x-ms-blob-type: BlockBlob`. Zero binary bytes pass through our Spring Cloud Gateway, eliminating the 216 TB/day gateway saturation bottleneck."*
6. **Action:** Click **"Post Update"**. Verify post appears immediately at the top of the feed with optimistic rendering.

#### Minute 2:00 – 3:00: Idempotent Social Interactions (Like & DELETE Unlike)
1. **Action:** Scroll to the first post on the feed.
2. **Action:** Click the **Like** button. Observe the counter increment from 520 to 521, and the Astryx badge turn blue.
3. **Action:** Click the **Liked** button again to trigger an unlike.
4. **Verbal Statement to Examiners:**  
   > *"Notice the REST method in the network inspector: we strictly execute `DELETE /v1/unlike?postId=...&userId=...`. Both the like and unlike services maintain idempotent compound unique indexes in MongoDB `LikesDB`, preventing duplicate likes or race conditions."*

#### Minute 3:00 – 4:00: Nested Comment Discussion Tree & Real-Time Notifications
1. **Action:** Click the **Comment** button on a post to expand the comments drawer.
2. **Action:** Type `"Examiner question: How does fan-out scale?"` and click Send.
3. **Action:** Click the **"Reply"** button under the new comment. Type `"Response: Parallel batch workers update pre-computed feeds in <2.0 seconds."` and submit.
4. **Verbal Statement to Examiners:**  
   > *"The comment service manages self-referencing `parentCommentId` hierarchical trees. Notice how the reply renders with indented Astryx styling. Simultaneously, an event is dispatched to our Notification Service on Port 8088."*
5. **Action:** Click the **Notification Bell** in the top navigation bar. The notification drawer opens, displaying the new reaction item with an unread indicator.
6. **Action:** Click **"Mark all as read"**. The unread badge updates to 0.

#### Minute 4:00 – 5:00: Creator Analytics Telemetry & Logout Toast
1. **Action:** Click the **"Analytics"** tab in the top navigation bar to route to `/dashboard`.
2. **Action:** Hover over the interactive Astryx charts (Likes vs. Unlikes comparative bar chart, Follower Velocity trend, and Proportional Engagement).
3. **Verbal Statement to Examiners:**  
   > *"The Creator Dashboard aggregates telemetry across posts, likes, and followers. The charts are rendered using native Astryx tokens and SVG elements, providing sub-millisecond hover tooltips without third-party chart libraries."*
4. **Action:** Click the user profile icon and select **"Logout"**.
5. **Action:** Show the **Logout Confirmation Toast** appearing on the split login screen.
6. **Verbal Conclusion to Examiners:**  
   > *"All 8 microservices, MongoDB Atlas cloud cluster, Azure Blob storage, and Meta Astryx frontend are certified with 100% passing tests and a 9.99/10.0 CodeScene code health rating. The system is ready for examination."*

---

## Part 2: Top 20 Examiner Technical Viva Questions & Authoritative Answers

### Category A: Architecture & Distributed Systems

#### Q1: Why did you adopt CQRS rather than traditional monolithic CRUD?
> **Answer:** In high-scale social platforms, read and write access patterns have opposite characteristics. In SMCAS, users publish 50 million posts daily, but consume over 500 million timeline views (a 10:1 read-to-write ratio). A standard CRUD model couples read and write queries to the same database tables, causing write locks to starve timeline reads. By adopting CQRS, the write pipeline (`post-writer-service`) writes to `PostsDB`, while the asynchronous fan-out engine materializes personalized feeds into `FeedDB`. The read pipeline (`newsfeed-reader-service`) queries pre-computed feeds without performing expensive relational joins, achieving sub-50ms read latency at P99.

#### Q2: How does SMCAS prevent Gateway bandwidth exhaustion on 216 TB/day of media?
> **Answer:** If client applications routed raw image and video binaries through our Spring Cloud Gateway, the gateway would suffer network buffer exhaustion, JVM garbage collection spikes, and worker thread starvation. We implemented a **Direct-to-Cloud Binary Offloading Protocol**. The client requests an ephemeral Shared Access Signature (SAS) from our `presigned-url-service` (Port 8082). The service issues an HMAC-SHA256 authenticated URL valid for 15 minutes. The client performs a direct `HTTP PUT` to Microsoft Azure Blob Storage. The gateway processes only a 1 KB JSON metadata payload containing the resulting Azure Blob URL.

#### Q3: How does the Newsfeed Fan-out Engine maintain the < 2.0s SLA on high-follower accounts?
> **Answer:** The `newsfeed-generator-service` implements an **Asynchronous Parallel Fan-out on Write** pattern. Upon post publication, it queries the `FollowDB` for follower IDs. Rather than writing to follower feeds sequentially, it partitions follower IDs into batches of 1,000 and executes parallel MongoDB `bulkWrite` operations. For accounts with massive followings (the "celebrity problem"), the architecture supports hybrid fan-out: high-follower accounts can be flagged for "fan-out on read" where followers dynamically merge the celebrity's posts at query time, preventing write amplification.

#### Q4: Why MongoDB Atlas NoSQL instead of PostgreSQL or MySQL?
> **Answer:** Three decisive factors drove the selection of MongoDB Atlas:
> 1. **Polymorphic Media Schema:** Posts can contain plain text, image arrays, or video descriptors with variable metadata. Document schemas accommodate this without ALTER TABLE migrations.
> 2. **Pre-Materialized Timeline Collections:** Feed timelines are inherently document-oriented (a list of post pointers per user). MongoDB document structures map directly to JSON feed models.
> 3. **Horizontal Sharding & Performance:** MongoDB Atlas provides seamless sharding on `{ userId: 1 }` keys and in-memory write buffering, satisfying our ~5,000 posts/sec peak write burst requirement.

#### Q5: How is data consistency maintained across multiple microservice databases?
> **Answer:** In accordance with the CAP Theorem and the PACELC theorem, a high-throughput social network prioritizes High Availability and Partition Tolerance over Immediate Consistency ($AP$ system). We enforce **Eventual Consistency**. When a post is published, the post record is immediately committed to `PostsDB`. The fan-out to follower timelines occurs asynchronously. If a temporary network glitch delays feed materialization by 200ms, user timelines still converge accurately without locking user transactions.

---

### Category B: Object-Oriented Analysis & Design (CT-263 Core)

#### Q6: How are SOLID design principles applied across your microservices?
> **Answer:**
> - **Single Responsibility Principle (SRP):** Each microservice has one reason to change (e.g. `like-unlike-service` only handles like status; `presigned-url-service` only handles SAS signing).
> - **Open/Closed Principle (OCP):** Common models use extensible records and DTOs that allow adding new media types or metadata fields without modifying existing controller contracts.
> - **Liskov Substitution Principle (LSP):** Storage abstractions allow swapping cloud providers (e.g. Azure Blob Storage to AWS S3) by implementing the common storage interface without breaking dependent services.
> - **Interface Segregation Principle (ISP):** Client-specific interfaces prevent clients from depending on methods they do not invoke.
> - **Dependency Inversion Principle (DIP):** High-level business logic depends on repository interfaces (`PostRepository`, `FollowRepository`), not concrete database drivers.

#### Q7: What design patterns did you implement and why?
> **Answer:**
> 1. **API Gateway Pattern:** Unified entry point (`api-gateway`) handling routing, CORS, and cross-cutting security.
> 2. **Factory Method Pattern:** Used in `AzureBlobSasService` to construct signed URI tokens based on MIME types.
> 3. **Observer / Pub-Sub Pattern:** Used in feed fan-out and notification triggers where a post event notifies multiple downstream subscribers.
> 4. **Composite Pattern:** Used in our local development runner (`backend/composite-runner`) allowing 8 microservices to run within a single JVM for constrained developer environments without altering individual module source code.

#### Q8: How does your domain model handle self-referencing hierarchical comments?
> **Answer:** In `comment-service`, the `Comment` model contains an optional `parentCommentId` field referencing another `Comment._id`. When fetching post comments, the service builds a hierarchical tree: top-level comments (`parentCommentId == null`) form the root nodes, and replies are nested recursively into the `replies` list of their parent node. This allows infinite discussion depth while keeping the database flat and easily indexable.

---

### Category C: Cloud Infrastructure & Security

#### Q9: How do you ensure zero plain-text credentials leak into Git version control?
> **Answer:** All sensitive configuration—including the MongoDB Atlas connection string (`MONGODB_URI`) and Azure Storage connection string (`AZURE_STORAGE_CONNECTION_STRING`)—is injected strictly via environment variables. The `.env` file is explicitly ignored in `.gitignore` and verified via `git check-ignore backend/.env`. In production, secrets are managed via Azure Key Vault or AWS Secrets Manager. We provide a sanitized `.env.example` with dummy values for developer onboarding.

#### Q10: How does the Pre-Signed SAS Token protect against malicious binary injection?
> **Answer:** The generated SAS token is restricted by three security boundaries:
> 1. **Strict Permission Scoping:** The token is granted *Write-Only* (`c` create, `w` write) permissions; read and delete permissions are disabled.
> 2. **Ephemeral Time-to-Live (TTL):** The token expires automatically after exactly 15 minutes (`plusMinutes(15)`).
> 3. **Strict Path Restriction:** The SAS signature is cryptographically bound to a unique UUID blob path (e.g. `/smcas-media/uuid-filename.png`), preventing attackers from overwriting existing files or accessing other containers.

#### Q11: How do you handle CORS and cross-origin security across 8 microservices?
> **Answer:** All external traffic enters through the Spring Cloud API Gateway on Port 8080. The Gateway implements a centralized `CorsWebFilter` configuring allowed origins (`http://localhost:5173`), allowed HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), and allowed headers (`Content-Type`, `Authorization`). Backend microservices communicate within an internal private network and are shielded from direct public browser exposure.

---

### Category D: Frontend & Human-Computer Interaction

#### Q12: Why did you mandate the Meta Astryx Design System over generic Tailwind or Bootstrap?
> **Answer:** Meta Astryx (`@astryxdesign/core`) is the enterprise design system developed by Meta engineers for data-intensive social applications. It provides:
> 1. **WCAG 2.1 AA Accessibility:** Native support for high-contrast palettes, keyboard focus rings, and screen-reader ARIA labeling.
> 2. **Design Token Consistency:** Strictly standardized spacing, elevation, and typographic scales eliminating visual bugs.
> 3. **Zero CSS Bloat:** Eliminates thousands of arbitrary CSS utility classes, ensuring clean, maintainable component code that achieved a 10.0/10.0 CodeScene score.

#### Q13: How does the client maintain optimistic UI updates while preserving error recovery?
> **Answer:** Custom React hooks (such as `useLikeAction` and `usePostCrud`) immediately update the local React state when a user performs an action (e.g. incrementing the like counter). If the asynchronous backend request fails, a `catch` block intercepts the network error, reverts the state to its snapshot, and displays an Astryx error toast to notify the user. This provides instantaneous perceived performance without compromising data integrity.

---

### Category E: Code Quality & Empirical Verification

#### Q14: What is CodeScene Code Health and how did your codebase score 9.99 / 10.0?
> **Answer:** CodeScene is an advanced code analysis tool that evaluates architectural health, cognitive complexity, and technical debt. It flags issues like Complex Methods (cyclomatic complexity > 10), Large Methods (> 70 lines), Bumpy Road Ahead (nested branch conditions), and Complex Conditionals. We used CodeScene CLI `cs` v1.0.55 to inspect every file. By decomposing monoliths into focused custom hooks (`useFeedMutations`, `useLikeAction`, `useFeedLoader`) and presentation components (`FeedPostList`, `NewsFeedLeftSidebar`), we achieved a **10.0 / 10.0 score across 32 out of 33 evaluated files**, with an overall repository health of **9.99 / 10.0**.

#### Q15: How do you verify end-to-end functionality without manual browser testing?
> **Answer:** We created an automated headless test suite using the **Chrome DevTools Protocol (CDP)** (`tests/e2e-final-compliance.test.mjs`). The test launches a headless Chromium instance, connects to port 9255, navigates through the application, simulates clicks, verifies DOM text content, uploads test files, inspects network requests, and captures timestamped visual screenshots for every user interaction. The test passes 100% green in 10.8 seconds.

---

## Part 3: Architecture Quick-Reference Cheat Sheet

Use this cheat sheet for instant lookup during oral examination:

| Microservice | Port | Database / Collection | Key REST Endpoints |
|---|:---:|---|---|
| **`api-gateway`** | `8080` | None (Routing / Reverse Proxy) | `/v1/**` (All routes forwarded) |
| **`post-writer-service`** | `8081` | `PostsDB` / `posts` | `POST /v1/posts`, `PUT /v1/posts/{id}`, `DELETE /v1/posts/{id}` |
| **`presigned-url-service`** | `8082` | Azure Blob (`smcas-media`) | `POST /v1/media/upload-url` |
| **`like-unlike-service`** | `8083` | `LikesDB` / `likes` | `POST /v1/like`, `DELETE /v1/unlike` |
| **`follow-service`** | `8084` | `FollowDB` / `follows` | `POST /v1/follow`, `DELETE /v1/unfollow`, `GET /v1/followers` |
| **`comment-service`** | `8085` | `CommentsDB` / `comments` | `POST /v1/comments`, `GET /v1/comments/{postId}` |
| **`newsfeed-generator-service`**| `8086` | `FeedDB` / `feeds` | `POST /v1/newsfeed/fanout` (Internal) |
| **`newsfeed-reader-service`** | `8087` | `FeedDB` / `feeds` | `GET /v1/newsfeed?userId={id}&limit={n}` |
| **`notification-service`** | `8088` | `NotificationsDB` / `notifications` | `GET /v1/notifications`, `PUT /v1/notifications/read-all` |

### Key System Metrics to Cite
- **Daily Volume Target:** 50,000,000 posts / day (~1,157 posts/sec avg, ~5,000 posts/sec peak).
- **Daily Media Bandwidth:** 216 TB / day offloaded to Azure Blob Storage.
- **Fan-Out Delivery SLA:** < 2.0 seconds.
- **Timeline Read Latency:** < 50 milliseconds at P99.
- **Code Health Score:** 9.99 / 10.0 (CodeScene CLI Certified).
- **Test Coverage:** 10/10 Backend JUnit tests passing; 43/43 Frontend unit tests passing; 100% Chrome CDP passing.
