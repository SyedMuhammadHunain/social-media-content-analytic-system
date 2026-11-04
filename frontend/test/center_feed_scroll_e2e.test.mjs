// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Center Feed Independent Scroll Container E2E (SPEC-center-feed-scroll)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9255;
const TARGET_URL = 'http://127.0.0.1:5173/';
const SCREENSHOT_PATH = path.resolve('../docs/reports/screenshots/center_feed_scroll_verified.png');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Center Feed Independent Scroll Container Suite', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-center-scroll-e2e-${Date.now()}`,
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

  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'usr_alex_01',
        username: 'alex_growth',
        name: 'Alex Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        coverBannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        isFollowed: false,
        headline: 'Staff Infrastructure Architect',
        tags: ['Distributed Systems'],
        bio: 'Building systems.',
        followerCount: 1000,
        followingCount: 100,
      }));
    `,
  });
  await send('Page.reload');

  const evaluate = async expr => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
    });
    return res.result?.value;
  };

  // Wait for React app to mount
  let appReady = false;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('!!document.querySelector("[data-testid=\'newsfeed-center-container\']")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'Newsfeed center container mounted');

  await t.test('1. Center rail is configured with independent scroll container', async () => {
    const styles = await evaluate(`
      (() => {
        const el = document.querySelector('[data-testid="newsfeed-center-container"]');
        if (!el) return null;
        const comp = window.getComputedStyle(el);
        return {
          overflowY: comp.overflowY,
          height: comp.height,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        };
      })()
    `);
    assert.ok(styles, 'Styles computed');
    assert.strictEqual(styles.overflowY, 'auto', 'Center rail has overflow-y: auto');
    assert.ok(styles.scrollHeight > styles.clientHeight, 'Center rail has more content than client height (scrollable)');
  });

  await t.test('2. Scrolling center rail moves inner content up while outer window stays static', async () => {
    // Initial state
    const initialWindowY = await evaluate('window.scrollY');
    assert.strictEqual(initialWindowY, 0, 'Window scroll starts at 0');

    const initialLeftTop = await evaluate(`
      (() => {
        const left = document.querySelector('[data-testid="newsfeed-left-rail"]');
        return left ? Math.round(left.getBoundingClientRect().top) : null;
      })()
    `);
    const initialRightTop = await evaluate(`
      (() => {
        const right = document.querySelector('[data-testid="newsfeed-right-rail"]');
        return right ? Math.round(right.getBoundingClientRect().top) : null;
      })()
    `);
    assert.strictEqual(initialLeftTop, 24, 'Left rail pinned at top: 24px');
    assert.strictEqual(initialRightTop, 24, 'Right rail pinned at top: 24px');

    // Scroll center container
    await evaluate(`
      (() => {
        const el = document.querySelector('[data-testid="newsfeed-center-container"]');
        if (!el) return;
        el.scrollTop = 320;
      })()
    `);
    await sleep(400);

    const scrolledAmount = await evaluate(`
      (() => {
        const el = document.querySelector('[data-testid="newsfeed-center-container"]');
        return el ? el.scrollTop : 0;
      })()
    `);
    assert.ok(scrolledAmount > 0, `Center container successfully scrolled (scrollTop: ${scrolledAmount})`);

    // Verify window.scrollY is STILL 0 (outer page did NOT scroll)
    const afterWindowY = await evaluate('window.scrollY');
    assert.strictEqual(afterWindowY, 0, 'Outer window scroll remains locked at 0 (static page)');

    // Verify sidebars did NOT move
    const afterLeftTop = await evaluate(`
      (() => {
        const left = document.querySelector('[data-testid="newsfeed-left-rail"]');
        return left ? Math.round(left.getBoundingClientRect().top) : null;
      })()
    `);
    const afterRightTop = await evaluate(`
      (() => {
        const right = document.querySelector('[data-testid="newsfeed-right-rail"]');
        return right ? Math.round(right.getBoundingClientRect().top) : null;
      })()
    `);
    assert.strictEqual(afterLeftTop, 24, 'Left rail position remains static at 24px');
    assert.strictEqual(afterRightTop, 24, 'Right rail position remains static at 24px');

    // Capture screenshot of scrolled state with stationary sidebars
    const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshotData?.data) {
      fs.mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
      fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(screenshotData.data, 'base64'));
    }
  });

  await t.test('3. Center rail scrollbar is hidden', async () => {
    const isHidden = await evaluate(`
      (() => {
        const el = document.querySelector('[data-testid="newsfeed-center-container"]');
        if (!el) return false;
        // In Firefox/modern CSS, scrollbar-width should be 'none'
        const comp = window.getComputedStyle(el);
        return comp.scrollbarWidth === 'none' || el.clientWidth === el.offsetWidth;
      })()
    `);
    assert.strictEqual(isHidden, true, 'Center rail has hidden scrollbar');
  });
});
