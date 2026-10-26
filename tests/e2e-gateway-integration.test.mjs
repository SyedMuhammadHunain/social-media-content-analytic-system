// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Exhaustive End-to-End Browser & Gateway Protocol Verification (Task 25)

import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9240;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Exhaustive E2E Gateway & Atlas Cloud Integration Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1050',
    `--user-data-dir=/tmp/chrome-e2e-test-${Date.now()}`,
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
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const evaluate = async expr => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  };

  const captureScreenshot = async filename => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  };

  // Step 1: Pre-populate authenticated session for user_hunain
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'user_hunain',
        username: 'hunain',
        name: 'Syed Muhammad Hunain',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        headline: 'Staff Infrastructure Architect • Distributed Media Systems',
        tags: ['Systems Architecture', 'Distributed Systems', 'Meta Astryx', '500M DAU'],
        bio: 'Building large-scale content processing pipelines and real-time social telemetry.',
        followerCount: 14200,
        followingCount: 486,
      }));
    `,
  });

  await send('Page.navigate', { url: TARGET_URL });

  // Step 2: Verify live News Feed renders Atlas posts
  let renderedPostsCount = 0;
  for (let i = 0; i < 25; i++) {
    await sleep(300);
    renderedPostsCount = await evaluate(`document.querySelectorAll('[data-testid^="post-card-"]').length`);
    if (renderedPostsCount > 0) break;
  }

  console.log(`Live Atlas posts rendered in newsfeed: ${renderedPostsCount}`);
  assert.ok(renderedPostsCount > 0, 'Feed rendered posts from Atlas');
  await captureScreenshot('e2e_live_newsfeed_atlas.png');

  // Step 3: Test Live Like interaction
  const likeBtnFound = await evaluate(`Boolean(document.querySelector('[data-testid="post-like-btn"]'))`);
  assert.ok(likeBtnFound, 'Post like button is present');
  await evaluate(`document.querySelector('[data-testid="post-like-btn"]').click()`);
  await sleep(600);

  // Step 4: Test Post Composer & Publish
  const composerTextareaFound = await evaluate(`Boolean(document.querySelector('textarea, [data-testid="composer-input"]'))`);
  if (composerTextareaFound) {
    await evaluate(`
      const ta = document.querySelector('textarea');
      if (ta) {
        ta.value = 'E2E automated verification post published to MongoDB Atlas cluster! #cloud #astryx';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `);
    await sleep(400);

    const publishBtn = await evaluate(`Boolean(document.querySelector('button[data-testid="composer-submit-btn"], button:has-text("Publish"), button'))`);
    if (publishBtn) {
      await evaluate(`
        const btns = Array.from(document.querySelectorAll('button'));
        const pub = btns.find(b => b.innerText.includes('Publish'));
        if (pub) pub.click();
      `);
      await sleep(1000);
    }
  }

  // Step 5: Test Navigation to Creator Analytics Dashboard
  const navAnalyticsBtn = await evaluate(`Boolean(document.querySelector('[data-testid="nav-analytics-dashboard"]'))`);
  assert.ok(navAnalyticsBtn, 'Analytics nav item found');
  await evaluate(`document.querySelector('[data-testid="nav-analytics-dashboard"]').click()`);
  await sleep(1200);

  const dashboardHeading = await evaluate(`document.body.innerText.includes('Creator Analytics Dashboard')`);
  assert.ok(dashboardHeading, 'Creator Analytics Dashboard is rendered');

  const followerMetric = await evaluate(`Boolean(document.querySelector('[data-testid="metric-total-followers"]'))`);
  assert.ok(followerMetric, 'Follower metric card rendered');

  const refreshBtnFound = await evaluate(`Boolean(document.querySelector('[data-testid="refresh-metrics-btn"]'))`);
  assert.ok(refreshBtnFound, 'Refresh telemetry button present');
  await evaluate(`document.querySelector('[data-testid="refresh-metrics-btn"]').click()`);
  await sleep(800);

  await captureScreenshot('e2e_creator_dashboard_telemetry.png');

  // Step 6: Return to News Feed & verify User Switcher
  await evaluate(`document.querySelector('[data-testid="nav-news-feed"]').click()`);
  await sleep(1000);

  const switcherPresent = await evaluate(`Boolean(document.querySelector('[data-testid="nav-user-switcher"]'))`);
  assert.ok(switcherPresent, 'TopNav User switcher dropdown is present');

  await captureScreenshot('e2e_user_switcher_active.png');
  ws.close();
});
