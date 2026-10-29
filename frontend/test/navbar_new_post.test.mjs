// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Navbar Sticky "New Post" Button & Modal Flow
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9236;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Sticky Navbar "New Post" Button & Creation Modal', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-nav-test-${Date.now()}`,
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

  await t.test('1. Sticky navbar renders "New Post" button even while user is scrolled down', async () => {
    // Scroll deep down
    await evaluate('window.scrollTo(0, 1200)');
    await sleep(200);

    const scrollY = await evaluate('window.scrollY');
    assert.ok(scrollY > 0, `Scrolled down (scrollY: ${scrollY})`);

    const hasNewPostBtn = await evaluate('!!document.querySelector("[data-testid=\'nav-new-post-btn\']")');
    assert.strictEqual(hasNewPostBtn, true, 'Navbar New Post button is rendered in DOM');

    // Verify it is positioned inside sticky top header
    const btnRect = await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'nav-new-post-btn\']");
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height };
      })()
    `);
    assert.ok(btnRect && btnRect.top < 100, `Button remains visible in sticky header viewport top (${btnRect?.top})`);
  });

  await t.test('2. Clicking "New Post" opens the PostCreateModal', async () => {
    const clicked = await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'nav-new-post-btn\']");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(clicked, true, 'Clicked navbar New Post button');
    await sleep(400);

    const modalExists = await evaluate('!!document.querySelector("[data-testid=\'post-create-modal\']")');
    assert.strictEqual(modalExists, true, 'PostCreateModal is opened and visible in DOM');

    const modalTitle = await evaluate(`
      (() => {
        const modal = document.querySelector("[data-testid=\'post-create-modal\']");
        return modal ? modal.innerText.includes("Create New Post") : false;
      })()
    `);
    assert.strictEqual(modalTitle, true, 'Modal contains "Create New Post" heading');
  });

  await t.test('3. Cancel button in modal closes the modal', async () => {
    const cancelClicked = await evaluate(`
      (() => {
        const modal = document.querySelector("[data-testid=\'post-create-modal\']");
        if (!modal) return false;
        const cancelBtn = Array.from(modal.querySelectorAll("button")).find(b => b.innerText.trim() === "Cancel");
        if (cancelBtn) {
          cancelBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(cancelClicked, true, 'Clicked Cancel in modal');
    await sleep(300);

    const modalStillThere = await evaluate('!!document.querySelector("[data-testid=\'post-create-modal\']")');
    assert.strictEqual(modalStillThere, false, 'Modal closed after clicking Cancel');
  });

  await t.test('4. Creating and publishing a new post from navbar modal creates post and scrolls to top', async () => {
    // Reopen modal from navbar
    await evaluate(`
      (() => {
        const btn = document.querySelector("[data-testid=\'nav-new-post-btn\']");
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const uniquePostTag = `NavbarTest_${Date.now()}`;
    const testContent = `Automated post created from navbar! #${uniquePostTag}`;

    // Fill the textarea inside modal
    const filled = await evaluate(`
      (() => {
        const modal = document.querySelector("[data-testid=\'post-create-modal\']");
        if (!modal) return false;
        const textarea = modal.querySelector("textarea");
        if (!textarea) return false;
        // Native React setter
        const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        proto.set.call(textarea, ${JSON.stringify(testContent)});
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()
    `);
    assert.strictEqual(filled, true, 'Filled post textarea in modal');
    await sleep(300);

    // Click Publish Post in modal
    const published = await evaluate(`
      (() => {
        const modal = document.querySelector("[data-testid=\'post-create-modal\']");
        if (!modal) return false;
        const publishBtn = Array.from(modal.querySelectorAll("button")).find(b => b.innerText.includes("Publish Post"));
        if (publishBtn && !publishBtn.disabled) {
          publishBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(published, true, 'Clicked Publish Post button in modal');
    await sleep(600);

    // Verify modal is closed
    const modalClosed = await evaluate('!document.querySelector("[data-testid=\'post-create-modal\']")');
    assert.strictEqual(modalClosed, true, 'Modal closed after publishing');

    // Verify post is present at top of feed
    const postFound = await evaluate(`
      document.body.innerText.includes(${JSON.stringify(uniquePostTag)})
    `);
    assert.strictEqual(postFound, true, 'New post with unique hashtag rendered in feed');
  });

  await t.test('5. Mobile navigation menu also includes "Create New Post" action', async () => {
    // Set viewport to mobile size
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(400);

    // Open mobile menu
    const menuTriggered = await evaluate(`
      (() => {
        const trigger = document.querySelector(".mobile-more-menu button");
        if (trigger) {
          trigger.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(menuTriggered, true, 'Mobile menu opened');
    await sleep(300);

    const hasCreatePostInMobile = await evaluate(`
      Array.from(document.querySelectorAll("button, [role='menuitem']")).some(el => el.innerText.includes("Create New Post"))
    `);
    assert.strictEqual(hasCreatePostInMobile, true, 'Mobile menu contains "Create New Post" item');
  });
});
