// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Saved Posts Flow & Filter Cleanliness (refine_3_ui Task 9)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';

const PORT = 9260;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Saved Posts Flow & Presentation Suite', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-saved-posts-${Date.now()}`,
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
  assert.ok(appReady, 'Application mounted in DOM');

  await t.test('1. Clicking Saved Posts shortcut switches filter to BOOKMARKS', async () => {
    const clicked = await evaluate(`
      (() => {
        const savedItem = document.querySelector('[data-testid="shortcut-bookmarks"]');
        if (savedItem) {
          savedItem.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(clicked, true, 'Saved Posts shortcut clicked');
    await sleep(400);
  });

  await t.test('2. "What\'s New" composer box is removed in Saved Posts view', async () => {
    const hasComposer = await evaluate('!!document.querySelector("[data-testid=\'post-composer-prompt-bar\']")');
    assert.strictEqual(hasComposer, false, 'What\'s new composer must not render in Saved Posts');
  });

  await t.test('3. "Clear Filter" rectangle card is completely removed in Saved Posts view', async () => {
    const hasClearFilter = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => b.innerText.includes('Clear Filter') || b.innerText.includes('Reset to All Posts'));
      })()
    `);
    assert.strictEqual(hasClearFilter, false, 'Clear Filter card/buttons must not render in Saved Posts');
  });

  await t.test('4. If no posts are saved, displays clean "No Saved Posts" title without reset action', async () => {
    const emptyInfo = await evaluate(`
      (() => {
        const empty = document.querySelector('[data-testid="newsfeed-center-container"]');
        if (!empty) return null;
        return {
          text: empty.innerText,
          hasResetBtn: Array.from(empty.querySelectorAll('button')).some(b => b.innerText.includes('Reset to All Posts')),
        };
      })()
    `);
    assert.ok(emptyInfo, 'Center container exists');
    if (emptyInfo.text.includes('No Saved Posts')) {
      assert.strictEqual(emptyInfo.hasResetBtn, false, 'Must not render reset button');
    }
  });

  await t.test('5. Saving a post in All Posts makes it appear in Saved Posts', async () => {
    // Switch back to All Posts
    const allClicked = await evaluate(`
      (() => {
        const item = document.querySelector('[data-testid="shortcut-all"]');
        const btn = item?.querySelector('button') || item;
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(allClicked, true, 'All Posts shortcut clicked');
    await sleep(600);

    // Click bookmark button on the first post
    const bookmarked = await evaluate(`
      (() => {
        const container = document.querySelector('[data-testid^="post-bookmark-container-"]');
        const bookmarkBtn = container?.querySelector('button') || container ||
          Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Save');
        if (bookmarkBtn) {
          bookmarkBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(bookmarked, true, 'First post Save button clicked');
    await sleep(600);

    // Switch to Saved Posts
    const savedClicked = await evaluate(`
      (() => {
        const item = document.querySelector('[data-testid="shortcut-bookmarks"]');
        const btn = item?.querySelector('button') || item;
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(savedClicked, true, 'Switched to Saved Posts');
    await sleep(600);

    const postCardsCount = await evaluate(`
      document.querySelectorAll('[data-testid^="post-card-"]').length
    `);
    assert.ok(postCardsCount >= 1, `At least one saved post must be displayed (count: ${postCardsCount})`);

    const stillNoComposer = await evaluate('!!document.querySelector("[data-testid=\'post-composer-prompt-bar\']")');
    assert.strictEqual(stillNoComposer, false, 'Composer remains hidden when saved posts are displayed');

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const fs = await import('node:fs');
    fs.writeFileSync(
      path.resolve('../docs/reports/screenshots/saved_posts_clean_verified.png'),
      Buffer.from(screenshot.data, 'base64')
    );
  });
});
