# Active Tasks: Critical Security Vulnerabilities Remediation

Spec: `docs/reports/security-and-hardening-audit-report.md`
Plan: `tasks/plan.md`

- [x] Task 1: Eliminate Authentication Bypass Backdoors in Gateway Auth Service
  - **Description:** Remove static developer fallbacks (`password`, `password123`, `admin123`), OAuth prefix bypasses (`goog_oauth_`), and authProvider bypasses (`GOOGLE`) in `GatewayAuthService.java`. Require strict BCrypt password matching.
  - **Acceptance criteria:**
    - [x] `password123`, `admin123`, `password`, or `goog_oauth_*` cannot be used to bypass authentication for arbitrary accounts.
    - [x] Accounts with legitimate passwords validate correctly with `passwordEncoder.matches()`.
    - [x] Failed login attempts return 401 Unauthorized with "Invalid username or password".
    - [x] Unit tests in `GatewayAuthServiceTest.java` verify bypass rejection and valid password success.
  - **Verification:**
    - [x] Backend test: `cd backend && mvn test -pl api-gateway` (19/19 passed)
    - [x] Frontend test: `cd frontend && npm run test:unit` (104/104 passed)
  - **Dependencies:** None
  - **Files likely touched:**
    - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
    - `backend/api-gateway/src/test/java/com/social/gateway/service/GatewayAuthServiceTest.java`

- [ ] Task 2: Implement Cryptographic HMAC-SHA256 Signed JWT Provider
  - **Description:** Implement `JwtTokenProvider` using standard Java `javax.crypto.Mac` (HmacSHA256). Generate compact standard JWTs (`header.payload.signature`), validate expiration and constant-time signature match, and integrate with `GatewayAuthService` and `AuthController`.
  - **Acceptance criteria:**
    - [ ] Compact standard JWTs generated with header `{"alg":"HS256","typ":"JWT"}` and signed with HMAC-SHA256.
    - [ ] Token claims contain `sub` (userId), `username`, `email`, `iat`, and `exp`.
    - [ ] Constant-time signature comparison using `MessageDigest.isEqual` to prevent timing attacks.
    - [ ] Endpoint `/v1/auth/verify` validates tokens and rejects forged/expired tokens.
    - [ ] Unit tests verify token generation, valid verification, and rejection of tampered/expired tokens.
  - **Verification:**
    - [ ] Backend test: `cd backend && mvn test -pl api-gateway`
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `backend/api-gateway/src/main/java/com/social/gateway/security/JwtTokenProvider.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/controller/AuthController.java`
    - `backend/api-gateway/src/test/java/com/social/gateway/security/JwtTokenProviderTest.java`

- [ ] Task 3: Secure Server-Side Google OAuth Endpoint & Refactor Frontend Handler
  - **Description:** Add `POST /v1/auth/google` endpoint to `AuthController` and `GatewayAuthService`. Refactor frontend `authGoogleHandler.ts` and `authApi.ts` to call `/v1/auth/google` without fabricating fake client-side passwords.
  - **Acceptance criteria:**
    - [ ] `GoogleAuthRequest` DTO defined with `email`, `name`, `avatarUrl`, `googleId`.
    - [ ] `POST /v1/auth/google` creates or retrieves Google user and returns signed JWT without fake passwords.
    - [ ] Frontend `authGoogleHandler.ts` removes `GOOGLE_OAUTH_PREFIX` and static password fabrication.
    - [ ] Frontend falls back cleanly to local mock user when backend is offline.
    - [ ] Frontend CodeScene Code Health remains 10.00 / 10.00 with 0 warnings.
  - **Verification:**
    - [ ] Backend test: `cd backend && mvn test -pl common-models,api-gateway`
    - [ ] Frontend test: `cd frontend && npx tsc -b && npm run test:unit`
    - [ ] CodeScene check: `cs check frontend/src/context/authGoogleHandler.ts frontend/src/api/authApi.ts`
  - **Dependencies:** Task 1, Task 2
  - **Files likely touched:**
    - `backend/common-models/src/main/java/com/social/common/dto/GoogleAuthRequest.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/controller/AuthController.java`
    - `backend/api-gateway/src/main/java/com/social/gateway/service/GatewayAuthService.java`
    - `frontend/src/api/authApi.ts`
    - `frontend/src/context/authGoogleHandler.ts`

- [ ] Task 4: Secret Management, Permissions & Security Regression Tests
  - **Description:** Set restrictive permissions (`chmod 600`) on `backend/.env`, verify `.gitignore` covers all sensitive files, document `JWT_SECRET` in `backend/.env.example`, and write automated test asserting credentials protection and token signing.
  - **Acceptance criteria:**
    - [ ] `backend/.env` file permissions set to 600 (owner read/write only).
    - [ ] `.gitignore` contains explicit patterns blocking `.env`, `*.env`, `.env.*`.
    - [ ] `backend/.env.example` documents `JWT_SECRET` and deployment security guidelines.
    - [ ] Automated security regression test passes verifying `.env` isolation and JWT cryptographic signature validity.
  - **Verification:**
    - [ ] Node test: `cd frontend && node --test test/security_hardening.test.mjs`
    - [ ] Full suite: `npm run test:unit`
  - **Dependencies:** Task 1, Task 2, Task 3
  - **Files likely touched:**
    - `.gitignore`
    - `backend/.env.example`
    - `frontend/test/security_hardening.test.mjs`
