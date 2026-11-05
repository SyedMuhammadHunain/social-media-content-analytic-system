// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Animated GIF Provider, Search & Direct URL Attachment (Task 5)

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

test('Animated GIF Provider & Search Integration (Task 5)', async (suite) => {
  await suite.test('presetGifs.ts defines animated .gif URLs with search tags and categories', () => {
    const presetPath = path.join(projectRoot, 'frontend/src/app/feed/presetGifs.ts');
    assert.ok(fs.existsSync(presetPath), 'presetGifs.ts must exist');

    const content = fs.readFileSync(presetPath, 'utf8');

    assert.ok(content.includes('export const PRESET_GIFS'), 'Must export PRESET_GIFS');
    assert.ok(content.includes('export const GIF_CATEGORIES'), 'Must export GIF_CATEGORIES');

    // Confirm real animated .gif URLs (not static Unsplash JPEGs)
    assert.ok(content.includes('.gif'), 'All presets must contain .gif URLs');
    assert.strictEqual(
      content.includes('unsplash.com'),
      false,
      'PRESET_GIFS must not use static unsplash photos'
    );

    // Verify key reaction categories
    assert.ok(content.includes('Party') || content.includes('Celebration'), 'Must have celebration/party category');
    assert.ok(content.includes('Clap') || content.includes('Applause'), 'Must have clap/applause category');
    assert.ok(content.includes('Dance'), 'Must have dance category');
    assert.ok(content.includes('Fire'), 'Must have fire category');
  });

  await suite.test('MediaPickerPopovers.tsx renders search input, categories, and direct URL input', () => {
    const popoverPath = path.join(projectRoot, 'frontend/src/app/feed/MediaPickerPopovers.tsx');
    assert.ok(fs.existsSync(popoverPath), 'MediaPickerPopovers.tsx must exist');

    const content = fs.readFileSync(popoverPath, 'utf8');

    assert.ok(content.includes('data-testid="gif-picker-popover"'), 'Must have gif-picker-popover testid');
    assert.ok(content.includes('data-testid="gif-search-input"'), 'Must have gif-search-input testid');
    assert.ok(content.includes('data-testid="custom-gif-url-input"'), 'Must have custom-gif-url-input testid');
    assert.ok(content.includes('data-testid="attach-custom-gif-btn"'), 'Must have attach-custom-gif-btn testid');
    assert.ok(content.includes('filteredGifs'), 'Must filter GIFs dynamically');
  });

  await suite.test('PostMediaDropzone.tsx and PostMediaViewer.tsx support GIF badges', () => {
    const dropzonePath = path.join(projectRoot, 'frontend/src/app/feed/PostMediaDropzone.tsx');
    const viewerPath = path.join(projectRoot, 'frontend/src/app/feed/PostMediaViewer.tsx');

    const dropzoneContent = fs.readFileSync(dropzonePath, 'utf8');
    const viewerContent = fs.readFileSync(viewerPath, 'utf8');

    assert.ok(
      dropzoneContent.includes('GIF Attached'),
      'PostMediaDropzone must display "GIF Attached" badge for .gif assets'
    );
    assert.ok(
      viewerContent.includes('data-testid="post-gif-badge"'),
      'PostMediaViewer must render post-gif-badge overlay'
    );
  });
});

const CDP_PORT = 9289;
const TARGET_URL = 'http://127.0.0.1:5173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Animated GIF Live CDP Creation & Preview Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,900',
    `--user-data-dir=/tmp/chrome-gif-test-${Date.now()}`,
    TARGET_URL,
  ]);

  t.after(() => {
    try {
      chrome.kill();
    } catch {}
  });

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
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
  let msgId = 1;
  const pendingRequests = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  t.after(() => {
    try {
      ws.close();
    } catch {}
  });

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const evalExpr = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  // Authenticate session immediately
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
        bio: 'Building large-scale content processing pipelines and real-time social telemetry.',
        followerCount: 14200,
        followingCount: 486,
      }));
    `,
  });

  await send('Page.reload');

  // Wait for React app to mount NewsFeedPage
  let appReady = false;
  for (let i = 0; i < 30; i++) {
    const ready = await evalExpr(`!!document.querySelector('.newsfeed-page-wrapper')`);
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'React NewsFeedPage mounted');

  // Step 1: Open Post Composer Modal via prompt bar
  const openModalSuccess = await evalExpr(`
    (() => {
      const promptBar = document.querySelector('[data-testid="post-composer-prompt-bar"]');
      if (promptBar) {
        promptBar.click();
        return true;
      }
      return false;
    })()
  `);
  assert.ok(openModalSuccess, 'Post composer prompt bar must be clickable');
  await sleep(600);

  // Step 2: Open GIF Picker in Post Composer
  const gifBtnClicked = await evalExpr(`
    (() => {
      const gifBtn = document.querySelector('[data-testid="toolbar-gif-btn"]');
      if (gifBtn) {
        gifBtn.click();
        return true;
      }
      return false;
    })()
  `);
  assert.ok(gifBtnClicked, 'Choose a GIF button in composer toolbar must exist');
  await sleep(500);

  // Step 3: Verify GIF Popover and search input
  const popoverCheck = await evalExpr(`
    (() => {
      const popover = document.querySelector('[data-testid="gif-picker-popover"]');
      const searchInput = document.querySelector('[data-testid="gif-search-input"]');
      const grid = document.querySelector('[data-testid="gif-grid"]');
      const customInput = document.querySelector('[data-testid="custom-gif-url-input"]');
      const attachBtn = document.querySelector('[data-testid="attach-custom-gif-btn"]');
      const gifItems = document.querySelectorAll('[data-testid^="gif-item-"]');

      return {
        hasPopover: !!popover,
        hasSearchInput: !!searchInput,
        hasGrid: !!grid,
        hasCustomInput: !!customInput,
        hasAttachBtn: !!attachBtn,
        gifCount: gifItems.length,
      };
    })()
  `);

  assert.ok(popoverCheck.hasPopover, 'GIF Picker Popover must be rendered');
  assert.ok(popoverCheck.hasSearchInput, 'GIF Picker must contain Astryx search input');
  assert.ok(popoverCheck.hasGrid, 'GIF Picker must render animated GIF grid');
  assert.ok(popoverCheck.hasCustomInput, 'Must have direct custom GIF URL input');
  assert.ok(popoverCheck.gifCount >= 4, 'Must provide multiple animated reaction GIFs');

  // Step 4: Click a GIF to attach to the post
  const selectGifSuccess = await evalExpr(`
    (() => {
      const firstGif = document.querySelector('[data-testid^="gif-item-"]');
      if (firstGif) {
        firstGif.click();
        return true;
      }
      return false;
    })()
  `);
  assert.ok(selectGifSuccess, 'Clicking GIF item should select it');
  await sleep(500);

  // Step 5: Verify GIF is attached in the Dropzone preview
  const dropzoneCheck = await evalExpr(`
    (() => {
      const img = document.querySelector('img[alt="Attached media"]');
      const text = document.body.innerText;
      return {
        hasImg: !!img,
        imgSrc: img ? img.src : null,
        hasBadge: text.includes('GIF Attached'),
      };
    })()
  `);

  assert.ok(dropzoneCheck.hasImg, 'Attached GIF preview image must be present in composer dropzone');
  assert.ok(
    dropzoneCheck.imgSrc && dropzoneCheck.imgSrc.includes('giphy.com'),
    'Attached image src must match selected animated GIF URL'
  );
  assert.ok(dropzoneCheck.hasBadge, 'Post dropzone must display "GIF Attached" badge');
});
