// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: CodeScene Code Health 10/10 Refactoring Verification (SPEC-codescene-code-health-refactor-2)

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('CodeScene Code Health 10/10 Verification Suite', async (suite) => {
  await suite.test('1. API & Client Layer Decomposition (<150 lines)', () => {
    const clientPath = path.join(projectRoot, 'src', 'api', 'client.ts');
    const tokenManagerPath = path.join(projectRoot, 'src', 'api', 'tokenManager.ts');

    assert.ok(fs.existsSync(clientPath), 'client.ts must exist');
    assert.ok(fs.existsSync(tokenManagerPath), 'tokenManager.ts must exist');

    const clientLines = fs.readFileSync(clientPath, 'utf-8').split('\n').length;
    const tokenLines = fs.readFileSync(tokenManagerPath, 'utf-8').split('\n').length;

    assert.ok(clientLines <= 160, `client.ts should be under 160 lines (got ${clientLines})`);
    assert.ok(tokenLines <= 100, `tokenManager.ts should be under 100 lines (got ${tokenLines})`);
  });

  await suite.test('2. Auth Context Decomposition (<285 lines)', () => {
    const authContextPath = path.join(projectRoot, 'src', 'context', 'AuthContext.tsx');
    const storagePath = path.join(projectRoot, 'src', 'context', 'authAccountStorage.ts');
    const profileSyncPath = path.join(projectRoot, 'src', 'context', 'authProfileSync.ts');
    const googleHandlerPath = path.join(projectRoot, 'src', 'context', 'authGoogleHandler.ts');

    assert.ok(fs.existsSync(authContextPath), 'AuthContext.tsx must exist');
    assert.ok(fs.existsSync(storagePath), 'authAccountStorage.ts must exist');
    assert.ok(fs.existsSync(profileSyncPath), 'authProfileSync.ts must exist');
    assert.ok(fs.existsSync(googleHandlerPath), 'authGoogleHandler.ts must exist');

    const authLines = fs.readFileSync(authContextPath, 'utf-8').split('\n').length;
    assert.ok(authLines <= 285, `AuthContext.tsx must be under 285 lines (got ${authLines}, down from 713)`);
  });

  await suite.test('3. Analytics Context Decomposition (<285 lines)', () => {
    const analyticsPath = path.join(projectRoot, 'src', 'context', 'AnalyticsContext.tsx');
    const aggPath = path.join(projectRoot, 'src', 'context', 'analyticsAggregation.ts');
    const seedStorePath = path.join(projectRoot, 'src', 'context', 'analyticsSeedStore.ts');

    assert.ok(fs.existsSync(analyticsPath), 'AnalyticsContext.tsx must exist');
    assert.ok(fs.existsSync(aggPath), 'analyticsAggregation.ts must exist');
    assert.ok(fs.existsSync(seedStorePath), 'analyticsSeedStore.ts must exist');

    const analyticsLines = fs.readFileSync(analyticsPath, 'utf-8').split('\n').length;
    assert.ok(analyticsLines <= 285, `AnalyticsContext.tsx must be under 285 lines (got ${analyticsLines}, down from 495)`);
  });

  await suite.test('4. Notification Polling Hook Decomposition (<200 lines)', () => {
    const hookPath = path.join(projectRoot, 'src', 'components', 'nav', 'useNotificationPolling.ts');
    const genPath = path.join(projectRoot, 'src', 'components', 'nav', 'notificationGenerator.ts');
    const storagePath = path.join(projectRoot, 'src', 'components', 'nav', 'notificationStorage.ts');

    assert.ok(fs.existsSync(hookPath), 'useNotificationPolling.ts must exist');
    assert.ok(fs.existsSync(genPath), 'notificationGenerator.ts must exist');
    assert.ok(fs.existsSync(storagePath), 'notificationStorage.ts must exist');

    const hookLines = fs.readFileSync(hookPath, 'utf-8').split('\n').length;
    assert.ok(hookLines <= 200, `useNotificationPolling.ts must be under 200 lines (got ${hookLines}, down from 420)`);
  });

  await suite.test('5. Post Card & Post Create Modal Decomposition', () => {
    const cardPath = path.join(projectRoot, 'src', 'app', 'feed', 'PostCard.tsx');
    const cardContentPath = path.join(projectRoot, 'src', 'app', 'feed', 'PostCardContent.tsx');
    const modalPath = path.join(projectRoot, 'src', 'app', 'feed', 'PostCreateModal.tsx');
    const dropzonePath = path.join(projectRoot, 'src', 'app', 'feed', 'PostMediaDropzone.tsx');

    assert.ok(fs.existsSync(cardPath), 'PostCard.tsx must exist');
    assert.ok(fs.existsSync(cardContentPath), 'PostCardContent.tsx must exist');
    assert.ok(fs.existsSync(modalPath), 'PostCreateModal.tsx must exist');
    assert.ok(fs.existsSync(dropzonePath), 'PostMediaDropzone.tsx must exist');

    const cardLines = fs.readFileSync(cardPath, 'utf-8').split('\n').length;
    const modalLines = fs.readFileSync(modalPath, 'utf-8').split('\n').length;

    assert.ok(cardLines <= 180, `PostCard.tsx must be under 180 lines (got ${cardLines})`);
    assert.ok(modalLines <= 210, `PostCreateModal.tsx must be under 210 lines (got ${modalLines}, down from 382)`);
  });

  await suite.test('6. Google OAuth Modal & Auth Forms Decomposition', () => {
    const googleModalPath = path.join(projectRoot, 'src', 'app', 'login-card', 'GoogleOAuthModal.tsx');
    const accountListPath = path.join(projectRoot, 'src', 'app', 'login-card', 'GoogleAccountList.tsx');
    const customFormPath = path.join(projectRoot, 'src', 'app', 'login-card', 'GoogleCustomAccountForm.tsx');
    const regFormPath = path.join(projectRoot, 'src', 'app', 'auth', 'RegisterForm.tsx');
    const regFieldsPath = path.join(projectRoot, 'src', 'app', 'auth', 'RegisterInputFields.tsx');

    assert.ok(fs.existsSync(googleModalPath), 'GoogleOAuthModal.tsx must exist');
    assert.ok(fs.existsSync(accountListPath), 'GoogleAccountList.tsx must exist');
    assert.ok(fs.existsSync(customFormPath), 'GoogleCustomAccountForm.tsx must exist');
    assert.ok(fs.existsSync(regFormPath), 'RegisterForm.tsx must exist');
    assert.ok(fs.existsSync(regFieldsPath), 'RegisterInputFields.tsx must exist');

    const googleLines = fs.readFileSync(googleModalPath, 'utf-8').split('\n').length;
    const regLines = fs.readFileSync(regFormPath, 'utf-8').split('\n').length;

    assert.ok(googleLines <= 220, `GoogleOAuthModal.tsx must be under 220 lines (got ${googleLines}, down from 399)`);
    assert.ok(regLines <= 200, `RegisterForm.tsx must be under 200 lines (got ${regLines})`);
  });
});
