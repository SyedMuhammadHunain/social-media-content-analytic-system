// Test Suite: User Authentication Flow (Login Split Card)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9226;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp';

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
    await evaluate(`
      (() => {
        const toggleLink = document.querySelector('[data-testid="auth-toggle-mode"]');
        if (toggleLink) toggleLink.click();
      })()
    `);
    await sleep(250);
    const hasUsernameInput = await evaluate(`
      !!document.querySelector('input[name="username"], input[placeholder*="username" i], [data-testid="auth-input-username"] input')
    `);
    assert.strictEqual(hasUsernameInput, true, 'Register form must reveal username input');

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
    
    let bannerFound = false;
    for (let i = 0; i < 30; i++) {
      bannerFound = await evaluate('!!document.querySelector("[data-testid=\'auth-error-banner\'], [data-astryx-theme*=\'banner\']")');
      if (bannerFound) break;
      await sleep(200);
    }
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
    
    let feedMounted = false;
    for (let i = 0; i < 30; i++) {
      feedMounted = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\'], nav")');
      if (feedMounted) break;
      await sleep(200);
    }
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

  await t.test('6. "Continue with Google" button and Social Auth options are present', async () => {
    const googleBtnPresent = await evaluate('!!document.querySelector("[data-testid=\'auth-continue-with-google-btn\']")');
    assert.strictEqual(googleBtnPresent, true, 'Continue with Google button must be present');

    const socialGoogleBtn = await evaluate('!!document.querySelector("[data-testid=\'auth-google-btn\']")');
    assert.strictEqual(socialGoogleBtn, true, 'Social Google button must be present in SocialAuthButtons');
  });

  await t.test('7. Clicking "Continue with Google" opens the Google Authentication Modal', async () => {
    await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="auth-continue-with-google-btn"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const modalVisible = await evaluate('!!document.querySelector("[data-testid=\'google-auth-modal\']")');
    assert.strictEqual(modalVisible, true, 'Google OAuth modal must be open');

    const optionsCount = await evaluate('document.querySelectorAll("[data-testid^=\'google-account-option-\']").length');
    assert.ok(optionsCount >= 2, 'Preset Google accounts must be rendered in modal');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/auth_google_modal.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('8. Selecting a Google Account completes OAuth and authenticates into the Feed', async () => {
    const selected = await evaluate(`
      (() => {
        const firstOption = document.querySelector('[data-testid="google-account-option-0"]');
        if (firstOption) {
          firstOption.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(selected, 'First Google account option selected');

    let feedMounted = false;
    for (let i = 0; i < 40; i++) {
      feedMounted = await evaluate('!!document.querySelector("[data-testid=\'user-profile-card\'], nav")');
      if (feedMounted) break;
      await sleep(250);
    }
    assert.strictEqual(feedMounted, true, 'Application must mount authenticated Feed after Google login');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/auth_google_authenticated_feed.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('9. Can log out from Google session back to Login Split Card', async () => {
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
    assert.strictEqual(splitCardPresent, true, 'User returned to Login Split Card after Google logout');
  });
});

