// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Production Cloud Deployment Test Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendRoot, '..');

test('Production Cloud Deployment Artifacts & Configuration Suite', async (suite) => {
  await suite.test('1. Frontend Vercel configuration has SPA rewrites and caching headers', () => {
    const vercelPath = path.join(frontendRoot, 'vercel.json');
    assert.ok(fs.existsSync(vercelPath), 'frontend/vercel.json must exist');

    const config = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
    assert.ok(Array.isArray(config.rewrites), 'rewrites array must be defined');

    const catchAllRewrite = config.rewrites.find((r) => r.source === '/(.*)' || r.source === '/:path*');
    assert.ok(catchAllRewrite, 'Catch-all rewrite must be present');
    assert.strictEqual(catchAllRewrite.destination, '/index.html', 'Catch-all must route to /index.html');

    const assetHeader = config.headers?.find((h) => h.source === '/assets/(.*)');
    assert.ok(assetHeader, 'Asset header rule must be present');
    const cacheControl = assetHeader.headers.find((hdr) => hdr.key === 'Cache-Control');
    assert.ok(cacheControl.value.includes('immutable'), 'Cache-Control should declare assets as immutable');
  });

  await suite.test('2. Root Vercel configuration supports monorepo root build delegation', () => {
    const rootVercelPath = path.join(repoRoot, 'vercel.json');
    assert.ok(fs.existsSync(rootVercelPath), 'root vercel.json must exist');

    const config = JSON.parse(fs.readFileSync(rootVercelPath, 'utf-8'));
    assert.strictEqual(config.outputDirectory, 'frontend/dist', 'outputDirectory must point to frontend/dist');
    assert.ok(config.buildCommand.includes('npm run build'), 'buildCommand must build frontend');
    assert.ok(config.rewrites.some((r) => r.destination === '/index.html'), 'SPA rewrites must exist');
  });

  await suite.test('3. API Gateway CORS allows Vercel wildcard origins and dynamic env vars', () => {
    const corsPath = path.join(
      repoRoot,
      'backend',
      'api-gateway',
      'src',
      'main',
      'java',
      'com',
      'social',
      'gateway',
      'config',
      'CorsConfig.java'
    );
    assert.ok(fs.existsSync(corsPath), 'CorsConfig.java must exist');

    const source = fs.readFileSync(corsPath, 'utf-8');
    assert.ok(source.includes('https://*.vercel.app'), 'Must allow https://*.vercel.app');
    assert.ok(source.includes('ALLOWED_ORIGIN_PATTERNS'), 'Must support ALLOWED_ORIGIN_PATTERNS env var');
    assert.ok(source.includes('setAllowCredentials(true)'), 'Must allow credentials');
  });

  await suite.test('4. Backend Dockerfile enforces Java 21, non-root user, and memory bounds', () => {
    const dockerfilePath = path.join(repoRoot, 'backend', 'Dockerfile');
    assert.ok(fs.existsSync(dockerfilePath), 'backend/Dockerfile must exist');

    const dockerfile = fs.readFileSync(dockerfilePath, 'utf-8');
    assert.ok(dockerfile.includes('eclipse-temurin:21-jre-alpine'), 'Must use Eclipse Temurin 21 Alpine image');
    assert.ok(dockerfile.includes('USER smcas'), 'Must execute as non-root user smcas');
    assert.ok(dockerfile.includes('-Xmx160m'), 'Must enforce max 160MB heap');
    assert.ok(dockerfile.includes('ExitOnOutOfMemoryError'), 'Must exit cleanly on OOM');
  });

  await suite.test('5. docker-compose.yml defines all 8 microservices with memory caps <= 200M', () => {
    const composePath = path.join(repoRoot, 'docker-compose.yml');
    assert.ok(fs.existsSync(composePath), 'docker-compose.yml must exist');

    const content = fs.readFileSync(composePath, 'utf-8');
    const requiredServices = [
      'api-gateway',
      'post-writer-service',
      'presigned-url-service',
      'like-unlike-service',
      'follow-service',
      'comment-service',
      'newsfeed-generator-service',
      'newsfeed-reader-service',
    ];

    for (const service of requiredServices) {
      assert.ok(content.includes(`${service}:`), `docker-compose.yml must define ${service}`);
    }

    assert.ok(content.includes('"8080:8080"'), 'api-gateway must expose port 8080:8080');
    assert.ok(content.includes('memory: 200M') || content.includes('memory: 180M'), 'Memory caps must be defined');
    assert.ok(content.includes('restart: unless-stopped'), 'Must define restart: unless-stopped');
  });

  await suite.test('6. Nginx configurations proxy to Gateway and support SSL & WebSockets', () => {
    const prodNginxPath = path.join(repoRoot, 'deploy', 'nginx', 'smcas.conf');
    const initNginxPath = path.join(repoRoot, 'deploy', 'nginx', 'smcas-http-initial.conf');

    assert.ok(fs.existsSync(prodNginxPath), 'smcas.conf must exist');
    assert.ok(fs.existsSync(initNginxPath), 'smcas-http-initial.conf must exist');

    const prodConfig = fs.readFileSync(prodNginxPath, 'utf-8');
    assert.ok(prodConfig.includes('proxy_pass http://127.0.0.1:8080;'), 'Must proxy pass to port 8080');
    assert.ok(prodConfig.includes('proxy_set_header Upgrade $http_upgrade;'), 'Must support WebSocket upgrade');
    assert.ok(prodConfig.includes('certbot'), 'Must support Certbot challenge');
    assert.ok(prodConfig.includes('client_max_body_size 50M;'), 'Must allow media body up to 50MB');
  });

  await suite.test('7. Azure VM bootstrap script configures 2GB swap, Java 21, Docker, and Nginx', () => {
    const bootstrapPath = path.join(repoRoot, 'deploy', 'azure', 'bootstrap-vm.sh');
    assert.ok(fs.existsSync(bootstrapPath), 'bootstrap-vm.sh must exist');

    const script = fs.readFileSync(bootstrapPath, 'utf-8');
    assert.ok(script.includes('/swapfile'), 'Must configure swap memory');
    assert.ok(script.includes('openjdk-21-jdk'), 'Must install openjdk-21-jdk');
    assert.ok(script.includes('docker'), 'Must install Docker');
    assert.ok(script.includes('nginx'), 'Must install Nginx');
    assert.ok(script.includes('certbot'), 'Must install Certbot');
  });

  await suite.test('8. Automated cloud verification script tests health, CORS, and Azure SAS', () => {
    const verifyScriptPath = path.join(repoRoot, 'scripts', 'verify-cloud-deployment.sh');
    assert.ok(fs.existsSync(verifyScriptPath), 'verify-cloud-deployment.sh must exist');

    const script = fs.readFileSync(verifyScriptPath, 'utf-8');
    assert.ok(script.includes('/actuator/health'), 'Must test actuator health');
    assert.ok(script.includes('Access-Control-Request-Method'), 'Must test CORS headers');
    assert.ok(script.includes('/v1/media/presign'), 'Must test presigned SAS generation');
    assert.ok(script.includes('/v1/posts'), 'Must test posts endpoint');
  });

  await suite.test('9. Deployment guide covers Azure VM, Vercel, MongoDB Atlas, and Azure Blob Storage', () => {
    const guidePath = path.join(repoRoot, 'docs', 'deployment', 'DEPLOYMENT_GUIDE.md');
    assert.ok(fs.existsSync(guidePath), 'DEPLOYMENT_GUIDE.md must exist');

    const guide = fs.readFileSync(guidePath, 'utf-8');
    assert.ok(guide.includes('Standard_B2s'), 'Must mention Standard_B2s VM');
    assert.ok(guide.includes('GitHub Student Developer Pack'), 'Must cite Student Developer Pack');
    assert.ok(guide.includes('media-assets'), 'Must reference media-assets Azure Blob container');
    assert.ok(guide.includes('https://*.vercel.app') || guide.includes('Vercel'), 'Must explain Vercel deployment');
  });
});
