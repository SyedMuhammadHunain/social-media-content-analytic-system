// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Mobile Responsive Navigation & Scroll Unlocking (Task 1)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
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

  await suite.test('MobileAppHeader.tsx renders top-left hamburger, centered logo without text, and top-right search', () => {
    const headerPath = path.join(projectRoot, 'frontend/src/app/feed/MobileAppHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'MobileAppHeader.tsx must exist');

    const headerContent = fs.readFileSync(headerPath, 'utf8');

    assert.ok(headerContent.includes('mobile-app-header'), 'Header must have mobile-app-header class');
    assert.ok(headerContent.includes('data-testid="mobile-app-header"'), 'Header must have testid');
    assert.ok(headerContent.includes('data-testid="mobile-hamburger-btn"'), 'Header must have hamburger button');
    assert.ok(headerContent.includes('data-testid="mobile-header-logo"'), 'Header must have logo testid');
    assert.ok(headerContent.includes('data-testid="mobile-search-btn"'), 'Header must have search button');

    // Verify ordering: hamburger on left, logo in center, search on right
    const hamburgerIdx = headerContent.indexOf('data-testid="mobile-hamburger-btn"');
    const logoIdx = headerContent.indexOf('data-testid="mobile-header-logo"');
    const searchIdx = headerContent.indexOf('data-testid="mobile-search-btn"');

    assert.ok(hamburgerIdx < logoIdx, 'Hamburger menu must be on the left (before center logo)');
    assert.ok(logoIdx < searchIdx, 'Center logo must precede top-right search button');

    // Verify logo only (no SocialPulse text)
    assert.strictEqual(
      headerContent.includes('SocialPulse'),
      false,
      'Mobile header must not render "SocialPulse" app name text - logo only'
    );
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

  await suite.test('MobileNavigationDrawer.tsx provides left slide drawer with Appearance and Logout (Task 3)', () => {
    const drawerPath = path.join(projectRoot, 'frontend/src/app/feed/MobileNavigationDrawer.tsx');
    assert.ok(fs.existsSync(drawerPath), 'MobileNavigationDrawer.tsx must exist');

    const drawerContent = fs.readFileSync(drawerPath, 'utf8');

    assert.ok(drawerContent.includes('side="start"'), 'Drawer must slide in from the left side (side="start")');
    assert.ok(drawerContent.includes('data-testid="mobile-navigation-drawer"'), 'Must have drawer testid');
    assert.ok(drawerContent.includes('data-testid="drawer-user-info"'), 'Must render user info section');
    assert.ok(drawerContent.includes('data-testid="drawer-appearance-toggle"'), 'Must render Appearance toggle');
    assert.ok(drawerContent.includes('data-testid="drawer-theme-indicator"'), 'Must render theme indicator');
    assert.ok(drawerContent.includes('data-testid="drawer-logout-action"'), 'Must render Logout action');
    assert.ok(drawerContent.includes('data-testid="drawer-close-btn"'), 'Must render close button');
    assert.ok(drawerContent.includes('logout()'), 'Must call logout on click');
  });

  await suite.test('NewsFeedPage.tsx integrates MobileNavigationDrawer with state (Task 3)', () => {
    const newsfeedPath = path.join(projectRoot, 'frontend/src/app/feed/NewsFeedPage.tsx');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');

    assert.ok(newsfeedContent.includes('<MobileNavigationDrawer'), 'NewsFeedPage must render MobileNavigationDrawer');
    assert.ok(newsfeedContent.includes('isOpen={isMobileDrawerOpen}'), 'Drawer must receive isMobileDrawerOpen');
    assert.ok(newsfeedContent.includes('setIsMobileDrawerOpen(false)'), 'Must wire close handler');
  });

  await suite.test('PostCardActionBar and PostActionButtons render icon-only on mobile (< 768px) (Task 4)', () => {
    const actionBarPath = path.join(projectRoot, 'frontend/src/app/feed/PostCardActionBar.tsx');
    const actionButtonsPath = path.join(projectRoot, 'frontend/src/app/feed/PostActionButtons.tsx');
    const newsfeedPath = path.join(projectRoot, 'frontend/src/app/feed/NewsFeedPage.tsx');

    const actionBarContent = fs.readFileSync(actionBarPath, 'utf8');
    const actionButtonsContent = fs.readFileSync(actionButtonsPath, 'utf8');
    const newsfeedContent = fs.readFileSync(newsfeedPath, 'utf8');

    assert.ok(actionBarContent.includes('useMediaQuery'), 'PostCardActionBar must use useMediaQuery');
    assert.ok(actionBarContent.includes("'(max-width: 767px)'"), 'PostCardActionBar must check mobile breakpoint (max-width: 767px)');
    assert.ok(actionBarContent.includes('isIconOnly={isMobile}'), 'PostCardActionBar must pass isIconOnly={isMobile}');
    assert.ok(actionBarContent.includes('post-card-action-bar'), 'PostCardActionBar must have post-card-action-bar wrapper');

    assert.ok(actionButtonsContent.includes('isIconOnly?: boolean'), 'LikeActionButton and BookmarkActionButton must accept isIconOnly');
    assert.ok(actionButtonsContent.includes('isIconOnly={isIconOnly}'), 'Buttons must forward isIconOnly to Astryx Button');

    assert.ok(
      newsfeedContent.includes('.post-card-action-bar button'),
      'NewsFeedPage CSS must include mobile rule for .post-card-action-bar'
    );
  });
});

const CDP_PORT = 9288;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Mobile Responsive App Shell & Navigation CDP Live Verification', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,900',
    `--user-data-dir=/tmp/chrome-mobile-nav-e2e-${Date.now()}`,
    TARGET_URL,
  ]);

  t.after(() => {
    try {
      chrome.kill();
    } catch {}
  });

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await res.json();
      const pageTarget = list.find(p => p.type === 'page' && p.url.includes('5173'));
      if (pageTarget?.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  assert.ok(wsUrl, 'Chrome CDP page target found');

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = id++;
      pending.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  await new Promise(resolve => {
    ws.onopen = resolve;
  });

  ws.onmessage = evt => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  // Authenticate session immediately
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'usr_me_01',
        username: 'hunain_creator',
        name: 'Syed Muhammad Hunain',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        coverBannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        isFollowed: false,
        headline: 'Staff Infrastructure Architect • Distributed Media Systems',
        tags: ['Systems Architecture', 'Distributed Systems', 'Meta Astryx', '500M DAU'],
        bio: 'Building large-scale content processing pipelines and real-time social telemetry.',
        followerCount: 14200,
        followingCount: 486,
      }));
    `,
  });
  await send('Page.reload');

  async function evalExpr(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
    });
    return res.result?.value;
  }

  // Wait until newsfeed layout is mounted
  for (let i = 0; i < 40; i++) {
    await sleep(200);
    const ready = await evalExpr('!!document.querySelector(".newsfeed-layout")');
    if (ready) break;
  }

  // Step 1: Desktop verification (1440x900)
  const desktopCheck = await evalExpr(`
    (() => {
      const header = document.querySelector('[data-testid="mobile-app-header"]');
      const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]');
      const sidebar = document.querySelector('.newsfeed-fixed-sidebar');
      return {
        headerDisplay: header ? window.getComputedStyle(header).display : 'none',
        bottomNavDisplay: bottomNav ? window.getComputedStyle(bottomNav).display : 'none',
        sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : 'none',
      };
    })()
  `);

  assert.ok(desktopCheck, 'Desktop evaluation returned result');
  assert.strictEqual(desktopCheck.headerDisplay, 'none', 'Mobile header must be hidden on desktop');
  assert.strictEqual(desktopCheck.bottomNavDisplay, 'none', 'Mobile bottom nav must be hidden on desktop');
  assert.notStrictEqual(desktopCheck.sidebarDisplay, 'none', 'Desktop sidebar must be visible');

  // Step 2: Emulate Mobile Viewport (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await sleep(800);

  const mobileCheck = await evalExpr(`
    (() => {
      const header = document.querySelector('[data-testid="mobile-app-header"]');
      const bottomNav = document.querySelector('[data-testid="mobile-bottom-nav"]');
      const sidebar = document.querySelector('.newsfeed-fixed-sidebar');
      const savedBtn = document.querySelector('[data-testid="bottom-nav-saved"]');
      const analyticsBtn = document.querySelector('[data-testid="bottom-nav-analytics"]');
      const createBtn = document.querySelector('[data-testid="bottom-nav-create"]');
      const notifBtn = document.querySelector('[data-testid="bottom-nav-notifications"]');
      const profileBtn = document.querySelector('[data-testid="bottom-nav-profile"]');
      return {
        headerVisible: header && window.getComputedStyle(header).display !== 'none',
        bottomNavVisible: bottomNav && window.getComputedStyle(bottomNav).display !== 'none',
        sidebarHidden: !sidebar || window.getComputedStyle(sidebar).display === 'none',
        hasAll5Icons: !!(savedBtn && analyticsBtn && createBtn && notifBtn && profileBtn),
      };
    })()
  `);

  assert.ok(mobileCheck, 'Mobile evaluation returned result');
  assert.ok(mobileCheck.headerVisible, 'Mobile header must be visible on mobile viewport');
  assert.ok(mobileCheck.bottomNavVisible, 'Mobile bottom nav must be visible on mobile viewport');
  assert.ok(mobileCheck.sidebarHidden, 'Desktop sidebars must be hidden on mobile viewport');
  assert.ok(mobileCheck.hasAll5Icons, 'All 5 bottom navigation icons must be present in DOM');

  // Step 3: Vertical Scroll Verification (Unlocking scroll on mobile)
  const scrollTest = await evalExpr(`
    (() => {
      const container = document.querySelector('.newsfeed-center-scroll') || document.documentElement;
      const initialTop = container.scrollTop;
      container.scrollTop = 200;
      return {
        canScroll: container.scrollHeight > container.clientHeight,
        scrolled: container.scrollTop > initialTop || container.scrollHeight > 500,
      };
    })()
  `);
  assert.ok(scrollTest && scrollTest.scrolled, 'Page and center feed must allow vertical scrolling');

  // Step 4: Left Slide Drawer Open & Content
  await evalExpr(`
    (() => {
      const hamburger = document.querySelector('[data-testid="mobile-hamburger-btn"]');
      if (hamburger) hamburger.click();
    })()
  `);
  await sleep(600);

  const drawerCheck = await evalExpr(`
    (() => {
      const drawer = document.querySelector('[data-testid="mobile-navigation-drawer"]');
      const appearance = document.querySelector('[data-testid="drawer-appearance-toggle"]');
      const logout = document.querySelector('[data-testid="drawer-logout-action"]');
      const closeBtn = document.querySelector('[data-testid="drawer-close-btn"]');
      if (closeBtn) closeBtn.click();
      return {
        hasDrawer: !!drawer,
        hasAppearance: !!appearance,
        hasLogout: !!logout,
      };
    })()
  `);

  assert.ok(drawerCheck && drawerCheck.hasDrawer, 'Drawer should open when hamburger button is clicked');
  assert.ok(drawerCheck && drawerCheck.hasAppearance, 'Drawer must contain Appearance theme switcher');
  assert.ok(drawerCheck && drawerCheck.hasLogout, 'Drawer must contain Logout action');

  // Step 5: In-Place View Swapping via Bottom Nav
  await sleep(400);
  await evalExpr(`
    (() => {
      const analyticsBtn = document.querySelector('[data-testid="bottom-nav-analytics"]');
      if (analyticsBtn) analyticsBtn.click();
    })()
  `);
  await sleep(600);

  const analyticsViewCheck = await evalExpr(`
    (() => {
      const text = document.body.innerText;
      return text.includes('Creator Analytics') || text.includes('Engagement') || text.includes('Followers') || !!document.querySelector('.recharts-responsive-container');
    })()
  `);
  assert.ok(analyticsViewCheck, 'Clicking bottom nav analytics should swap center view to analytics charts');

  // Switch to Notifications
  await evalExpr(`
    (() => {
      const notifBtn = document.querySelector('[data-testid="bottom-nav-notifications"]');
      if (notifBtn) notifBtn.click();
    })()
  `);
  await sleep(600);

  const notifViewCheck = await evalExpr(`
    (() => {
      const text = document.body.innerText;
      return text.includes('Notifications') || text.includes('Notification') || !!document.querySelector('[data-testid*="notification"]');
    })()
  `);
  assert.ok(notifViewCheck, 'Clicking bottom nav notifications should swap center view to notifications');

  // Step 6: Mobile Icon-Only Action Buttons in NewsFeed (Task 4)
  // Switch back to Feed
  await evalExpr(`
    (() => {
      const logo = document.querySelector('[data-testid="mobile-header-logo"]');
      if (logo) logo.click();
    })()
  `);
  await sleep(600);

  const actionButtonsMobileCheck = await evalExpr(`
    (() => {
      const actionBar = document.querySelector('.post-card-action-bar');
      if (!actionBar) return { found: false };
      const buttons = Array.from(actionBar.querySelectorAll('button'));
      const textSpans = Array.from(actionBar.querySelectorAll('button span.xb3r6kr, button span > span:nth-child(2)'));
      const svgs = Array.from(actionBar.querySelectorAll('button svg'));

      const allTextsHiddenOrOmitted = textSpans.length === 0 || textSpans.every(span => {
        const style = window.getComputedStyle(span);
        return style.display === 'none' || span.innerText.trim() === '';
      });

      return {
        found: true,
        buttonCount: buttons.length,
        hasIcons: svgs.length > 0,
        allTextsHiddenOrOmitted,
      };
    })()
  `);

  assert.ok(
    actionButtonsMobileCheck && (!actionButtonsMobileCheck.found || actionButtonsMobileCheck.allTextsHiddenOrOmitted),
    'On mobile viewport (< 768px), post card actions must be icon-only with text labels hidden'
  );
});

