// Test Suite: Navigation Cleanliness and Declutter Verification
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 9224;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('TopNav cleanliness: unnecessary text and unnecessary things removed', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,900',
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

  // Wait until nav is rendered
  let navFound = false;
  for (let i = 0; i < 60; i++) {
    const ready = await evaluate('!!document.querySelector("nav[role=\'navigation\']")');
    if (ready) {
      navFound = true;
      break;
    }
    await sleep(250);
  }
  assert.ok(navFound, 'TopNav rendered in DOM');

  await t.test('1. Unnecessary subheading text is removed from navbar', async () => {
    const navText = await evaluate('document.querySelector("nav[role=\'navigation\']")?.innerText || ""');
    assert.ok(
      !navText.includes('Meta Astryx • Section 4.1 System Client'),
      'Navbar must not contain spec subheading "Meta Astryx • Section 4.1 System Client"'
    );
  });

  await t.test('2. Unnecessary 500M DAU badge is removed from navbar', async () => {
    const navText = await evaluate('document.querySelector("nav[role=\'navigation\']")?.innerText || ""');
    assert.ok(
      !navText.includes('500M DAU'),
      'Navbar must not contain unnecessary "500M DAU" badge'
    );
  });

  await t.test('3. Redundant Explore Platform mega menu is removed from navbar', async () => {
    const navText = await evaluate('document.querySelector("nav[role=\'navigation\']")?.innerText || ""');
    assert.ok(
      !navText.includes('Explore Platform'),
      'Navbar must not contain redundant "Explore Platform" menu'
    );
  });

  await t.test('4. Theme toggle button has no unnecessary visible text (icon-only button)', async () => {
    const themeBtn = await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll("nav[role='navigation'] button")).find(b => 
          b.getAttribute("aria-label")?.toLowerCase().includes("mode") ||
          b.innerText.toLowerCase().includes("mode")
        );
        if (!btn) return null;
        return {
          text: btn.innerText.trim(),
          hasIcon: !!btn.querySelector("svg"),
          ariaLabel: btn.getAttribute("aria-label")
        };
      })()
    `);

    assert.ok(themeBtn, 'Theme toggle button exists in navbar');
    assert.ok(themeBtn.hasIcon, 'Theme toggle button has SVG icon');
    assert.strictEqual(
      themeBtn.text,
      '',
      `Theme toggle button must not render visible text, but rendered: "${themeBtn.text}"`
    );
  });

  await t.test('5. Primary navigation and branding remain intact', async () => {
    const navText = await evaluate('document.querySelector("nav[role=\'navigation\']")?.innerText || ""');
    assert.ok(navText.includes('Social Media Content Analysis'), 'Branding title present');
    assert.ok(navText.includes('News Feed'), 'News Feed tab present');
    assert.ok(navText.includes('Analytics Dashboard'), 'Analytics Dashboard tab present');
  });
});
