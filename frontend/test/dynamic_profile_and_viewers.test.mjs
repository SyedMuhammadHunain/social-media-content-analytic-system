// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Dynamic Profile Activity, Viewers Modal & Multi-User Profile Viewing
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9235;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Dynamic Profile Activity, Viewers & Multi-User Viewing Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-profile-test-${Date.now()}`,
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

  // Initialize as a newly registered user without pre-set banner or avatar image
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'usr_new_afzal',
        username: 'afzal_user_7461',
        name: 'Afzal Khan (Verified Lead)',
        avatarUrl: '',
        coverBannerUrl: '',
        isFollowed: false,
        headline: 'Social Media Creator',
        tags: ['Creator', 'Meta Astryx'],
        bio: 'Excited to join the Social Media Content Analysis System platform!',
        followerCount: 0,
        followingCount: 0,
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
    const ready = await evaluate('!!document.querySelector("nav")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'Application mounted in DOM');

  await t.test('1. New user has no default Unsplash beach banner or avatar photo', async () => {
    const cardInfo = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        if (!card) return null;
        const bannerImg = card.querySelector('img[aria-hidden="true"]');
        const avatarImg = card.querySelector('.astryx-avatar img, img[alt="Afzal Khan (Verified Lead)"]');
        return {
          hasBannerImg: !!bannerImg,
          bannerSrc: bannerImg?.src || '',
          hasAvatarImg: !!avatarImg,
        };
      })()
    `);

    assert.ok(cardInfo, 'Profile card exists');
    assert.strictEqual(cardInfo.hasBannerImg, false, 'Should not render default Unsplash beach image');
    assert.strictEqual(cardInfo.hasAvatarImg, false, 'Should not render default Unsplash avatar image');
  });

  await t.test('2. Dynamic connections and profile views trigger is interactive', async () => {
    const triggerPresent = await evaluate('!!document.querySelector("[data-testid=\'profile-views-trigger\']")');
    assert.strictEqual(triggerPresent, true, 'Profile views interactive trigger is rendered');

    // Click profile views trigger
    await evaluate(`
      (() => {
        const trigger = document.querySelector('[data-testid="profile-views-trigger"]');
        if (trigger) trigger.click();
      })()
    `);
    await sleep(400);

    const modalOpen = await evaluate('!!document.querySelector("[data-testid=\'profile-viewers-modal\']")');
    assert.strictEqual(modalOpen, true, 'Profile viewers modal opened upon clicking trigger');

    // Close modal
    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('[data-testid="profile-viewers-modal"] button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(300);

    const modalClosed = await evaluate('!document.querySelector("[data-testid=\'profile-viewers-modal\']")');
    assert.strictEqual(modalClosed, true, 'Profile viewers modal dismissed');
  });

  await t.test('3. Following a suggested creator updates connections count dynamically', async () => {
    const initialConnections = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        const text = card?.innerText || '';
        const match = text.match(/Connections\\s*(\\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })()
    `);

    // Click Follow on suggested creator with "Follow" label
    await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[data-testid^="follow-suggested-"] button'))
          .find(b => b.innerText.trim() === 'Follow');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const updatedConnections = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        const text = card?.innerText || '';
        const match = text.match(/Connections\\s*(\\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })()
    `);

    assert.strictEqual(updatedConnections, initialConnections + 1, 'Connections count increased dynamically by 1');
  });

  await t.test('4. Clicking a post author navigates to that user full profile with visitor view', async () => {
    // Wait for feed posts to mount
    for (let i = 0; i < 20; i++) {
      const ready = await evaluate('!!document.querySelector(\'[data-testid^="post-author-"]\')');
      if (ready) break;
      await sleep(150);
    }

    const authorClicked = await evaluate(`
      (() => {
        const authorEl = document.querySelector('[data-testid^="post-author-"]');
        if (authorEl) {
          authorEl.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(authorClicked, true, 'Post author clicked');
    await sleep(600);

    const profileViewPresent = await evaluate('!!document.querySelector("[data-testid=\'user-profile-view\']")');
    assert.strictEqual(profileViewPresent, true, 'Navigated to user full profile view');

    // Visitor should see follow button on header, not upload/change photo triggers
    const hasFollowBtn = await evaluate('!!document.querySelector("[data-testid=\'profile-header-follow-btn\']")');
    assert.strictEqual(hasFollowBtn, true, 'Follow button rendered on viewed user profile header');

    const hasUploadBannerTrigger = await evaluate('!!document.querySelector("[data-testid=\'upload-banner-trigger\']")');
    assert.strictEqual(hasUploadBannerTrigger, false, 'Change banner button hidden for visitor');

    const hasUploadAvatarTrigger = await evaluate('!!document.querySelector("[data-testid=\'upload-avatar-trigger\']")');
    assert.strictEqual(hasUploadAvatarTrigger, false, 'Change avatar button hidden for visitor');

    const hasEditBioBtn = await evaluate(`
      Array.from(document.querySelectorAll("button")).some(b => b.innerText.includes("Edit Bio"))
    `);
    assert.strictEqual(hasEditBioBtn, false, 'Edit Bio button hidden for visitor');
  });

  await t.test('5. Clicking Back to Feed returns to main feed', async () => {
    await evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Back to Feed"));
        if (backBtn) backBtn.click();
      })()
    `);
    await sleep(600);

    const feedRestored = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\']")');
    assert.strictEqual(feedRestored, true, 'Feed view restored');
  });
});
