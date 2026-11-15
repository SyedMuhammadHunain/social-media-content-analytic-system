# Active Tasks: Full-Stack Deployment (Vercel Frontend + Azure VM Backend)

Plan: `tasks/plan.md`

- [x] Task 1: Update `api-gateway` CORS configuration for Vercel and dynamic origins
  - **Description:** Update `CorsConfig.java` in `api-gateway` to allow `https://*.vercel.app` pattern and allow reading an optional comma-separated environment variable `ALLOWED_ORIGIN_PATTERNS`. This prevents browser CORS preflight blocking when the Vercel-hosted frontend calls the Azure backend.
  - **Acceptance criteria:**
    - [x] `CorsConfig.java` allows `https://*.vercel.app` pattern alongside `localhost` and `127.0.0.1`.
    - [x] Optional environment variable `ALLOWED_ORIGIN_PATTERNS` overrides or extends origin patterns.
    - [x] `api-gateway` compiles and passes tests without errors.
  - **Verification:**
    - [x] `cd backend/api-gateway && mvn test-compile`
  - **Dependencies:** None
  - **Files likely touched:**
    - `backend/api-gateway/src/main/java/com/social/gateway/config/CorsConfig.java`
  - **Estimated scope:** XS (1 file)

- [x] Task 2: Create `frontend/vercel.json` for SPA routing and asset caching
  - **Description:** Create `frontend/vercel.json` configuring client-side routing rewrites (`"source": "/(.*)", "destination": "/index.html"`) so route refreshes on Vercel do not yield 404s. Include cache-control headers for static assets.
  - **Acceptance criteria:**
    - [x] `frontend/vercel.json` exists with SPA catch-all rewrite rule.
    - [x] `frontend` builds cleanly with `npm run build`.
  - **Verification:**
    - [x] `cd frontend && npm run build`
    - [x] Verify `frontend/vercel.json` syntax with `jq . frontend/vercel.json`
  - **Dependencies:** None
  - **Files likely touched:**
    - `frontend/vercel.json`
  - **Estimated scope:** XS (1 file)

- [x] Task 3: Create multi-service `docker-compose.yml` for backend orchestration
  - **Description:** Create `docker-compose.yml` in repository root (or `deploy/docker/docker-compose.yml`) defining containers for all 8 microservices (`api-gateway`, `presigned-url-service`, `post-writer-service`, `like-unlike-service`, `follow-service`, `comment-service`, `newsfeed-generator-service`, `newsfeed-reader-service`) with JVM memory caps (160MB max), port exposures, and environment variable bindings.
  - **Acceptance criteria:**
    - [x] `docker-compose.yml` cleanly defines all 8 microservice containers.
    - [x] Memory limits (`deploy.resources.limits.memory: 200M`) are defined to prevent VM OOM.
    - [x] Configuration validates via Docker CLI.
  - **Verification:**
    - [x] `docker compose config`
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `docker-compose.yml`
    - `backend/Dockerfile` (or service Dockerfiles)
  - **Estimated scope:** M (2-3 files)

- [x] Task 4: Create Nginx reverse proxy configuration template with SSL support
  - **Description:** Create `deploy/nginx/smcas.conf` configured to reverse proxy external HTTPS traffic to `api-gateway` on port 8080, handling CORS headers, WebSocket / SSE upgrades, request timeouts, and Certbot Let's Encrypt SSL paths.
  - **Acceptance criteria:**
    - [x] `smcas.conf` directs `/` and `/v1/` to `http://127.0.0.1:8080`.
    - [x] Includes SSL parameters and proxy headers (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).
  - **Verification:**
    - [x] `nginx -t -c deploy/nginx/smcas.conf` (or syntax check)
  - **Dependencies:** None
  - **Files likely touched:**
    - `deploy/nginx/smcas.conf`
  - **Estimated scope:** S (1 file)

- [x] Task 5: Create automated Azure VM bootstrap script
  - **Description:** Create `deploy/azure/bootstrap-vm.sh` that automates setting up a fresh Ubuntu 24.04 LTS VM on Azure: configures 2GB swap file (for JVM safety), installs OpenJDK 21, Docker, Docker Compose, Nginx, and Certbot, and sets up firewall rules.
  - **Acceptance criteria:**
    - [x] Script is idempotent and executes unattended with `bash deploy/azure/bootstrap-vm.sh`.
    - [x] Configures swap space to ensure 8 JVM services never crash under burst load.
  - **Verification:**
    - [x] `bash -n deploy/azure/bootstrap-vm.sh` (shell syntax check)
  - **Dependencies:** Task 3, Task 4
  - **Files likely touched:**
    - `deploy/azure/bootstrap-vm.sh`
  - **Estimated scope:** S (1 file)

- [x] Task 6: Create comprehensive step-by-step deployment guide
  - **Description:** Author `docs/deployment/DEPLOYMENT_GUIDE.md` detailing: (1) Creating the Azure B2s Linux VM using GitHub Student credits, (2) Setting Azure DNS and NSG rules (ports 22, 80, 443), (3) Running the VM bootstrap, (4) Starting the backend, (5) Deploying the frontend to Vercel via GitHub with environment variables, and (6) Post-deploy validation.
  - **Acceptance criteria:**
    - [x] Document clearly explains each phase with copy-paste commands and UI screenshots/links.
    - [x] Covers secret configuration (`JWT_SECRET`, `MONGODB_URI`, `AZURE_STORAGE_CONNECTION_STRING`, `VITE_API_BASE_URL`).
  - **Verification:**
    - [x] Review markdown rendering and links.
  - **Dependencies:** Task 1-5
  - **Files likely touched:**
    - `docs/deployment/DEPLOYMENT_GUIDE.md`
  - **Estimated scope:** M (1 file)

- [x] Task 7: Create automated cloud deployment verification script
  - **Description:** Author `scripts/verify-cloud-deployment.sh` that accepts an API Gateway base URL (e.g. `https://<azure-vm-dns>`) and automatically tests: (1) `/actuator/health`, (2) `/v1/media/presign` (Azure Blob SAS generation), (3) `/v1/posts` (MongoDB read), and (4) CORS response headers for Vercel origin.
  - **Acceptance criteria:**
    - [x] Script executes and prints colored PASS/FAIL status for each health endpoint.
    - [x] Validates HTTPS certificate and CORS preflight.
  - **Verification:**
    - [x] `bash scripts/verify-cloud-deployment.sh http://localhost:8080` against local gateway.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `scripts/verify-cloud-deployment.sh`
  - **Estimated scope:** S (1 file)
