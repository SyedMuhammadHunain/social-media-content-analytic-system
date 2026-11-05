// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Mobile Responsive Navigation & Scroll Unlocking (Task 1)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

test('Mobile Responsive Navigation & Scroll Unlocking (Task 1)', async (suite) => {
  await suite.test('App.tsx does not lock global overflow on html or body', () => {
    const appTsxPath = path.join(projectRoot, 'frontend/src/App.tsx');
    assert.ok(fs.existsSync(appTsxPath), 'App.tsx must exist');

    const appContent = fs.readFileSync(appTsxPath, 'utf8');

    // Confirm that hardcoded overflow: 'hidden' is purged from documentElement & body
    assert.strictEqual(
      appContent.includes("document.documentElement.style.overflow = 'hidden'"),
      false,
      'App.tsx must not set document.documentElement.style.overflow to hidden'
    );
    assert.strictEqual(
      appContent.includes("document.body.style.overflow = 'hidden'"),
      false,
      'App.tsx must not set document.body.style.overflow to hidden'
    );
    assert.ok(
      appContent.includes("overflowX = 'hidden'"),
      'App.tsx should constrain only overflowX to prevent horizontal displacement'
    );
  });

  await suite.test('MobileAppHeader.tsx renders logo and top-right search & hamburger icons', () => {
    const headerPath = path.join(projectRoot, 'frontend/src/app/feed/MobileAppHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'MobileAppHeader.tsx must exist');

    const headerContent = fs.readFileSync(headerPath, 'utf8');

    assert.ok(headerContent.includes('mobile-app-header'), 'Header must have mobile-app-header class');
    assert.ok(headerContent.includes('data-testid="mobile-app-header"'), 'Header must have testid');
    assert.ok(headerContent.includes('data-testid="mobile-header-logo"'), 'Header must have logo testid');
    assert.ok(headerContent.includes('data-testid="mobile-header-actions"'), 'Header must have actions testid');
    assert.ok(headerContent.includes('data-testid="mobile-search-btn"'), 'Header must have search button');
    assert.ok(headerContent.includes('data-testid="mobile-hamburger-btn"'), 'Header must have hamburger button');
    assert.ok(headerContent.includes('icon="search"'), 'Search button must use Astryx search icon');
    assert.ok(headerContent.includes('icon="menu"'), 'Hamburger button must use Astryx menu icon');
  });

  await suite.test('NewsFeedPage.tsx contains mobile media queries for < 768px and >= 768px', () => {
    const newsfeedPath = path.join(projectRoot, 'frontend/src/app/feed/NewsFeedPage.tsx');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');

    assert.ok(
      newsfeedContent.includes('@media (max-width: 767px)'),
      'NewsFeedPage must declare @media (max-width: 767px)'
    );
    assert.ok(
      newsfeedContent.includes('.newsfeed-fixed-sidebar,\n  .newsfeed-right-sidebar {\n    display: none !important;'),
      'Mobile view must hide desktop sidebars'
    );
    assert.ok(
      newsfeedContent.includes('@media (min-width: 768px) {\n  .mobile-app-header'),
      'Desktop view (>= 768px) must hide mobile header'
    );
    assert.ok(
      newsfeedContent.includes('<MobileAppHeader'),
      'NewsFeedPage must render MobileAppHeader'
    );
  });

  await suite.test('MobileBottomNav.tsx renders 5 icons in strict sequential order (Task 2)', () => {
    const bottomNavPath = path.join(projectRoot, 'frontend/src/app/feed/MobileBottomNav.tsx');
    assert.ok(fs.existsSync(bottomNavPath), 'MobileBottomNav.tsx must exist');

    const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');

    // Verify testids and order
    const savedIdx = bottomNavContent.indexOf('data-testid="bottom-nav-saved"');
    const analyticsIdx = bottomNavContent.indexOf('data-testid="bottom-nav-analytics"');
    const createIdx = bottomNavContent.indexOf('data-testid="bottom-nav-create"');
    const notificationsIdx = bottomNavContent.indexOf('data-testid="bottom-nav-notifications"');
    const profileIdx = bottomNavContent.indexOf('data-testid="bottom-nav-profile"');

    assert.ok(savedIdx !== -1, 'Saved icon must be present');
    assert.ok(analyticsIdx !== -1, 'Creator Analytics icon must be present');
    assert.ok(createIdx !== -1, '+ Create Post icon must be present');
    assert.ok(notificationsIdx !== -1, 'Notification icon must be present');
    assert.ok(profileIdx !== -1, 'Profile icon must be present');

    // Strict sequential order
    assert.ok(savedIdx < analyticsIdx, '1. Saved must precede 2. Analytics');
    assert.ok(analyticsIdx < createIdx, '2. Analytics must precede 3. + Create Post (center)');
    assert.ok(createIdx < notificationsIdx, '3. + Create Post must precede 4. Notifications');
    assert.ok(notificationsIdx < profileIdx, '4. Notifications must precede 5. Profile');

    // Check Astryx primitives
    assert.ok(bottomNavContent.includes('@astryxdesign/core/IconButton'), 'Must use Astryx IconButton');
    assert.ok(bottomNavContent.includes('@astryxdesign/core/Icon'), 'Must use Astryx Icon');
  });

  await suite.test('NewsFeedPage.tsx wires MobileBottomNav to view swapping and hides on desktop (Task 2)', () => {
    const newsfeedPath = path.join(projectRoot, 'frontend/src/app/feed/NewsFeedPage.tsx');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');

    assert.ok(newsfeedContent.includes('<MobileBottomNav'), 'NewsFeedPage must render MobileBottomNav');
    assert.ok(newsfeedContent.includes('activeItem={activeMobileNav}'), 'MobileBottomNav must receive activeMobileNav');
    assert.ok(newsfeedContent.includes("onSelectSaved="), 'Must wire onSelectSaved');
    assert.ok(newsfeedContent.includes("onSelectAnalytics="), 'Must wire onSelectAnalytics');
    assert.ok(newsfeedContent.includes("onSelectCreate="), 'Must wire onSelectCreate');
    assert.ok(newsfeedContent.includes("onSelectNotifications="), 'Must wire onSelectNotifications');
    assert.ok(newsfeedContent.includes("onSelectProfile="), 'Must wire onSelectProfile');
    assert.ok(newsfeedContent.includes('.mobile-bottom-nav {\n    display: none !important;'), 'Must hide mobile bottom nav on desktop');
  });
});
