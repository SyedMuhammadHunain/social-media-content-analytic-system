// Test Suite: News Feed, Post Composer & Profile Refinements
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9227;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('News Feed, Post Composer & Profile Refinements Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-refinements-test-${Date.now()}`,
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
    });
    return res.result?.value;
  };

  // Wait for React app to mount
  let appReady = false;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\']")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'Application mounted in DOM');

  await t.test('1. Left profile card is fixed/sticky and feed container is centered to screen', async () => {
    const layout = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        if (!card) return null;
        const aside = card.closest('aside') || card.parentElement;
        const main = document.querySelector('main main') || document.querySelector('main');
        const asideStyle = window.getComputedStyle(aside);
        const cardStyle = window.getComputedStyle(card);
        const isFixed = asideStyle.position === 'fixed' || cardStyle.position === 'fixed' || asideStyle.position === 'sticky';
        
        const mainRect = main ? main.getBoundingClientRect() : null;
        const viewportCenter = document.documentElement.clientWidth / 2;
        const feedCenter = mainRect ? (mainRect.left + mainRect.width / 2) : 0;
        const isCentered = Math.abs(feedCenter - viewportCenter) <= 5;
        
        return { isFixed, isCentered, feedCenter, viewportCenter };
      })()
    `);
    assert.ok(layout, 'Profile card exists');
    assert.strictEqual(layout.isFixed, true, 'Profile card or container must be position: fixed or sticky');
    assert.strictEqual(layout.isCentered, true, 'Main feed stream must be centered to the screen');
  });

  await t.test('2. Post composer has unified model: no multi-type tabs and media file input present', async () => {
    const composer = await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("button")).map(b => b.innerText.trim());
        const hasTextTab = buttons.some(b => b === 'Text Post');
        const hasImageTab = buttons.some(b => b === 'Image Post');
        const hasVideoTab = buttons.some(b => b === 'Video Post');
        const fileInput = document.querySelector('input[type="file"][accept*="image"]');
        return {
          hasSeparateTabs: hasTextTab && hasImageTab && hasVideoTab,
          hasMediaFileInput: !!fileInput
        };
      })()
    `);
    assert.ok(composer, 'Composer exists');
    assert.strictEqual(composer.hasSeparateTabs, false, 'Separate Text/Image/Video tabs must be removed');
    assert.strictEqual(composer.hasMediaFileInput, true, 'Media file input must be present for PC uploads');
  });

  await t.test('3. Profile page displays avatar overlapping bottom edge of banner with ring border', async () => {
    // Navigate to profile
    await evaluate(`document.querySelector('[data-testid="user-profile-card"]').click()`);
    await sleep(600);

    const avatarPositioning = await evaluate(`
      (() => {
        const view = document.querySelector('[data-testid="user-profile-view"]');
        if (!view) return null;
        const banner = view.querySelector('[data-testid="profile-cover-banner"]');
        const avatarWrapper = view.querySelector('[data-testid="profile-avatar-wrapper"]');
        if (!banner || !avatarWrapper) return null;

        const bannerRect = banner.getBoundingClientRect();
        const avatarRect = avatarWrapper.getBoundingClientRect();
        const style = window.getComputedStyle(avatarWrapper);
        const hasBorder = style.borderWidth !== '0px' || style.border.includes('4px') || style.outlineWidth !== '0px' || style.boxShadow !== 'none';
        
        // Avatar center should be close to banner bottom (within 60px)
        const overlapsBanner = avatarRect.top < bannerRect.bottom && avatarRect.bottom > bannerRect.bottom;
        return { overlapsBanner, hasBorder };
      })()
    `);
    assert.ok(avatarPositioning, 'Avatar and banner exist on profile view');
    assert.strictEqual(avatarPositioning.overlapsBanner, true, 'Avatar must overlap bottom edge of cover banner');
    assert.strictEqual(avatarPositioning.hasBorder, true, 'Avatar must have a protective ring border');
  });

  await t.test('4. Profile view includes photo and banner upload triggers', async () => {
    const triggers = await evaluate(`
      (() => {
        const view = document.querySelector('[data-testid="user-profile-view"]');
        if (!view) return null;
        const avatarUpload = view.querySelector('[data-testid="upload-avatar-trigger"]');
        const bannerUpload = view.querySelector('[data-testid="upload-banner-trigger"]');
        return {
          hasAvatarUpload: !!avatarUpload,
          hasBannerUpload: !!bannerUpload
        };
      })()
    `);
    assert.ok(triggers, 'Upload triggers query succeeded');
    assert.strictEqual(triggers.hasAvatarUpload, true, 'Avatar upload trigger must be present');
    assert.strictEqual(triggers.hasBannerUpload, true, 'Banner upload trigger must be present');
  });
});
