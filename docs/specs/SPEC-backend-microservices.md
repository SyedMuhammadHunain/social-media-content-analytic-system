# Spec: Backend Microservices Architecture & Implementation (Course Alignment)

## 1. Assumptions Surface
1. **Java & Spring Boot:** OpenJDK 21 (LTS) and Spring Boot 3.4.2 are the primary language and framework.
2. **Build System:** Apache Maven Multi-Module (`pom.xml`) with a parent POM governing common dependency management and child modules.
3. **No Docker Requirement:** All services build via standard `mvn clean install` and run natively or in IDE without Docker or container daemon overhead.
4. **Cloud Database (MongoDB Atlas):** Connects to MongoDB Atlas NoSQL via `${MONGODB_URI}` (GitHub Student Developer Pack) with local fallback `mongodb://localhost:27017/social_db`.
5. **Cloud Object Storage (Azure Blob Storage):** Media storage and pre-signed upload URLs powered by Microsoft Azure Blob Storage via `${AZURE_STORAGE_CONNECTION_STRING}` (GitHub Student Developer Pack).
6. **Course 1:1 Mapping:** The 8 microservices and 5 NoSQL collections in the course PDF (`docs/requirements/Requirements`) map 1:1 into dedicated service modules and schemas.

---

## 2. Phase 0: Capability Map

| Module id | Responsibility (PDF Section 4) | Depends on | Port |
|---|---|---|---|
| `common-models` | Shared DTOs, domain models, API response envelopes, event schemas | None | N/A (JAR) |
| `api-gateway` | Edge routing, CORS filter, JWT auth filter, client reverse proxy | `common-models` | `8080` |
| `post-writer-service` | Post creation (Text, Image, Video), soft delete, update (`PostsDB`) | `common-models` | `8081` |
| `presigned-url-service`| Pre-signed SAS URL generation for Azure Blob Storage upload | `common-models` | `8082` |
| `like-unlike-service` | Like / Unlike ledger and post like counter update (`LikesDB`) | `common-models` | `8083` |
| `follow-service` | Follow / Unfollow relationship graph (`FollowDB`) | `common-models` | `8084` |
| `comment-service` | Comments ingestion, post retrieval, author engagement (`CommentsDB`) | `common-models` | `8085` |
| `newsfeed-generator-service` | Fan-out engine; writes posts to follower feeds on publish (`FeedDB`) | `common-models`, `follow-service` | `8086` |
| `newsfeed-reader-service` | News feed retrieval by `userId`, reverse chronological sort (`FeedDB`) | `common-models` | `8087` |

### Phased Build & Implementation Order:
- **Phase 1: Architecture & Domain Documentation (`docs/backend/`)**
  - Complete `ARCHITECTURE.md`, `API-SPECIFICATION.md`, `DATABASE-MODELS.md` for student submission and grading.
- **Phase 2: Parent Maven Project & `common-models` Library**
  - Root `pom.xml` with dependencies and shared contracts/models.
- **Phase 3: Edge Routing Gateway (`api-gateway`)**
  - Spring Cloud Gateway routing requests across ports 8081–8087.
- **Phase 4: Content Ingestion Services**
  - `post-writer-service` (MongoDB Atlas `PostsDB`) and `presigned-url-service` (Azure Blob Storage).
- **Phase 5: Social Engagement Services**
  - `like-unlike-service` (`LikesDB`), `comment-service` (`CommentsDB`), `follow-service` (`FollowDB`).
- **Phase 6: Feed Fan-out & Reader Pipeline**
  - `newsfeed-generator-service` (fan-out write) and `newsfeed-reader-service` (feed read from `FeedDB`).

---

