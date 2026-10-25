// Test Suite: User Authentication Flow (Login Split Card)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9226;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('User Authentication Flow (Login Split Card)', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-auth-test-${Date.now()}`,
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

  // Wait for app to mount
  let appReady = false;
  for (let i = 0; i < 60; i++) {
    const ready = await evaluate('!!(document.querySelector("[data-testid=\'auth-split-card\']") || document.querySelector("nav"))');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(250);
  }
  assert.ok(appReady, 'Application mounted in DOM');

  await t.test('1. Unauthenticated visitor is presented with Astryx Login Split Card', async () => {
    const authCard = await evaluate(`
      (() => {
        const splitCard = document.querySelector('[data-testid="auth-split-card"]');
        if (!splitCard) return null;
        const brandPane = splitCard.querySelector('[data-testid="auth-brand-pane"]');
        const formPane = splitCard.querySelector('[data-testid="auth-form-pane"]');
        return {
          hasSplitCard: !!splitCard,
          hasBrandPane: !!brandPane,
          hasFormPane: !!formPane,
        };
      })()
    `);
    assert.ok(authCard, 'Auth split card must be present when unauthenticated');
    assert.strictEqual(authCard.hasBrandPane, true, 'Brand pane must be present');
    assert.strictEqual(authCard.hasFormPane, true, 'Form pane must be present');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/auth_login_split_card.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('2. Can toggle between Sign In and Create Account modes', async () => {
    const toggleResult = await evaluate(`
      (() => {
        const toggleLink = document.querySelector('[data-testid="auth-toggle-mode"]');
        if (!toggleLink) return null;
        const initialText = toggleLink.innerText;
        toggleLink.click();
        const usernameInput = document.querySelector('input[name="username"], input[placeholder*="username" i]');
        return {
          hasToggle: true,
          initialText,
          hasUsernameInput: !!usernameInput
        };
      })()
    `);
    assert.ok(toggleResult, 'Auth toggle button/link must exist');
    assert.strictEqual(toggleResult.hasUsernameInput, true, 'Register form must reveal username input');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/auth_register_mode.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('3. Submitting invalid credentials displays an Astryx error banner', async () => {
    // Switch back to login
    await evaluate(`
      (() => {
        const toggle = document.querySelector('[data-testid="auth-toggle-mode"]');
        if (toggle && toggle.innerText.includes('Sign In')) toggle.click();
      })()
    `);
    await sleep(200);

    const errorResult = await evaluate(`
      (() => {
        const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordInput = document.querySelector('input[type="password"]');
        const submitBtn = document.querySelector('[data-testid="auth-submit-btn"]');
        if (!emailInput || !passwordInput || !submitBtn) return null;

        // Set bad credentials
        emailInput.value = 'invalid_user@example.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        passwordInput.value = 'wrongpassword';
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

        submitBtn.click();
        return true;
      })()
    `);
    assert.ok(errorResult, 'Credential inputs and submit button found');
    await sleep(400);

    const bannerFound = await evaluate('!!document.querySelector("[data-testid=\'auth-error-banner\'], [data-astryx-theme*=\'banner\']")');
    assert.strictEqual(bannerFound, true, 'Error banner must display upon invalid credentials');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/auth_error_validation.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('4. Submitting valid credentials transitions to News Feed', async () => {
    await evaluate(`
      (() => {
        const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordInput = document.querySelector('input[type="password"]');
        const submitBtn = document.querySelector('[data-testid="auth-submit-btn"]');
        if (!emailInput || !passwordInput || !submitBtn) return;

        emailInput.value = 'hunain_creator';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        passwordInput.value = 'password123';
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

        submitBtn.click();
      })()
    `);
    await sleep(600);

    const feedMounted = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\'], nav")');
    assert.strictEqual(feedMounted, true, 'News Feed must mount upon valid login');
  });

  await t.test('5. Clicking Log Out in TopNav clears session and returns to Login Split Card', async () => {
    const logoutClicked = await evaluate(`
      (() => {
        const logoutBtn = document.querySelector('[data-testid="nav-logout-btn"]');
        if (logoutBtn) {
          logoutBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(logoutClicked, 'TopNav logout button found and clicked');
    await sleep(600);

    const splitCardPresent = await evaluate('!!document.querySelector("[data-testid=\'auth-split-card\']")');
    assert.strictEqual(splitCardPresent, true, 'User returned to Login Split Card after logout');
  });
});
