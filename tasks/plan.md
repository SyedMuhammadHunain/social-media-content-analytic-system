# Implementation Plan: Full-Stack Deployment (Vercel Frontend + Azure VM Backend)

## Overview
Deploy the Social Media Content Analysis System (SMCAS) using the user's GitHub Student Developer Pack credits and existing cloud accounts:
1. Frontend deployed to Vercel (free tier) with automated GitHub CI/CD and custom/preview domains.
2. 8 Spring Boot microservices deployed on a single Azure Linux Virtual Machine (Ubuntu 24.04 LTS, Standard_B2s 2 vCPU / 4GB RAM) funded by GitHub Student Pack $100 Azure credits.
3. Media storage routed to existing Microsoft Azure Blob Storage (`media-assets`).
4. Database persisted on MongoDB Atlas cluster.
5. Nginx reverse proxy with automated Let's Encrypt SSL on Azure VM to provide HTTPS on API Gateway, preventing browser Mixed Content blocking from Vercel.

## Architecture Decisions
- **Cross-Origin Resource Sharing (CORS):**
  Update `CorsConfig.java` in `api-gateway` to allow `https://*.vercel.app` and configurable origins via `ALLOWED_ORIGIN_PATTERNS`, resolving browser preflight rejection when Vercel makes requests to the Azure VM.
- **Frontend SPA Routing on Vercel:**
  Add `frontend/vercel.json` with rewrites (`/(.*) -> /index.html`) so refreshing routes on Vercel does not return 404.
- **Backend Deployment on Azure VM:**
  Provide both a unified `docker-compose.yml` and native daemon scripts (`scripts/start-backend.sh`). A single B2s VM (4GB RAM) comfortably hosts all 8 services with memory caps (-Xms32m -Xmx160m).
- **HTTPS & SSL Termination:**
  Configure an Nginx reverse proxy on the Azure VM listening on ports 80/443 that terminates SSL using Certbot (free Let's Encrypt) and forwards traffic to `http://127.0.0.1:8080`.
- **Zero Out-of-Pocket Expense:**
  Leverage GitHub Student Pack $100 Azure credits for the VM, MongoDB Atlas M0/free cluster, and Vercel free hobby tier.

## Task List

### Phase 1: Frontend & Gateway Deployment Configuration
- [x] Task 1: Update `api-gateway` CORS configuration to allow Vercel origins (`https://*.vercel.app`) and dynamic env var `ALLOWED_ORIGIN_PATTERNS`.
- [x] Task 2: Create `frontend/vercel.json` for SPA client-side routing rewrites and cache headers.

### Checkpoint: Configuration Integrity
- [x] Backend compiles cleanly (`mvn test-compile -pl api-gateway`).
- [x] Frontend builds cleanly (`npm run build`).

### Phase 2: Backend Containerization & Production Reverse Proxy
- [x] Task 3: Create multi-service `docker-compose.yml` orchestrating all 8 microservices with network isolation and memory limits.
- [x] Task 4: Create Nginx reverse proxy configuration template (`deploy/nginx/smcas.conf`) with SSL and WebSocket/SSE support.

### Checkpoint: Local Orchestration
- [x] `docker compose config` validates successfully without syntax errors.
- [x] Nginx configuration passes syntax validation.

### Phase 3: Azure Linux VM Automation & Runbook
- [x] Task 5: Create automated Azure VM bootstrap script (`deploy/azure/bootstrap-vm.sh`) to install Java 21, Docker, Nginx, and Certbot.
- [x] Task 6: Create comprehensive step-by-step deployment runbook (`docs/deployment/DEPLOYMENT_GUIDE.md`) covering Azure VM creation, DNS setup, SSL issuance, and Vercel linking.

### Phase 4: Verification & Smoke Testing
- [x] Task 7: Create automated post-deployment health check script (`scripts/verify-cloud-deployment.sh`) testing Gateway health, Mongo connectivity, and Azure Blob SAS generation.
- [x] Task 8: Implement automated test suite for deployment artifacts (`frontend/test/deployment_artifacts.test.mjs`) and execute full regression verification.

### Checkpoint: Complete Deployment Artifacts
- [x] All 8 tasks implemented, verified, and committed.
- [x] Full automated test suite passes (frontend unit tests, gateway tests, deployment artifact tests).
- [x] Production deployment artifacts ready for execution.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Mixed Content Block (HTTPS Vercel -> HTTP Backend) | High | Enforce Nginx + Certbot Let's Encrypt SSL on Azure VM so all API traffic is HTTPS. |
| CORS Preflight Failures on Vercel | High | Configure `CorsConfig.java` to explicitly allow `https://*.vercel.app` pattern and credentials. |
| Azure VM Out-Of-Memory (OOM) | Medium | Enforce bounded JVM heap flags (`-Xms32m -Xmx160m`) per microservice; configure 2GB swap space on Ubuntu VM. |
| Student Credit Depletion | Low | Standard_B2s costs ~$30/month, leaving >3 months buffer on $100 student credit. Document how to stop VM when inactive. |