## 3. Objective
Build an enterprise-grade, distributed microservices backend for the Social Media Content Analysis System that strictly satisfies every functional and architectural requirement in the course PDF (`docs/requirements/Requirements`):
- High cohesion and low coupling with 8 independent microservices.
- 5 NoSQL collections matching Section 5 & 6 (`PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, `FeedDB`).
- RESTful HTTP endpoints matching Section 3 (`/v1/auth/*`, `/v1/posts`, `/v1/like`, `/v1/unlike`, `/v1/comment`, `/v1/follow`, `/v1/unfollow`, `/v1/feeds/{userId}`, `/v1/media/presign`).
- Sub-2-second eventual consistency SLA for News Feed and Creator Analytics updates.
- Incremental, step-by-step implementation without premature code drops or unannounced background downloads.

---

## 4. Tech Stack & Dependencies
- **Language:** Java 21 (LTS)
- **Framework:** Spring Boot 3.4.2
- **Cloud/Routing:** Spring Cloud Gateway 2024.0.0
- **Build Tool:** Apache Maven 3.9+ (Multi-module)
- **Database:** MongoDB Atlas (Cloud NoSQL) via `spring-boot-starter-data-mongodb`
- **Object Storage:** Azure Blob Storage via `azure-storage-blob:12.28.0`
- **Validation:** `spring-boot-starter-validation` (Jakarta Validation)
- **Utilities:** Project Lombok, Jackson Databind, Spring Actuator
- **Testing:** JUnit 5, Mockito, Spring Boot Starter Test, AssertJ

---

## 5. Commands
- **Build parent & all modules:** `mvn clean install -DskipTests`
- **Run all unit & integration tests:** `mvn test`
- **Run specific microservice (e.g. Gateway):** `mvn spring-boot:run -pl api-gateway`
- **Run Post Writer Service:** `mvn spring-boot:run -pl post-writer-service`
- **Run Follow Service:** `mvn spring-boot:run -pl follow-service`
- **Package executable JARs:** `mvn package`

---

## 6. Project Structure
```
backend/
├── pom.xml                                   # Root Parent POM (modules, dependency management)
├── common-models/                            # Shared domain entities & DTO library
│   ├── pom.xml
│   └── src/main/java/com/social/common/
│       ├── dto/                              # Request/Response contracts
│       ├── model/                            # Shared document models
│       ├── event/                            # Fan-out event schemas
│       └── exception/                        # Uniform error response structures
├── api-gateway/                              # Port 8080 (Spring Cloud Gateway)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/gateway/
│       └── resources/application.yml
├── post-writer-service/                      # Port 8081 (Post Writer + PostsDB)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/postwriter/
│       └── resources/application.yml
├── presigned-url-service/                    # Port 8082 (Object Storage Pre-Signed URLs)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/presign/
│       └── resources/application.yml
├── like-unlike-service/                      # Port 8083 (Like ledger + LikesDB)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/like/
│       └── resources/application.yml
├── follow-service/                           # Port 8084 (Social graph + FollowDB)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/follow/
│       └── resources/application.yml
├── comment-service/                          # Port 8085 (Comments + CommentsDB)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/comment/
│       └── resources/application.yml
├── newsfeed-generator-service/               # Port 8086 (Fan-out engine + FeedDB)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/social/feedgen/
│       └── resources/application.yml
└── newsfeed-reader-service/                  # Port 8087 (NewsFeed reader + FeedDB)
    ├── pom.xml
    └── src/main/
        ├── java/com/social/feedreader/
        └── resources/application.yml
```

---

## 7. Code Style & Conventions
- **Clean Architecture:** Standard layering per microservice: `controller`, `service`, `repository`, `model`.
- **Validation:** All incoming request bodies validated using `@Valid` and Jakarta constraints (`@NotBlank`, `@NotNull`, `@Size`).
- **Uniform Response:** All API responses wrapped in uniform `ApiResponse<T>`:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
```

---

## 8. Testing Strategy
1. **Unit Tests:** JUnit 5 and Mockito for service and domain layer logic.
2. **Controller Slice Tests:** `@WebMvcTest` (or `@WebFluxTest` for Gateway) with MockMvc for input validation and status code verification.
3. **Repository Tests:** Spring Data Mongo slice tests with embedded MongoDB or test mock contexts.
4. **Zero Frontend Regressions:** Frontend integration tests (`cd frontend && npm test`) must remain 100% green at every step.

---

## 9. Boundaries
- **Always do:**
  - Build step-by-step; verify each slice before advancing.
  - Document all architectural designs, APIs, and schemas in `docs/backend/`.
  - Maintain exact compatibility with course PDF naming and schemas.
- **Ask first:**
  - Adding external dependencies outside Spring Boot, Azure SDK, MongoDB.
  - Changing network ports or endpoint URL paths.
  - Installing host packages.
- **Never do:**
  - Never require Docker daemon to build, test, or run.
  - Never download unannounced toolchains to host directories.
  - Never commit real cloud secrets or access keys to Git.
  - Never break or regress the completed frontend application.

---

## 10. Success Criteria
1. Architecture, API contracts, and MongoDB Atlas schemas exhaustively documented in `docs/backend/`.
2. Maven multi-module parent POM cleanly orchestrating the 8 microservices and `common-models`.
3. All service endpoints respond with valid JSON contracts matching PDF Section 3.
4. MongoDB Atlas documents match PDF Section 6 schemas.
5. Frontend tests continue to pass 100% (43/43 green).

---

## 11. Open Questions
*None currently.* All architectural decisions, cloud providers (Azure Blob + MongoDB Atlas), and step-by-step execution boundaries are confirmed.
