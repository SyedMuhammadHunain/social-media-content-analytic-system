// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Media, Azure Storage, Google Auth, and Video Playback Test Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '..');

test('Profile Media Synchronization, Azure Storage, Google Re-Login & Video Suite', async (suite) => {
  await suite.test('1. Profile UI Dual-State Synchronization in NewsFeedPage', () => {
    const pageSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'app', 'feed', 'NewsFeedPage.tsx'),
      'utf-8'
    );

    // Verify handleOpenProfile clears viewedUser to cleanly display live user state
    assert.ok(
      pageSrc.includes('setViewedUser(null);'),
      'handleOpenProfile must clear viewedUser to prioritize live user state'
    );

    // Verify isViewingOwn logic
    assert.ok(
      pageSrc.includes('const isViewingOwn ='),
      'isViewingOwn condition must be present'
    );
    assert.ok(
      pageSrc.includes('const activeProfile: UserProfile = isViewingOwn'),
      'activeProfile must resolve directly to user when viewing own profile'
    );

    // Verify onUpdateAvatar and onUpdateBanner update both user and viewedUser
    assert.ok(
      pageSrc.includes("setViewedUser((prev: any) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));"),
      'onUpdateAvatar must synchronously update viewedUser'
    );
    assert.ok(
      pageSrc.includes("setViewedUser((prev: any) => (prev ? { ...prev, coverBannerUrl: newBannerUrl } : null));"),
      'onUpdateBanner must synchronously update viewedUser'
    );
  });

  await suite.test('2. Azure Blob Storage Upload in ProfileHeaderBanner', () => {
    const bannerSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'components', 'profile', 'ProfileHeaderBanner.tsx'),
      'utf-8'
    );

    // Verify mediaApi upload integration
    assert.ok(
      bannerSrc.includes('mediaApi.getPresignedUploadUrl'),
      'ProfileHeaderBanner must request presigned SAS upload URL'
    );
    assert.ok(
      bannerSrc.includes('mediaApi.uploadBlob'),
      'ProfileHeaderBanner must upload BlockBlob to Azure Blob Storage'
    );

    // Verify loading and fallback states
    assert.ok(
      bannerSrc.includes('isUploadingBanner'),
      'Banner upload loading state must be tracked'
    );
    assert.ok(
      bannerSrc.includes('isUploadingAvatar'),
      'Avatar upload loading state must be tracked'
    );
    assert.ok(
      bannerSrc.includes('URL.createObjectURL(file)'),
      'Local object URL fallback must be provided if offline'
    );
  });

  await suite.test('3. Cover Banner & Bio Persistence in Backend and Frontend Auth', () => {
    // 1. Backend DTO
    const authResponseJava = fs.readFileSync(
      path.join(repoRoot, 'backend', 'common-models', 'src', 'main', 'java', 'com', 'social', 'common', 'dto', 'AuthResponse.java'),
      'utf-8'
    );
    assert.ok(
      authResponseJava.includes('private String coverBannerUrl;'),
      'AuthResponse.java must include coverBannerUrl field'
    );
    assert.ok(
      authResponseJava.includes('private String bio;'),
      'AuthResponse.java must include bio field'
    );

    // 2. Gateway Auth Service
    const gatewayAuthJava = fs.readFileSync(
      path.join(repoRoot, 'backend', 'api-gateway', 'src', 'main', 'java', 'com', 'social', 'gateway', 'service', 'GatewayAuthService.java'),
      'utf-8'
    );
    assert.ok(
      gatewayAuthJava.includes('.coverBannerUrl(user.getCoverBannerUrl())'),
      'GatewayAuthService must populate coverBannerUrl from user entity'
    );
    assert.ok(
      gatewayAuthJava.includes('.bio(user.getBio())'),
      'GatewayAuthService must populate bio from user entity'
    );

    // 3. Frontend authApi interface
    const authApiSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'api', 'authApi.ts'),
      'utf-8'
    );
    assert.ok(
      authApiSrc.includes('coverBannerUrl?: string;'),
      'Frontend AuthResponse must include coverBannerUrl'
    );

    // 4. AuthContext rehydration
    const authContextSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'context', 'AuthContext.tsx'),
      'utf-8'
    );
    assert.ok(
      authContextSrc.includes('coverBannerUrl: res.coverBannerUrl'),
      'AuthContext must restore coverBannerUrl upon login'
    );
  });

  await suite.test('4. Deterministic Google OAuth Re-Login Flow & Security Hardening', () => {
    const modalSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'app', 'login-card', 'GoogleOAuthModal.tsx'),
      'utf-8'
    );
    const gatewayAuthJava = fs.readFileSync(
      path.join(repoRoot, 'backend', 'api-gateway', 'src', 'main', 'java', 'com', 'social', 'gateway', 'service', 'GatewayAuthService.java'),
      'utf-8'
    );

    // Verify Google modal passes stable accounts
    assert.ok(
      modalSrc.includes('googleId:'),
      'GoogleOAuthModal must specify deterministic googleId'
    );

    // Verify backend enforces strict BCrypt password matching without backdoors
    assert.ok(
      !gatewayAuthJava.includes('"password123".equals(rawPassword)'),
      'Backend GatewayAuthService must NOT contain hardcoded password123 bypass'
    );
    assert.ok(
      !gatewayAuthJava.includes('"admin123".equals(rawPassword)'),
      'Backend GatewayAuthService must NOT contain hardcoded admin123 bypass'
    );
    assert.ok(
      !gatewayAuthJava.includes('"password".equals(rawPassword)'),
      'Backend GatewayAuthService must NOT contain hardcoded password bypass'
    );
    assert.ok(
      gatewayAuthJava.includes('passwordEncoder.matches(rawPassword, user.getPasswordHash())'),
      'Backend GatewayAuthService must enforce BCrypt password matching'
    );
  });

  await suite.test('5. Video Playback Stream Repair & Local Fallback Asset', () => {
    const seedSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'mock', 'socialSeedData.ts'),
      'utf-8'
    );
    const viewerSrc = fs.readFileSync(
      path.join(projectRoot, 'src', 'app', 'feed', 'PostMediaViewer.tsx'),
      'utf-8'
    );

    // Check revoked GCS BigBuckBunny is gone
    assert.ok(
      !seedSrc.includes('commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
      'Revoked GCS BigBuckBunny.mp4 URL must not be present in socialSeedData'
    );

    // Check public sample video asset exists and is playable
    const sampleVideoPath = path.join(projectRoot, 'public', 'sample-video.mp4');
    assert.ok(fs.existsSync(sampleVideoPath), 'sample-video.mp4 must exist in public directory');
    const stats = fs.statSync(sampleVideoPath);
    assert.ok(stats.size > 100000, 'sample-video.mp4 must be a valid video file (>100KB)');

    // Check viewer fallback
    assert.ok(
      viewerSrc.includes('/sample-video.mp4'),
      'PostMediaViewer must provide fallback to /sample-video.mp4 on network or decoding error'
    );
  });
});
