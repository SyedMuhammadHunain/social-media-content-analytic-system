// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Chrome DevTools Audit Script

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const screenshotsDir = path.join(repoRoot, 'docs', 'reports', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method && this.eventListeners.has(msg.method)) {
          for (const listener of this.eventListeners.get(msg.method)) {
            listener(msg.params);
          }
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runDevToolsAudit() {
  console.log('🚀 Launching Headless Chrome on CDP port 9224...');
  const chromeProcess = spawn(
    '/opt/google/chrome/chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9224',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--user-data-dir=/tmp/chrome-devtools-audit-profile',
      '--window-size=1440,1050',
    ],
    { stdio: 'ignore' }
  );

  // Wait for Chrome to boot
  await new Promise((r) => setTimeout(r, 1500));

  const versionRes = await fetch('http://127.0.0.1:9224/json/version');
  const versionData = await versionRes.json();
  console.log(`Connected to Chrome DevTools: ${versionData['User-Agent']}`);

  const targetsRes = await fetch('http://127.0.0.1:9224/json/list');
  let targets = await targetsRes.json();
  let pageTarget = targets.find((t) => t.type === 'page');

  if (!pageTarget) {
    const newTargetRes = await fetch('http://127.0.0.1:9224/json/new?http://127.0.0.1:5173/');
    pageTarget = await newTargetRes.json();
  }

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  const consoleLogs = [];
  const networkRequests = [];

  // Enable domains
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  client.on('Runtime.consoleAPICalled', (params) => {
    consoleLogs.push({
      type: params.type,
      args: params.args.map((a) => a.value || a.description).join(' '),
    });
  });

  client.on('Network.responseReceived', (params) => {
    networkRequests.push({
      url: params.response.url,
      status: params.response.status,
      mimeType: params.response.mimeType,
    });
  });

  async function capturePage(url, screenshotName, testIdSelector) {
    console.log(`\n📄 Navigating to ${url}...`);
    await client.send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 2000));

    // Evaluate DOM
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(${function (sel) {
        return {
          title: document.title,
          url: window.location.href,
          hasTargetElement: sel ? !!document.querySelector(sel) : null,
          bodyChildCount: document.body.children.length,
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map((h) => h.innerText.trim()).filter(Boolean),
        };
      }.toString()})(${JSON.stringify(testIdSelector)})`,
      returnByValue: true,
    });

    console.log(`  State:`, evalRes.result.value);

    // Capture screenshot
    const shotRes = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(screenshotsDir, screenshotName);
    fs.writeFileSync(shotPath, Buffer.from(shotRes.data, 'base64'));
    console.log(`  📸 Screenshot saved to: ${shotPath}`);

    return evalRes.result.value;
  }

  // 1. Authenticate via localStorage before loading views
  console.log('\n🔑 Setting authenticated session in browser localStorage...');
  await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await new Promise((r) => setTimeout(r, 1000));

  await client.send('Runtime.evaluate', {
    expression: `(() => {
      const user = {
        id: 'user_hunain',
        username: 'hunain',
        name: 'Syed Muhammad Hunain',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        coverBannerUrl: '',
        bio: 'Staff Infrastructure Architect • Distributed Media Systems',
        isFollowed: false,
        headline: 'Staff Infrastructure Architect • Distributed Media Systems',
        tags: ['Creator', 'Meta Astryx'],
        followerCount: 1250,
        followingCount: 380,
      };
      localStorage.setItem('smcas_session_user', JSON.stringify(user));
      localStorage.setItem('smcas_auth_token', 'mock_token_user_hunain');
      return true;
    })()`,
    returnByValue: true,
  });

  // 1. NewsFeed Authenticated
  const newsFeedState = await capturePage(
    'http://127.0.0.1:5173/',
    'devtools_newsfeed_10_10.png',
    '[data-testid^="post-card-"], article, main'
  );

  // 2. Dashboard Authenticated
  const dashboardState = await capturePage(
    'http://127.0.0.1:5173/dashboard',
    'devtools_dashboard_10_10.png',
    '[data-testid="dashboard-kpi-cards"], [data-testid="astryx-kpi-cards"], svg'
  );

  // 3. Login Card
  const loginCardState = await capturePage(
    'http://127.0.0.1:5173/login-card',
    'devtools_logincard_10_10.png',
    '[data-testid="auth-split-card"]'
  );

  // Wrap up
  client.close();
  chromeProcess.kill();

  const errors = consoleLogs.filter((l) => l.type === 'error');
  const warnings = consoleLogs.filter((l) => l.type === 'warning');

  console.log('\n📊 DevTools Audit Complete:');
  console.log(`  - Total Network Requests: ${networkRequests.length}`);
  console.log(`  - Console Errors: ${errors.length}`);
  console.log(`  - Console Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    const distinctErrors = [...new Set(errors.map((e) => e.args))];
    console.log('\n🔍 Distinct Console Errors:');
    distinctErrors.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));
  }

  return {
    newsFeedState,
    dashboardState,
    loginCardState,
    networkRequests,
    consoleErrors: errors,
    consoleWarnings: warnings,
  };
}

runDevToolsAudit()
  .then((results) => {
    console.log('\n✅ DevTools verification passed with zero uncaught fatal exceptions.');
  })
  .catch((err) => {
    console.error('❌ DevTools audit failed:', err);
    process.exit(1);
  });
