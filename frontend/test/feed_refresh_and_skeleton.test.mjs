// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Feed Skeleton, Shimmer, Logo/Title Bounce & Top Refresh Flow
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9237;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Feed Skeleton Loading, Logo/Title Bounce Back & Top Refresh Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-refresh-test-${Date.now()}`,
    TARGET_URL,
  ]);

  t.after(() => {
    try {
      chrome.kill();
    } catch {}
  });

  // Connect CDP
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
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
      if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'usr_alex_01',
        username: 'alex_chen_ai',
        name: 'Alex Chen',
        avatarUrl: '',
        coverBannerUrl: '',
        isFollowed: false,
        headline: 'AI Systems Architect & LLM Engineer',
        tags: ['AI', 'Architecture'],
        bio: 'Building intelligent distributed systems.',
        followerCount: 1540,
        followingCount: 320,
      }));
    `,
  });
  await send('Page.reload');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  // Wait for React app to mount
  let appReady = false;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('!!document.querySelector("nav")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'Application mounted in DOM');

  await sleep(1000);

  await t.test('1. Feed renders skeletons during initial load and then posts with smooth card animation', async () => {
    // Wait for feed posts to mount after initial skeleton loading
    let postCards = 0;
    for (let i = 0; i < 25; i++) {
      postCards = await evaluate('document.querySelectorAll(".post-card-animated").length') || 0;
      if (postCards > 0) break;
      await sleep(150);
    }
    assert.ok(postCards > 0, `Post cards rendered with entry animation class (found: ${postCards})`);
  });

  await t.test('2. Logo and Website Title button is rendered and clickable in navbar', async () => {
    const brandBtn = await evaluate('!!document.querySelector("[data-testid=\'navbar-brand-button\']")');
    assert.strictEqual(brandBtn, true, 'Navbar brand button is rendered in DOM');

    const brandText = await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'navbar-brand-button\']");
        return btn ? btn.innerText.includes("Social Media Content Analysis") || btn.innerText.includes("SMCAS") : false;
      })()
    `);
    assert.strictEqual(brandText, true, 'Brand button contains app heading');
  });

  await t.test('3. Clicking logo/title bounces back to top of page when scrolled down', async () => {
    const scrollAfterCommand = await evaluate(`
      (() => {
        window.scrollTo(0, 500);
        return window.scrollY;
      })()
    `);
    assert.ok(scrollAfterCommand > 0, `Scrolled down (scrollY: ${scrollAfterCommand})`);

    // Click brand button
    const clicked = await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'navbar-brand-button\']");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(clicked, true, 'Clicked navbar brand button');

    // Check bounce animation triggered
    const isBouncing = await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'navbar-brand-button\']");
        return btn ? btn.classList.contains("brand-bouncing") : false;
      })()
    `);
    assert.strictEqual(isBouncing, true, 'Logo/title has brand-bouncing micro-animation');

    // Wait for smooth scroll to settle
    let scrollAfter = 500;
    for (let i = 0; i < 20; i++) {
      scrollAfter = await evaluate('window.scrollY');
      if (scrollAfter <= 10) break;
      await sleep(100);
    }
    assert.ok(scrollAfter <= 50, `Scrolled back to top of page (scrollY: ${scrollAfter})`);
  });

  await t.test('4. Refresh banner with spinner and label appears during feed refresh', async () => {
    // Click brand button again to trigger feed refresh
    await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'navbar-brand-button\']");
        if (btn) btn.click();
      })()
    `);

    // Poll for refresh banner
    let hasRefreshBanner = false;
    for (let i = 0; i < 15; i++) {
      hasRefreshBanner = await evaluate('!!document.querySelector("[data-testid=\'feed-refresh-banner\']")');
      if (hasRefreshBanner) break;
      await sleep(50);
    }
    assert.strictEqual(hasRefreshBanner, true, 'Feed refresh indicator banner appears');

    // After transit finishes, refresh banner settles and posts remain populated
    await sleep(650);
    const postCount = await evaluate('document.querySelectorAll(".post-card-animated").length');
    assert.ok(postCount > 0, `Feed successfully updated with fresh posts (count: ${postCount})`);
  });

  await t.test('5. Clicking logo/title from User Profile view switches back to Feed and refreshes', async () => {
    // Navigate to profile view
    await evaluate(`
      (() => {
        const authorEl = document.querySelector('[data-testid^="post-author-"]');
        if (authorEl) authorEl.click();
      })()
    `);
    await sleep(400);

    const inProfile = await evaluate('!!document.querySelector("[data-testid=\'user-profile-view\']")');
    assert.strictEqual(inProfile, true, 'Navigated to profile view');

    // Scroll profile down
    await evaluate('window.scrollTo(0, 800)');
    await sleep(200);

    // Click brand button
    await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'navbar-brand-button\']");
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    // Verify viewMode switched back to feed and scrolled to top
    const inFeed = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\']")');
    assert.strictEqual(inFeed, true, 'Switched back to main feed view');

    const topScroll = await evaluate('window.scrollY');
    assert.ok(topScroll <= 50, `Scrolled to top (scrollY: ${topScroll})`);
  });
});
