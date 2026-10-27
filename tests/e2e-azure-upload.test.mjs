// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: End-to-End Azure Blob Storage Media Upload & Rendering Verification (Task 29)

import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9245;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

test('Exhaustive E2E Azure Blob Media Upload & Feed Verification Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1050',
    `--user-data-dir=/tmp/chrome-azure-upload-${Date.now()}`,
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
      const pageTarget = list.find((p) => p.type === 'page' && p.url.includes('5173'));
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

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  ws.onmessage = (evt) => {
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

  const evaluate = async (expr) => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  };

  const captureScreenshot = async (filename) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  };

  // Step 1: Pre-populate authenticated session for user_hunain
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('smcas_session_user', JSON.stringify({
        id: 'user_hunain',
        username: 'hunain',
        name: 'Syed Muhammad Hunain',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        headline: 'Staff Infrastructure Architect • Distributed Media Systems',
        tags: ['Systems Architecture', 'Distributed Systems', 'Meta Astryx', '500M DAU'],
        bio: 'Building large-scale content processing pipelines and real-time social telemetry.',
        followerCount: 14200,
        followingCount: 486,
      }));
    `,
  });

  await send('Page.navigate', { url: TARGET_URL });

  // Step 2: Wait for newsfeed to load
  let feedLoaded = false;
  for (let i = 0; i < 25; i++) {
    await sleep(300);
    const postCount = await evaluate(`document.querySelectorAll('[data-testid^="post-card-"]').length`);
    if (postCount > 0) {
      feedLoaded = true;
      break;
    }
  }
  assert.ok(feedLoaded, 'Newsfeed posts rendered successfully');

  // Step 3: Trigger file upload via synthetic image in PostComposer
  console.log('Synthesizing image and triggering Azure Blob Storage direct upload...');
  const uploadInitiated = await evaluate(`
    (async () => {
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput) return false;

      // Draw a 240x240 image with Azure blue banner
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0078D4'; // Azure Blue
      ctx.fillRect(0, 0, 300, 200);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Microsoft Azure', 75, 95);
      ctx.font = '14px sans-serif';
      ctx.fillText('Blob Storage Verified', 80, 125);

      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
      const file = new File([blob], 'azure_architecture_proof.jpg', { type: 'image/jpeg' });

      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()
  `);
  assert.ok(uploadInitiated, 'File input triggered successfully');

  // Step 4: Wait for Azure Blob direct PUT upload to complete
  let uploadCompleted = false;
  let azureBlobUrl = '';
  for (let i = 0; i < 40; i++) {
    await sleep(300);
    const previewSrc = await evaluate(`
      (() => {
        const img = document.querySelector('img[alt="Upload preview"]');
        return img ? img.src : '';
      })()
    `);

    if (previewSrc && previewSrc.includes('socialmediaanalysis.blob.core.windows.net')) {
      azureBlobUrl = previewSrc;
      uploadCompleted = true;
      break;
    }
  }

  assert.ok(uploadCompleted, 'Direct Azure Blob PUT upload completed successfully');
  console.log('Azure Blob Public URL:', azureBlobUrl);

  // Capture Screenshot of Post Composer with Azure upload active
  await captureScreenshot('e2e_azure_upload_composer_active.png');

  // Step 5: Enter post text and publish
  const postText = `Live Microsoft Azure Blob Storage integration verified! Uploaded high-res asset to container media-assets. #azure #cloud #astryx #${Date.now().toString().slice(-4)}`;
  await evaluate(`
    (() => {
      // Set text in textarea
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, ${JSON.stringify(postText)});
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);

  await sleep(400);

  // Click Publish Post button
  const published = await evaluate(`
    (() => {
      const pubBtn = document.querySelector('[data-testid="composer-publish-btn"]') ||
                     Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Publish'));
      if (pubBtn && !pubBtn.disabled) {
        pubBtn.click();
        return true;
      }
      return false;
    })()
  `);
  assert.ok(published, 'Publish Post button clicked');

  // Step 6: Verify new post appears at top of newsfeed with Azure Blob image rendered
  let postRendered = false;
  let renderedImageSrc = '';
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const topPostInfo = await evaluate(`
      (() => {
        const topPost = document.querySelector('[data-testid^="post-card-"]');
        if (!topPost) return null;
        const text = topPost.textContent || '';
        const img = topPost.querySelector('[data-testid="post-media-image"], img[src*="blob.core.windows.net"]');
        return {
          hasText: text.includes('Microsoft Azure Blob Storage integration verified'),
          imgSrc: img ? img.src : ''
        };
      })()
    `);

    if (topPostInfo && topPostInfo.hasText && topPostInfo.imgSrc.includes('socialmediaanalysis.blob.core.windows.net')) {
      renderedImageSrc = topPostInfo.imgSrc;
      postRendered = true;
      break;
    }
  }

  assert.ok(postRendered, 'Post card rendered with Azure Blob Storage hosted image');
  console.log('Rendered Post Card Image URL:', renderedImageSrc);

  // Capture Screenshot of Newsfeed with Azure Blob Post
  await captureScreenshot('e2e_azure_blob_newsfeed_rendered.png');

  // Step 7: Verify public HTTP GET on the rendered image URL returns HTTP 200
  const imageFetch = await fetch(renderedImageSrc);
  assert.strictEqual(imageFetch.status, 200, 'Azure Blob image must be publicly accessible via HTTPS');
  const imageBytes = await imageFetch.arrayBuffer();
  assert.ok(imageBytes.byteLength > 500, 'Image bytes received from Azure must be valid image data');
  console.log('Public Azure Blob verification: HTTP 200 OK (' + imageBytes.byteLength + ' bytes)');
});
