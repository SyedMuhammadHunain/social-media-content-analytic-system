# Comprehensive Security & Hardening Audit Report

**Date:** 2026-11-05  
**Auditor:** Antigravity Security Auditor Agent  
**Scope:** Frontend Architecture, API Gateway, Backend Microservices, Azure Blob Storage, MongoDB Atlas  
**Frameworks:** OWASP Top 10 (2021), OWASP API Security Top 10 (2023)  

---

## 1. Executive Summary

| Severity | Count | Summary |
|---|:---:|---|
| **Critical** | 4 | Hardcoded auth bypasses, client-derived OAuth passwords, forgeable pseudo-JWTs, exposed cloud credentials in `backend/.env`. |
| **High** | 5 | BOLA/IDOR on post/comment deletion, cleartext passwords in `localStorage`, unauthenticated user switching, unrestricted Azure SAS generation, deprecated OAuth implicit grant. |
| **Medium** | 4 | Reverse tabnabbing in media viewer, cleartext HTTP fallback, overly permissive CORS pattern, missing CSP/HSTS. |
| **Low / Info** | 2 | Deprecated `X-XSS-Protection` header, missing backend CVE scanning in CI. |

**Final Security Verdict:** **REJECTED (FAIL / RELEASE BLOCKED)**  
*The codebase contains 4 Critical vulnerabilities that permit remote account takeover, token forgery, and full database access. Production release is blocked pending remediation.*

---

## 2. Critical Findings & Technical Evidence

### 1. [CRITICAL] Authentication Bypass Backdoors in Gateway Auth Service
- **File:** [`backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java#L40-L45`](file:///home/prx/Projects/social-media-content-analytic-system/backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java#L40-L45)
- **OWASP:** A07:2021 – Identification and Authentication Failures
- **Vulnerability:** `GatewayAuthService.login()` permits bypass with static passwords (`password`, `password123`, `admin123`) or if `authProvider == "GOOGLE"` or password starts with `goog_oauth_`.
- **Impact:** An attacker can compromise any user or admin account without knowing the user's password.
- **Fix:** Remove all bypass conditions; enforce strict `BCryptPasswordEncoder.matches()` only.

### 2. [CRITICAL] Client-Side Deterministic "OAuth" Password Scheme
- **File:** [`frontend/src/context/authGoogleHandler.ts#L98-L102`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/src/context/authGoogleHandler.ts#L98-L102)
- **OWASP:** A07:2021 – Identification and Authentication Failures
- **Vulnerability:** Frontend derives a static string `goog_oauth_goog_<email>` instead of performing server-side OAuth 2.0 / OIDC verification.
- **Impact:** Knowing an email address allows direct account takeover without Google interaction.
- **Fix:** Migrate to server-validated OAuth 2.0 Authorization Code Flow with PKCE.

### 3. [CRITICAL] Unsigned, Forgeable Pseudo-JWT Generation
- **File:** [`backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java#L114-L116`](file:///home/prx/Projects/social-media-content-analytic-system/backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java#L114-L116)
- **OWASP:** A02:2021 – Cryptographic Failures
- **Vulnerability:** Tokens are unverified base64 strings (`jwt_<base64(userId:username:timestamp)>`).
- **Impact:** Anyone can craft a valid token for any user ID without a signing key.
- **Fix:** Implement standard signed JWT (HS256/RS256) with JJWT or Nimbus.

### 4. [CRITICAL] Exposed Cloud Infrastructure Secrets in `backend/.env`
- **File:** [`backend/.env`](file:///home/prx/Projects/social-media-content-analytic-system/backend/.env)
- **OWASP:** A05:2021 – Security Misconfiguration
- **Vulnerability:** `backend/.env` contains cleartext MongoDB Atlas admin credentials and Azure Storage Account Keys.
- **Impact:** Potential full exfiltration or destruction of Atlas database and Azure Blob storage.
- **Fix:** Rotate MongoDB Atlas password and Azure Account Key immediately. Ensure `.env` is omitted from builds.

---

## 3. High & Medium Priority Findings

1. **[HIGH] BOLA / IDOR in Microservices:**
   - [`PostWriterController.java#L46-L52`](file:///home/prx/Projects/social-media-content-analytic-system/backend/post-writer-service/src/main/java/com/social/postwriter/controller/PostWriterController.java#L46-L52): Deleting posts and comments accepts client-supplied `userId` without token verification.
2. **[HIGH] Cleartext Password in `localStorage`:**
   - [`authAccountStorage.ts#L81-L99`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/src/context/authAccountStorage.ts#L81-L99): Saves `passwordHash: ctx.password` to browser storage under `social_accounts_v1`.
3. **[HIGH] Unauthenticated User Switching:**
   - [`useAuthActions.ts#L159-L172`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/src/context/useAuthActions.ts#L159-L172): Switches active user session without password verification.
4. **[HIGH] Unrestricted Azure SAS Generation:**
   - [`AzureBlobSasService.java#L36-L56`](file:///home/prx/Projects/social-media-content-analytic-system/backend/presigned-url-service/src/main/java/com/social/presign/service/AzureBlobSasService.java#L36-L56): `/v1/media/presign` is unauthenticated and container is `PublicAccessType.BLOB`.
5. **[MEDIUM] Reverse Tabnabbing:**
   - [`PostMediaViewer.tsx#L99`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/src/app/feed/PostMediaViewer.tsx#L99): `window.open(url, '_blank')` lacks `noopener,noreferrer`.
6. **[MEDIUM] Insecure Protocol Forcing:**
   - [`tokenManager.ts#L36-L40`](file:///home/prx/Projects/social-media-content-analytic-system/frontend/src/api/tokenManager.ts#L36-L40): Resolves gateway URL with `http://` regardless of page protocol.

---

## 4. Positive Security Observations
- **React XSS Immunity:** 0 instances of `dangerouslySetInnerHTML`. Output auto-escaped across all UI components.
- **Path Traversal Protection:** [`AzureBlobSasService.sanitizeFileName`](file:///home/prx/Projects/social-media-content-analytic-system/backend/presigned-url-service/src/main/java/com/social/presign/service/AzureBlobSasService.java) strips `..` and path delimiters.
- **Dependency Audit:** `npm audit` reports 0 known vulnerabilities.
- **Clean Gitignore:** `.env` and `client_secret*.json` properly ignored.

---

## 5. Remediation Priority

1. **Sprint 0 Blockers:**
   - Remove hardcoded bypasses in `GatewayAuthService.java`.
   - Implement cryptographically signed JWTs.
   - Rotate MongoDB Atlas and Azure storage keys.
   - Restrict microservice operations to authenticated gateway identity.
2. **Sprint 1 Enhancements:**
   - Remove cleartext password caching from `localStorage`.
   - Implement server-validated OAuth 2.0 code flow with PKCE.
   - Add CSP and HSTS headers.
