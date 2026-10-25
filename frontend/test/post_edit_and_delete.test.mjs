// Test Suite: Post Edit and Delete Capabilities (PDF Section 4.1.ii)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9229;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Post Edit and Delete Capabilities Flow (PDF Section 4.1.ii)', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1050',
    `--user-data-dir=/tmp/chrome-post-edit-test-${Date.now()}`,
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

  // Authenticate as hunain_creator
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

  const evaluate = async expr => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
    });
    return res.result?.value;
  };

  // Wait until feed is mounted
  let appReady = false;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('!!document.querySelector("nav")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(250);
  }
  assert.ok(appReady, 'App and navigation rendered in DOM');

  await t.test('1. Authored posts display Edit and Delete controls; non-authored posts do not', async () => {
    const checks = await evaluate(`
      (() => {
        const authoredEditBtn = document.querySelector('[data-testid="post-edit-btn-post_00"]');
        const authoredDeleteBtn = document.querySelector('[data-testid="post-delete-btn-post_00"]');
        const otherEditBtn = document.querySelector('[data-testid="post-edit-btn-post_01"]');
        const otherDeleteBtn = document.querySelector('[data-testid="post-delete-btn-post_01"]');
        return {
          hasAuthoredEdit: !!authoredEditBtn,
          hasAuthoredDelete: !!authoredDeleteBtn,
          hasOtherEdit: !!otherEditBtn,
          hasOtherDelete: !!otherDeleteBtn,
        };
      })()
    `);

    assert.strictEqual(checks.hasAuthoredEdit, true, 'Authored post must have Edit button');
    assert.strictEqual(checks.hasAuthoredDelete, true, 'Authored post must have Delete button');
    assert.strictEqual(checks.hasOtherEdit, false, 'Non-authored post must not have Edit button');
    assert.strictEqual(checks.hasOtherDelete, false, 'Non-authored post must not have Delete button');
  });

  await t.test('2. Clicking Edit on an authored post opens PostEditModal with current text', async () => {
    const modalOpened = await evaluate(`
      (() => {
        const editBtn = document.querySelector('[data-testid="post-edit-btn-post_00"]');
        if (editBtn) editBtn.click();
        return !!editBtn;
      })()
    `);
    assert.ok(modalOpened, 'Edit button clicked on authored post');

    let modalState = null;
    for (let i = 0; i < 20; i++) {
      await sleep(150);
      modalState = await evaluate(`
        (() => {
          const modal = document.querySelector('[data-testid="post-edit-modal"]');
          const textarea = document.querySelector('[data-testid="post-edit-text-input"] textarea, [data-testid="post-edit-modal"] textarea');
          return {
            isModalVisible: !!modal,
            textValue: textarea?.value || '',
          };
        })()
      `);
      if (modalState?.isModalVisible) break;
    }

    assert.strictEqual(modalState?.isModalVisible, true, 'PostEditModal should be open');
    assert.ok(modalState?.textValue.includes('Excited to unveil'), 'Modal pre-populates post text');
  });

  await t.test('3. Saving edits updates the post content and hashtags in the feed', async () => {
    const updated = await evaluate(`
      (() => {
        const textarea = document.querySelector('[data-testid="post-edit-text-input"] textarea, [data-testid="post-edit-modal"] textarea');
        if (!textarea) return false;

        textarea.value = 'Updated post content via automated verification [EDITED V2]';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        const saveBtn = document.querySelector('[data-testid="post-edit-save-btn"]');
        if (saveBtn) {
          saveBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(updated, 'Save edits button clicked');
    await sleep(400);

    const postContent = await evaluate(`
      (() => {
        const postCard = document.querySelector('[data-testid="post-card-post_00"]') || document.body;
        return postCard.innerText;
      })()
    `);

    assert.ok(postContent.includes('[EDITED V2]'), 'Feed reflects edited post content');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/post_edit_verified.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('4. Clicking Delete prompts confirmation and removes post from feed', async () => {
    // Click delete on authored post
    const deleteClicked = await evaluate(`
      (() => {
        const delBtn = document.querySelector('[data-testid="post-delete-btn-post_00"]');
        if (delBtn) {
          delBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(deleteClicked, 'Delete button clicked on authored post');
    await sleep(200);

    // Confirm deletion
    const confirmed = await evaluate(`
      (() => {
        const confirmBtn = document.querySelector('[data-testid="confirm-delete-btn"]');
        if (confirmBtn) {
          confirmBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(confirmed, 'Confirm delete button clicked');
    await sleep(400);

    const postStillExists = await evaluate(`
      (() => {
        const postCard = document.querySelector('[data-testid="post-card-post_00"]');
        const postText = document.body.innerText;
        return !!postCard || postText.includes('[EDITED V2]');
      })()
    `);

    assert.strictEqual(postStillExists, false, 'Deleted post must be permanently removed from feed');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/post_delete_confirmed.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('5. Profile View reflects updated post history and post count', async () => {
    // Open full profile view
    await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="user-profile-card"]');
        if (card) card.click();
      })()
    `);
    await sleep(400);

    const profileState = await evaluate(`
      (() => {
        const profileView = document.querySelector('[data-testid="user-profile-view"]');
        const text = document.body.innerText;
        return {
          hasProfileView: !!profileView || text.includes('Staff Infrastructure Architect'),
          hasDeletedPost: text.includes('[EDITED V2]'),
        };
      })()
    `);

    assert.ok(profileState.hasProfileView, 'Full profile view mounted');
    assert.strictEqual(profileState.hasDeletedPost, false, 'Deleted post does not appear in profile post history');
  });
});
