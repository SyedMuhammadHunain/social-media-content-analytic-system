// Test Suite: User Profile Card & Full Profile View Verification
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9225;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('User Profile Card & Full Profile View Flow', async (t) => {
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
        bio: 'Building large-scale content processing pipelines and real-time social telemetry. Passionate about sub-second fan-out, cache hierarchies, and accessible design system engineering.',
        followerCount: 14200,
        followingCount: 486,
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

  await t.test('1. Left profile card is rendered in the feed layout', async () => {
    const cardFound = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        return !!card;
      })()
    `);
    assert.strictEqual(cardFound, true, 'Left user profile card must be present in feed layout');
  });

  await t.test('2. Profile card displays avatar, name, headline, tags, and stats', async () => {
    const cardData = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        if (!card) return null;
        return {
          text: card.innerText,
          hasAvatar: !!card.querySelector('img, [role="img"]'),
          hasBadges: card.querySelectorAll('[data-astryx-theme*="badge"], span').length > 0
        };
      })()
    `);
    assert.ok(cardData, 'Profile card exists');
    assert.ok(cardData.text.includes('Syed Muhammad Hunain'), 'Card displays user name');
    assert.ok(cardData.text.includes('hunain_creator'), 'Card displays handle');
    assert.ok(cardData.text.includes('Staff Infrastructure Architect'), 'Card displays headline');
    assert.ok(cardData.text.includes('Systems Architecture'), 'Card displays tags');
    assert.ok(cardData.hasAvatar, 'Card displays user avatar');
  });

  await t.test('3. Clicking profile card navigates to full profile view', async () => {
    const clicked = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        if (card) {
          card.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(clicked, true, 'Profile card clicked');
    await sleep(600);

    const profileViewPresent = await evaluate('!!document.querySelector("[data-testid=\'user-profile-view\']")');
    assert.strictEqual(profileViewPresent, true, 'Full profile view must be rendered');

    const hasBanner = await evaluate('!!document.querySelector("[data-testid=\'profile-cover-banner\']")');
    assert.strictEqual(hasBanner, true, 'Profile cover banner must be rendered');
  });

  await t.test('4. Bio editor toggles to edit mode and saves with Banner feedback', async () => {
    // Click "Edit Bio"
    const editClicked = await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Edit Bio"));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(editClicked, true, 'Clicked Edit Bio button');
    await sleep(400);

    // Verify TextArea is present
    const hasTextArea = await evaluate('!!document.querySelector("textarea")');
    assert.strictEqual(hasTextArea, true, 'TextArea displayed in edit mode');

    // Click "Save Changes"
    const saveClicked = await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Save Changes"));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(saveClicked, true, 'Clicked Save Changes button');
    await sleep(400);

    // Verify Astryx Banner confirmation
    const bannerFound = await evaluate(`
      document.body.innerText.includes("Bio updated successfully") ||
      !!document.querySelector('[data-astryx-theme*="banner"], [role="status"]')
    `);
    assert.strictEqual(bannerFound, true, 'Astryx confirmation Banner displayed');
  });

  await t.test('5. Post history displays authored posts', async () => {
    const hasAuthoredPost = await evaluate(`
      document.body.innerText.includes("Excited to unveil the new Meta Astryx system client")
    `);
    assert.strictEqual(hasAuthoredPost, true, 'Past post history displays authored post');
  });

  await t.test('6. Clicking Back to Feed returns to news feed stream', async () => {
    const backClicked = await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Back to Feed"));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.strictEqual(backClicked, true, 'Clicked Back to Feed button');
    await sleep(600);

    const feedRestored = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\']")');
    assert.strictEqual(feedRestored, true, 'News feed stream restored with profile card');
  });
});
