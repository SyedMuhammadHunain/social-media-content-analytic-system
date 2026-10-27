# Spec: Azure Blob Storage Cloud Integration for Media Uploads

## 1. Assumptions Surface
1. **Target Cloud Account:** Microsoft Azure Storage account `socialmediaanalysis`.
2. **Container Name & Access:** Container `media-assets` with public blob-level read access enabled so uploaded images/videos render directly in the newsfeed without expiring download tokens.
3. **Secret Storage & Git Hygiene:** The connection string (`DefaultEndpointsProtocol=https;AccountName=socialmediaanalysis;AccountKey=...`) must live strictly in local untracked `backend/.env` and `backend/.env.local`. Zero plain-text secrets in git.
4. **Service Ownership:** `backend/presigned-url-service` (Port 8082) generates time-limited (15-minute) write SAS tokens. Frontend `PostComposer.tsx` uploads directly to Azure via HTTP PUT with `x-ms-blob-type: BlockBlob`.
5. **Fallback Resilience:** If Azure credentials are absent or remote cloud connection times out, `AzureBlobSasService.java` automatically falls back to simulated local URLs without crashing.

---

## 2. Objective
Connect Microsoft Azure Blob Storage (`socialmediaanalysis`) to the SMCAS microservices and frontend to enable cloud media persistence:
- Pre-signed URL service connects to Azure Blob Storage SDK, ensuring container `media-assets` exists with public blob read access.
- Generates write-only pre-signed SAS tokens for user-submitted media files (images, video snippets).
- Frontend Post Composer requests pre-signed SAS tokens, performs direct-to-cloud binary uploads, and embeds the public Azure Blob URL in new posts.
- Newsfeed and Post Cards render high-resolution images hosted on Azure Blob Storage.

---

## 3. Tech Stack & Dependencies
- **Cloud Storage:** Microsoft Azure Blob Storage (`socialmediaanalysis.blob.core.windows.net`)
- **Backend SDK:** `com.azure:azure-storage-blob:12.28.1` (already declared in `presigned-url-service/pom.xml`)
- **Runtime:** Java 21, Spring Boot 3.4.2
- **Frontend:** React 19, TypeScript 5.8, Meta Astryx (`@astryxdesign/core`)
- **E2E Testing:** Node.js native test runner (`node:test`) + Chrome DevTools Protocol (CDP)

---

## 4. Commands
- **Configure Credentials (Local Disk Only):**
  ```bash
  # Inject connection string into backend/.env (untracked)
  sed -i 's|^# AZURE_STORAGE_CONNECTION_STRING=.*|AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=socialmediaanalysis;AccountKey=...;EndpointSuffix=core.windows.net"|' backend/.env
  ```
- **Health Check & Container Verification:**
  ```bash
  ./scripts/check-azure-storage.sh
  ```
- **Microservice Unit & Integration Tests:**
  ```bash
  mvn test -f backend/pom.xml -pl presigned-url-service
  ```
- **Frontend Media Client Unit Tests:**
  ```bash
  cd frontend && npm run test:unit
  ```
- **E2E Browser Upload & DevTools Verification:**
  ```bash
  node tests/e2e-azure-upload.test.mjs
  ```
- **Launch Backend Daemon with Azure Storage Configured:**
  ```bash
  ./scripts/run-services-daemon.sh
  ```

---

## 5. Project Structure
```
backend/
├── .env                                       → Untracked local credentials
├── .env.example                               → Safe template documentation
├── presigned-url-service/
│   ├── src/main/java/com/social/presign/
│   │   ├── PresignedUrlApplication.java       → Spring Boot entrypoint
│   │   ├── controller/PresignedUrlController.java → REST controller (/v1/media/*)
│   │   └── service/AzureBlobSasService.java   → Azure SDK client & SAS token builder
│   └── src/test/java/com/social/presign/
│       └── AzureBlobIntegrationTest.java      → Cloud integration tests
frontend/
├── src/api/mediaApi.ts                        → Direct Azure Blob PUT upload helper
├── src/app/feed/PostComposer.tsx              → Live Azure upload with progress indicator
scripts/
├── check-azure-storage.sh                     → CLI health check & container validator
└── run-services-daemon.sh                     → Injects AZURE_STORAGE_CONNECTION_STRING into JVM
tests/
└── e2e-azure-upload.test.mjs                  → Headless Chrome CDP E2E verification
docs/
├── specs/SPEC-azure-blob-storage-integration.md  → This document
└── reports/azure-blob-storage-verification.md    → Final certification report
```

---

## 6. Code Style & Conventions
- **Azure SDK Client Creation:**
  ```java
  BlobServiceClient serviceClient = new BlobServiceClientBuilder()
          .connectionString(connectionString)
          .buildClient();
  BlobContainerClient containerClient = serviceClient.getBlobContainerClient(containerName);
  if (!containerClient.exists()) {
      containerClient.createWithResponse(null, PublicAccessType.BLOB, null, Context.NONE);
  }
  ```
- **Direct Frontend Cloud Upload:**
  ```typescript
  // Azure Blob Storage requires x-ms-blob-type header for BlockBlob uploads
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': contentType,
    },
    body: fileData,
  });
  ```

---

## 7. Testing Strategy
1. **Azure Storage Account Health Check:** Test script connects to Azure API, verifies account authentication, lists containers, and ensures `media-assets` container exists with public access.
2. **Presigned URL Service Integration Tests:** Issue request to `/v1/media/presign-upload`, verify returned `uploadUrl` contains valid `sig` parameter, upload a synthetic payload via SAS, and verify HTTP GET on `publicBlobUrl` returns exact bytes.
3. **Frontend API Unit Tests:** Validate `mediaApi.uploadBlob` sends required `x-ms-blob-type: BlockBlob` and proper content type headers.
4. **End-to-End Headless Chrome CDP Test:** Launch browser, log into SMCAS, attach a real JPEG file in Post Composer, confirm direct Azure PUT upload completes, submit post, and verify new post card displays rendered image hosted on `https://socialmediaanalysis.blob.core.windows.net/media-assets/...`.

---

## 8. Boundaries
- **Always:**
  - Store connection strings exclusively in `backend/.env` (excluded by `.gitignore`).
  - Sanitize uploaded file names to avoid directory traversal or URL encoding issues.
  - Set `x-ms-blob-type: BlockBlob` header on client PUT requests.
  - Preserve simulated SAS fallback when connection string is not provided.
- **Ask First:**
  - Changing target container name away from `media-assets`.
  - Storing uploaded media blobs as private (requiring download SAS signatures).
- **Never:**
  - Commit Azure Storage Account Keys or connection strings to git.
  - Expose Account Key to the frontend client (frontend receives only time-limited write SAS URLs).
  - Block UI rendering on storage connection failure.

---

## 9. Success Criteria
1. `check-azure-storage.sh` authenticates with `socialmediaanalysis` and validates container `media-assets`.
2. `/v1/media/presign-upload` returns a signed Azure Blob URL with 15-minute expiry.
3. Client successfully uploads binary data directly to Azure Blob Storage via pre-signed SAS URL.
4. Uploaded media blob is publicly viewable over HTTPS at `https://socialmediaanalysis.blob.core.windows.net/media-assets/...`.
5. Newsfeed post created with an uploaded image displays the live Azure-hosted image on desktop and mobile viewports.
6. 100% test pass rate across `presigned-url-service` tests, frontend unit tests, and Chrome CDP E2E verification test.

---

## 10. Open Questions
*None. All requirements confirmed via `/interview-me`.*
