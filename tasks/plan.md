# Implementation Plan: Critical Security Vulnerabilities Remediation

Spec: `docs/reports/security-and-hardening-audit-report.md`

## Overview
Remediate the 4 critical security vulnerabilities identified in the OWASP Top 10 security audit:
1. **Critical 1 (CWE-287 / CWE-798):** Remove all hardcoded authentication bypass backdoors (`password123`, `admin123`, `password`, `goog_oauth_`, `authProvider == "GOOGLE"`) from `GatewayAuthService.java`.
2. **Critical 2 (CWE-384 / CWE-1390):** Replace deterministic client-side pseudo-OAuth password fabrication (`goog_oauth_goog_<email>`) with a secure server-side Google identity exchange endpoint (`POST /v1/auth/google`).
3. **Critical 3 (CWE-345 / CWE-347):** Replace unsigned, forgeable pseudo-tokens (`jwt_<base64>`) with cryptographic HMAC-SHA256 signed JWT tokens featuring constant-time signature verification and expiration validation.
4. **Critical 4 (CWE-798 / CWE-522):** Secure environment credentials (`backend/.env`), enforce restrictive file permissions (600), verify Git ignore rules, document `JWT_SECRET` in `.env.example`, and implement automated gitignore regression guards.

## Architecture Decisions
1. **Zero External Dependency JWT Provider:** Implement standard HMAC-SHA256 compact JWT generator and parser using Java standard library `javax.crypto.Mac` and `java.security.MessageDigest.isEqual` to avoid adding heavy external JAR dependencies.
2. **Dedicated OAuth Exchange Boundary:** Add dedicated `/v1/auth/google` route and DTO in `api-gateway` and `common-models`, decoupling OAuth flows from standard password login.
3. **Strict BCrypt Verification:** Local login strictly evaluates `passwordEncoder.matches(rawPassword, user.getPasswordHash())` with zero bypasses.
4. **Frontend CodeScene 10/10 Invariance:** Keep `authGoogleHandler.ts` and `authApi.ts` modular, maintain 10.00 / 10.00 CodeScene Code Health with zero warnings.
5. **Fail-Safe Offline Mode:** In the frontend, preserve seamless mock-mode fallback when the backend gateway is offline, while using the secure endpoint when the gateway is active.

## Task Dependency Graph
```
Task 1: Auth Bypass Removal (GatewayAuthService.java)
    │
    ▼
Task 2: Cryptographic HMAC-SHA256 JWT Provider (JwtTokenProvider & GatewayAuthService)
    │
    ▼
Task 3: Server Google OAuth Exchange Endpoint & Frontend Refactor (/v1/auth/google & authGoogleHandler.ts)
    │
    ▼
Task 4: Secret Management, Permissions & Security Regression Tests (.env, .gitignore, tests)
```

## Task List

### [x] Task 1: Eliminate Authentication Bypass Backdoors in Gateway Auth Service
- **Description:** Remove static developer fallbacks (`password`, `password123`, `admin123`), OAuth prefix bypasses (`goog_oauth_`), and authProvider bypasses (`GOOGLE`) in `GatewayAuthService.java`. Require strict BCrypt password matching.
- **Files touched:**
  - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
  - `backend/api-gateway/src/test/java/com/social/gateway/service/GatewayAuthServiceTest.java` (new)
- **Acceptance:**
  - Attempting to log into any account with bypass strings (`password123`, `admin123`, `password`) fails with 401 Unauthorized unless the user's actual stored hash matches.
  - Valid user credentials authenticate successfully.
- **Verification:** `mvn test -pl backend/api-gateway`

### [x] Task 2: Implement Cryptographic HMAC-SHA256 Signed JWT Provider
- **Description:** Implement `JwtTokenProvider` using standard Java `javax.crypto.Mac` (HmacSHA256). Generate compact standard JWTs (`header.payload.signature`), validate expiration and constant-time signature match, and integrate with `GatewayAuthService` and `AuthController`.
- **Files touched:**
  - `backend/api-gateway/src/main/java/com/social/gateway/security/JwtTokenProvider.java` (new)
  - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
  - `backend/api-gateway/src/main/java/com/social/gateway/controller/AuthController.java`
  - `backend/api-gateway/src/test/java/com/social/gateway/security/JwtTokenProviderTest.java` (new)
- **Acceptance:**
  - Login and register return cryptographic HMAC-SHA256 signed JWT tokens.
  - Tampered, forged, or expired tokens fail verification.
- **Verification:** `mvn test -pl backend/api-gateway`

### [x] Task 3: Secure Server-Side Google OAuth Endpoint & Refactor Frontend Handler
- **Description:** Add `POST /v1/auth/google` endpoint to `AuthController` and `GatewayAuthService`. Refactor frontend `authGoogleHandler.ts` and `authApi.ts` to call `/v1/auth/google` without fabricating fake client-side passwords.
- **Files touched:**
  - `backend/common-models/src/main/java/com/social/common/dto/GoogleAuthRequest.java` (new)
  - `backend/api-gateway/src/main/java/com/social/gateway/controller/AuthController.java`
  - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
  - `frontend/src/api/authApi.ts`
  - `frontend/src/context/authGoogleHandler.ts`
- **Acceptance:**
  - Google auth executes via dedicated server endpoint without fake password strings.
  - Frontend CodeScene Code Health remains 10.00 / 10.00 with 0 warnings.
- **Verification:** `cd frontend && npx tsc -b && npm run test:unit && cs check`

### [x] Task 4: Secret Management, Permissions & Security Regression Tests
- **Description:** Set restrictive permissions (`chmod 600`) on `backend/.env`, verify `.gitignore` covers all sensitive files, document `JWT_SECRET` in `backend/.env.example`, and write automated test asserting credentials protection and token signing.
- **Files touched:**
  - `.gitignore`
  - `backend/.env`
  - `backend/.env.example`
  - `frontend/test/security_hardening.test.mjs` (new)
- **Acceptance:**
  - `backend/.env` is not tracked and has 600 permissions.
  - Automated test asserts no `.env` files are tracked in git and security constraints are satisfied.
- **Verification:** `cd frontend && node --test test/security_hardening.test.mjs`

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Existing seed users cannot log in if passwords don't match BCrypt hash | High | Ensure seed user password hashes in Mongo database seeder and tests are valid BCrypt hashes for `password123`. |
| Frontend tests breaking due to token format change | Medium | JWT format follows standard compact base64Url strings; tests validating presence of token string continue to pass. |
| Offline demo mode breaking when backend gateway is not running | High | Keep robust fallback to local mock user state in `authGoogleHandler.ts` and `authLoginHandler.ts`. |
