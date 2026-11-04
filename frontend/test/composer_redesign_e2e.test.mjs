// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Threads-Style Post Composer & New Post Modal E2E Verification
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9245;
const TARGET_URL = 'http://127.0.0.1:5173/';
const SCREENSHOT_PATH = path.resolve('../docs/reports/screenshots/composer_threads_redesign.png');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Threads-Style Post Composer Redesign End-to-End Suite', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-composer-e2e-${Date.now()}`,
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
  assert.ok(appReady, 'Composer prompt bar mounted in DOM');

  await t.test('1. Threads prompt bar displays avatar, "What\'s new?" placeholder and "Post" button', async () => {
    const barInfo = await evaluate(`
      (() => {
        const bar = document.querySelector('[data-testid="post-composer-prompt-bar"]');
        if (!bar) return null;
        const text = bar.innerText;
        const hasPlaceholder = text.includes("What's new?");
        const postBtn = bar.querySelector('[data-testid="composer-prompt-post-btn"]');
        const hasPostBtn = !!postBtn && postBtn.innerText.includes("Post");
        const avatar = bar.querySelector('img, [role="img"]');
        return { hasPlaceholder, hasPostBtn, hasAvatar: !!avatar };
      })()
    `);
    assert.ok(barInfo, 'Prompt bar found');
    assert.strictEqual(barInfo.hasPlaceholder, true, 'Contains "What\'s new?" placeholder text');
    assert.strictEqual(barInfo.hasPostBtn, true, 'Contains "Post" button');
    assert.strictEqual(barInfo.hasAvatar, true, 'Contains user avatar');
  });

  await t.test('2. Zero vertical gap between composer bar and first feed card', async () => {
    // Wait for feed posts to finish loading and fade-in animation to complete
    for (let i = 0; i < 30; i++) {
      const cardMounted = await evaluate('!!document.querySelector(\'[data-testid^="post-card-"]\')');
      if (cardMounted) break;
      await sleep(200);
    }
    // Wait for 350ms postCardFadeIn animation to settle at translateY(0)
    await sleep(500);

    const gapInfo = await evaluate(`
      (() => {
        const bar = document.querySelector('[data-testid="post-composer-prompt-bar"]');
        const firstCard = document.querySelector('[data-testid^="post-card-"]');
        if (!bar || !firstCard) return null;
        const barRect = bar.getBoundingClientRect();
        const cardRect = firstCard.getBoundingClientRect();
        const gap = cardRect.top - barRect.bottom;
        return { gap: Math.round(gap) };
      })()
    `);
    assert.ok(gapInfo, 'Gap measured between composer and first post');
    assert.ok(Math.abs(gapInfo.gap) <= 2, `Gap must be <= 2px (measured: ${gapInfo.gap}px)`);
  });

  await t.test('3. Clicking prompt bar opens "New Post" modal matching Screenshot 2 specs', async () => {
    const clicked = await evaluate(`
      (() => {
        const bar = document.querySelector('[data-testid="post-composer-prompt-bar"]');
        if (bar) {
          bar.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(clicked, true, 'Clicked prompt bar');
    await sleep(400);

    const modalInfo = await evaluate(`
      (() => {
        const modal = document.querySelector('[data-testid="post-create-modal"]');
        if (!modal) return null;
        const cancelBtn = modal.querySelector('[data-testid="modal-cancel-btn"]');
        const titleEl = modal.querySelector('h1, h2, h3, h4, [role="heading"]');
        const titleText = titleEl ? titleEl.innerText.trim() : '';
        const toolbar = modal.querySelector('[data-testid="post-media-toolbar"]');
        const postBtn = modal.querySelector('[data-testid="modal-post-submit-btn"]');
        const textarea = modal.querySelector('[data-testid="modal-post-textarea"]');
        return {
          isOpen: true,
          hasCancel: !!cancelBtn && cancelBtn.innerText.includes('Cancel'),
          titleText,
          hasToolbar: !!toolbar,
          hasPostBtn: !!postBtn && postBtn.innerText.includes('Post'),
          hasTextarea: !!textarea,
        };
      })()
    `);
    assert.ok(modalInfo, 'Modal dialog is open');
    assert.strictEqual(modalInfo.hasCancel, true, 'Header has Cancel button on left');
    assert.strictEqual(modalInfo.titleText, 'New Post', 'Header title is strictly "New Post" (NOT "New thread")');
    assert.strictEqual(modalInfo.hasToolbar, true, 'Contains media toolbar');
    assert.strictEqual(modalInfo.hasPostBtn, true, 'Footer has Post button on right');
    assert.strictEqual(modalInfo.hasTextarea, true, 'Contains "What\'s new?" textarea');
  });

  await t.test('4. Emoji reaction picker inserts emoji into post content', async () => {
    // Click emoji toolbar button
    const openedPicker = await evaluate(`
      (() => {
        const emojiBtn = document.querySelector('[data-testid="toolbar-emoji-btn"]');
        if (emojiBtn) {
          emojiBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(openedPicker, true, 'Clicked Emoji button');
    await sleep(300);

    // Pick first emoji in popover
    const picked = await evaluate(`
      (() => {
        const picker = document.querySelector('[data-testid="emoji-picker-popover"]');
        if (!picker) return false;
        const firstBtn = picker.querySelector('button');
        if (firstBtn) {
          firstBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(picked, true, 'Selected emoji from popover');
    await sleep(200);

    const textareaValue = await evaluate(`
      (() => {
        const textarea = document.querySelector('[data-testid="modal-post-textarea"]');
        return textarea ? textarea.value : '';
      })()
    `);
    assert.ok(textareaValue.length > 0, 'Textarea received emoji');
  });

  await t.test('5. Publishing creates post, closes modal, and renders in feed', async () => {
    const uniqueTag = `ThreadE2E_${Date.now()}`;
    const testPostContent = ` Threads redesign verified! #${uniqueTag}`;

    // Append text to the existing emoji
    await evaluate(`
      (() => {
        const textarea = document.querySelector('[data-testid="modal-post-textarea"]');
        if (!textarea) return;
        const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        proto.set.call(textarea, textarea.value + ${JSON.stringify(testPostContent)});
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(300);

    // Click submit
    const submitted = await evaluate(`
      (() => {
        const postBtn = document.querySelector('[data-testid="modal-post-submit-btn"]');
        if (postBtn && !postBtn.disabled) {
          postBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(submitted, true, 'Clicked Post button');
    await sleep(600);

    // Verify modal closed
    const modalClosed = await evaluate('!document.querySelector("[data-testid=\'post-create-modal\']")');
    assert.strictEqual(modalClosed, true, 'Modal closed after publishing');

    // Verify post in feed
    const postInFeed = await evaluate(`
      (() => {
        const posts = Array.from(document.querySelectorAll('[data-testid^="post-card-"]'));
        return posts.some(p => p.innerText.includes(${JSON.stringify(uniqueTag)}));
      })()
    `);
    assert.strictEqual(postInFeed, true, 'Newly created post is visible at top of news feed');

    // Take screenshot of feed with new post
    const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshotData?.data) {
      fs.mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
      fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(screenshotData.data, 'base64'));
    }
  });
});
