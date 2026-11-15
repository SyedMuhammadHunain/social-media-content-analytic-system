# SMCAS Production Azure Cloud Backend Deployment Report

**Date:** 2026-11-15  
**Deployment Target:** Microsoft Azure Linux VM (Sweden Central)  
**Public Hostname:** `smcas-backend.swedencentral.cloudapp.azure.com`  
**Public IP Address:** `4.225.217.36`  
**SSL/TLS:** Let's Encrypt Automated Certificate (`certbot 2.9.0`)  
**Reverse Proxy:** Nginx 1.24.0 (HTTP/2, TLSv1.2/1.3, ACME Webroot, 50MB payload limits)  
**System Architecture:** Ubuntu 24.04 LTS, OpenJDK 21 LTS, 2GB Virtual Swap, Systemd Daemon Management  

---

## 1. Executive Summary

All 8 microservices belonging to the Social Media Content Analysis System (SMCAS) have been deployed, configured, and smoke-verified on Microsoft Azure. The entire deployment operates within the GitHub Student Developer Pack $100 Azure credit tier with zero out-of-pocket expenses.

The backend is accessible over secure HTTPS at:
```
https://smcas-backend.swedencentral.cloudapp.azure.com
```

### Microservice Cluster Status
| Port | Service Name | Status | Memory Heap Limit | Protocol / Mapping |
|---|---|---|---|---|
| **8080** | `api-gateway` | **RUNNING** | 160MB | Spring Cloud Gateway (Reverse routing) |
| **8081** | `post-writer-service` | **RUNNING** | 160MB | `/v1/posts/**` |
| **8082** | `presigned-url-service` | **RUNNING** | 160MB | `/v1/media/**` (Azure Blob Storage SAS) |
| **8083** | `like-unlike-service` | **RUNNING** | 160MB | `/v1/like/**`, `/v1/unlike/**` |
| **8084** | `follow-service` | **RUNNING** | 160MB | `/v1/follow/**`, `/v1/unfollow/**` |
| **8085** | `comment-service` | **RUNNING** | 160MB | `/v1/comment/**` |
| **8086** | `newsfeed-generator-service` | **RUNNING** | 160MB | Fan-out engine |
| **8087** | `newsfeed-reader-service` | **RUNNING** | 160MB | `/v1/feeds/**` |

---

## 2. Infrastructure & System Hardening

1. **Memory Protection:** Configured 2GB swap (`/swapfile`) with `vm.swappiness=10`. This expands total available memory from 1GB to 3GB, preventing Out-Of-Memory (OOM) killer terminations during peak concurrency.
2. **Reverse Proxy & TLS Termination:** Nginx terminates TLS certificates issued automatically by Let's Encrypt for `smcas-backend.swedencentral.cloudapp.azure.com`. Port 80 automatically redirects to port 443 with HSTS headers.
3. **CORS Governance:** `api-gateway` dynamically supports Vercel preview and production origins (`https://*.vercel.app`) and local development origins, with full preflight OPTIONS caching.
4. **Resilience & Auto-Restart:** Configured systemd service `/etc/systemd/system/smcas-backend.service` to auto-launch all 8 microservices upon VM boot and monitor process health.

---

## 3. Automated Smoke Test Results

Verification script [`scripts/verify-cloud-deployment.sh`](file:///home/prx/Projects/social-media-content-analytic-system/scripts/verify-cloud-deployment.sh) executed against the live cloud instance:

```text
==================================================================
 SMCAS Production Cloud Deployment Smoke Verification
 Target Gateway: https://smcas-backend.swedencentral.cloudapp.azure.com
==================================================================
 [PASS] Checking: Spring Cloud Gateway Health Endpoint
 [PASS] Checking: CORS Preflight (Origin: https://smcas.vercel.app)
 [PASS] Checking: Newsfeed Hydration (/v1/feeds/test-user) (MongoDB Atlas)
 [PASS] Checking: Azure Blob Storage Pre-Signed SAS Generation (/v1/media/presign)
 [PASS] Checking: Direct Chat Messages Endpoint (/v1/chat/messages)
 [PASS] Checking: Notification Feed Endpoint (/v1/notifications/test-user)
------------------------------------------------------------------
 SMOKE VERIFICATION PASSED: 6/6 endpoints verified functional.
 Gateway is ready to serve Vercel frontend requests.
==================================================================
```

---

## 4. Next Step: Connecting Frontend on Vercel

To deploy the React client to Vercel:

1. **Import Git Repository:** In the Vercel Dashboard, select **Add New...** -> **Project**, and import the repository.
2. **Set Root Directory:** Click **Edit** next to Root Directory and set it to:
   ```
   frontend
   ```
3. **Configure Environment Variable:** Under **Environment Variables**, add:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://smcas-backend.swedencentral.cloudapp.azure.com`
4. **Deploy:** Click **Deploy**. Vercel will build the frontend with Vite and apply the client routing rewrite from [`frontend/vercel.json`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/vercel.json).
