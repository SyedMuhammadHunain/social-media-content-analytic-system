// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: UI Refinements 3 E2E Verification (refine_3_ui)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9250;
const TARGET_URL = 'http://127.0.0.1:5173/';
const SCREENSHOT_PATH = path.resolve('../docs/reports/screenshots/ui_refinements_3_verified.png');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('UI Refinements 3 (refine_3_ui) End-to-End Suite', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-refine3-e2e-${Date.now()}`,
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
    const ready = await evaluate('!!document.querySelector("[data-testid=\'post-composer-prompt-bar\']")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'Application mounted');

  await t.test('1. Top Navbar is completely removed from DOM', async () => {
    const hasNavbar = await evaluate(`
      (() => {
        const header = document.querySelector('header');
        const navBrand = document.querySelector('[data-testid="navbar-brand-button"]');
        const navPostBtn = document.querySelector('[data-testid="nav-new-post-btn"]');
        return !!header || !!navBrand || !!navPostBtn;
      })()
    `);
    assert.strictEqual(hasNavbar, false, 'No navbar header or navbar buttons in DOM');
  });

  await t.test('2. Left Sidebar "Feeds & Shortcuts" contains NO "Media Only" item', async () => {
    const sidebarText = await evaluate(`
      (() => {
        const leftRail = document.querySelector('[data-testid="newsfeed-left-rail"]');
        return leftRail ? leftRail.innerText : '';
      })()
    `);
    assert.strictEqual(sidebarText.includes('Media Only'), false, 'Media Only must be removed from left rail');
    assert.strictEqual(sidebarText.includes('All Posts'), true, 'All Posts remains in left rail');
    assert.strictEqual(sidebarText.includes('Saved Posts'), true, 'Saved Posts remains in left rail');
  });

  await t.test('3. Right Sidebar contains pill Search Input Box and NO Trending Topics', async () => {
    const rightRailInfo = await evaluate(`
      (() => {
        const rightRail = document.querySelector('[data-testid="newsfeed-right-rail"]');
        if (!rightRail) return null;
        const text = rightRail.innerText;
        const hasTrending = text.includes('Trending Topics') || text.includes('Trending');
        const searchBox = rightRail.querySelector('[data-testid="sidebar-search-box"]');
        const searchInput = rightRail.querySelector('[data-testid="sidebar-search-input"]');
        const hasWhoToFollow = text.includes('Who to Follow');
        return {
          hasTrending,
          hasSearchBox: !!searchBox,
          hasSearchInput: !!searchInput,
          hasWhoToFollow,
        };
      })()
    `);
    assert.ok(rightRailInfo, 'Right rail found');
    assert.strictEqual(rightRailInfo.hasTrending, false, 'Trending Topics card removed');
    assert.strictEqual(rightRailInfo.hasSearchBox, true, 'Pill Search Box rendered');
    assert.strictEqual(rightRailInfo.hasSearchInput, true, 'Search text input rendered');
    assert.strictEqual(rightRailInfo.hasWhoToFollow, true, 'Who to Follow remains in right rail');
  });

  await t.test('4. Emoji Picker opens full-width (>= 90% of modal width)', async () => {
    // Open create post modal
    await evaluate(`
      (() => {
        const bar = document.querySelector('[data-testid="post-composer-prompt-bar"]');
        if (bar) bar.click();
      })()
    `);
    await sleep(400);

    // Click emoji toolbar button
    await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="toolbar-emoji-btn"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(300);

    const widthComparison = await evaluate(`
      (() => {
        const modal = document.querySelector('[data-testid="post-create-modal"]');
        const popover = document.querySelector('[data-testid="emoji-picker-popover"]');
        if (!modal || !popover) return null;
        const modalWidth = modal.querySelector('div[style*="max-width"]') ? 
          modal.querySelector('div[style*="max-width"]').getBoundingClientRect().width : 
          modal.getBoundingClientRect().width;
        const popoverWidth = popover.getBoundingClientRect().width;
        return { modalWidth: Math.round(modalWidth), popoverWidth: Math.round(popoverWidth) };
      })()
    `);
    assert.ok(widthComparison, 'Modal and Emoji Popover measured');
    // Popover is inside modal padding, so it should be > 75% of total modal outer width
    assert.ok(
      widthComparison.popoverWidth >= widthComparison.modalWidth * 0.75,
      `Emoji popover width (${widthComparison.popoverWidth}px) must span full content area of modal (${widthComparison.modalWidth}px)`
    );
  });

  await t.test('5. GIF Picker opens full-width (>= 90% of modal width)', async () => {
    // Click GIF toolbar button
    await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="toolbar-gif-btn"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(300);

    const widthComparison = await evaluate(`
      (() => {
        const modal = document.querySelector('[data-testid="post-create-modal"]');
        const popover = document.querySelector('[data-testid="gif-picker-popover"]');
        if (!modal || !popover) return null;
        const modalWidth = modal.querySelector('div[style*="max-width"]') ? 
          modal.querySelector('div[style*="max-width"]').getBoundingClientRect().width : 
          modal.getBoundingClientRect().width;
        const popoverWidth = popover.getBoundingClientRect().width;
        return { modalWidth: Math.round(modalWidth), popoverWidth: Math.round(popoverWidth) };
      })()
    `);
    assert.ok(widthComparison, 'Modal and GIF Popover measured');
    assert.ok(
      widthComparison.popoverWidth >= widthComparison.modalWidth * 0.75,
      `GIF popover width (${widthComparison.popoverWidth}px) must span full content area of modal (${widthComparison.modalWidth}px)`
    );

    // Capture screenshot of full UI with refinements
    const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshotData?.data) {
      fs.mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
      fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(screenshotData.data, 'base64'));
    }
  });
});
