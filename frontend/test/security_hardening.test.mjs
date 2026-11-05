// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Security & Hardening Regression Test Suite

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

test('Security & Hardening Regression Suite (OWASP Top 10)', async (suite) => {
  await suite.test('1. Git repository does not track live .env credential files', () => {
    const gitTracked = execSync('git ls-files "*.env" "**/.env*"', { cwd: repoRoot, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    for (const file of gitTracked) {
      assert.ok(
        file.endsWith('.example'),
        `Tracked file ${file} must only be an .example template, never a live credential file`
      );
    }
  });

  await suite.test('2. .gitignore comprehensively covers sensitive environment files', () => {
    const gitignoreContent = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf-8');
    assert.ok(gitignoreContent.includes('.env'), '.gitignore must ignore .env');
    assert.ok(gitignoreContent.includes('backend/.env'), '.gitignore must ignore backend/.env');
    assert.ok(gitignoreContent.includes('frontend/.env'), '.gitignore must ignore frontend/.env');
  });

  await suite.test('3. backend/.env.example provides sanitized templates and documents JWT_SECRET', () => {
    const envExamplePath = path.join(repoRoot, 'backend', '.env.example');
    assert.ok(fs.existsSync(envExamplePath), 'backend/.env.example must exist');

    const content = fs.readFileSync(envExamplePath, 'utf-8');
    assert.ok(content.includes('JWT_SECRET'), '.env.example must document JWT_SECRET');
    assert.ok(content.includes('MONGODB_URI'), '.env.example must document MONGODB_URI');
    assert.ok(content.includes('AZURE_STORAGE_CONNECTION_STRING'), '.env.example must document Azure storage');
    assert.ok(!content.includes('QTV6Uh0SyTFdM1BP'), '.env.example must NOT contain live cluster password');
  });

  await suite.test('4. GatewayAuthService strictly rejects backdoor bypasses in authentication', () => {
    const gatewayAuthJava = fs.readFileSync(
      path.join(
        repoRoot,
        'backend',
        'api-gateway',
        'src',
        'main',
        'java',
        'com',
        'social',
        'gateway',
        'service',
        'GatewayAuthService.java'
      ),
      'utf-8'
    );

    // Verify backdoors are completely eliminated
    assert.ok(
      !gatewayAuthJava.includes('"password123".equals(rawPassword)'),
      'Must NOT contain password123 bypass'
    );
    assert.ok(
      !gatewayAuthJava.includes('"admin123".equals(rawPassword)'),
      'Must NOT contain admin123 bypass'
    );
    assert.ok(
      !gatewayAuthJava.includes('"password".equals(rawPassword)'),
      'Must NOT contain password fallback bypass'
    );
    assert.ok(
      !gatewayAuthJava.includes('rawPassword.startsWith("goog_oauth_")'),
      'Must NOT contain goog_oauth_ password prefix bypass'
    );

    // Verify strict BCrypt verification is present
    assert.ok(
      gatewayAuthJava.includes('passwordEncoder.matches(rawPassword, user.getPasswordHash())'),
      'Must enforce BCrypt matching against user passwordHash'
    );
  });

  await suite.test('5. JwtTokenProvider enforces cryptographic HMAC-SHA256 and constant-time verification', () => {
    const jwtProviderJava = fs.readFileSync(
      path.join(
        repoRoot,
        'backend',
        'api-gateway',
        'src',
        'main',
        'java',
        'com',
        'social',
        'gateway',
        'security',
        'JwtTokenProvider.java'
      ),
      'utf-8'
    );

    assert.ok(jwtProviderJava.includes('HmacSHA256'), 'Must use HmacSHA256 algorithm');
    assert.ok(
      jwtProviderJava.includes('MessageDigest.isEqual'),
      'Must use MessageDigest.isEqual for constant-time comparison against timing attacks'
    );
    assert.ok(jwtProviderJava.includes('validateToken'), 'Must provide validateToken method');
  });

  await suite.test('6. Frontend authGoogleHandler delegates to server endpoint without client password fabrication', () => {
    const handlerSrc = fs.readFileSync(
      path.join(repoRoot, 'frontend', 'src', 'context', 'authGoogleHandler.ts'),
      'utf-8'
    );

    assert.ok(
      handlerSrc.includes('authApi.loginWithGoogle'),
      'authGoogleHandler must delegate to dedicated server endpoint authApi.loginWithGoogle'
    );
    assert.ok(
      !handlerSrc.includes('googlePassword: string'),
      'authGoogleHandler must not carry or generate googlePassword field'
    );
  });
});
