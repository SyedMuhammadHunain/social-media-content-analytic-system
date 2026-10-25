// Test Suite: News Feed 3-Column Social Discovery Architecture
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9231;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('News Feed 3-Column Social Discovery Architecture Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1050',
    `--user-data-dir=/tmp/chrome-3col-test-${Date.now()}`,
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

  // Authenticate session user so News Feed loads immediately
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

  const captureScreenshot = async filename => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(data, 'base64'));
  };

  // Wait for React News Feed to mount
  let appReady = false;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate('!!document.querySelector("[data-testid=\'newsfeed-left-rail\']")');
    if (ready) {
      appReady = true;
      break;
    }
    await sleep(200);
  }
  assert.ok(appReady, 'News Feed 3-column container mounted in DOM');

  await t.test('1. Desktop viewport (1440px) displays 3 columns: Left rail, Center feed, and Right rail side-by-side', async () => {
    const layout = await evaluate(`
      (() => {
        const leftRail = document.querySelector('[data-testid="newsfeed-left-rail"]');
        const rightRail = document.querySelector('[data-testid="newsfeed-right-rail"]');
        const main = document.querySelector('.newsfeed-layout main') || document.querySelector('main main');
        
        if (!leftRail || !rightRail || !main) return null;
        
        const leftStyle = window.getComputedStyle(leftRail);
        const rightStyle = window.getComputedStyle(rightRail);
        
        const leftRect = leftRail.getBoundingClientRect();
        const rightRect = rightRail.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        
        const isLeftVisible = leftStyle.display !== 'none' && leftRect.width >= 260;
        const isRightVisible = rightStyle.display !== 'none' && rightRect.width >= 300;
        const areSideBySide = leftRect.right < mainRect.left && mainRect.right < rightRect.left;
        
        // Check shortcut card presence
        const hasShortcuts = !!document.querySelector('[data-testid="shortcut-all"]');
        // Check trending topics presence
        const hasTrending = !!document.querySelector('[data-testid="trending-topic-systemdesign"]');
        // Check who to follow presence
        const hasWhoToFollow = !!document.querySelector('[data-testid="follow-suggested-usr_sarah_03"]');

        return {
          isLeftVisible,
          isRightVisible,
          areSideBySide,
          hasShortcuts,
          hasTrending,
          hasWhoToFollow,
        };
      })()
    `);

    assert.ok(layout, '3-column elements resolved');
    assert.strictEqual(layout.isLeftVisible, true, 'Left rail must be visible');
    assert.strictEqual(layout.isRightVisible, true, 'Right rail must be visible');
    assert.strictEqual(layout.areSideBySide, true, 'Columns must sit side-by-side on 1440px viewport');
    assert.strictEqual(layout.hasShortcuts, true, 'Left rail shortcuts card must exist');
    assert.strictEqual(layout.hasTrending, true, 'Right rail trending topics card must exist');
    assert.strictEqual(layout.hasWhoToFollow, true, 'Right rail who to follow card must exist');

    await captureScreenshot('newsfeed_3_column_desktop.png');
  });

  await t.test('2. Clicking a trending topic hashtag filters the feed in-place', async () => {
    const filterResult = await evaluate(`
      (() => {
        const tagBtn = document.querySelector('[data-testid="trending-topic-systemdesign"]');
        if (!tagBtn) return { error: 'trending tag button not found' };
        tagBtn.click();
        return { clicked: true };
      })()
    `);
    assert.strictEqual(filterResult.clicked, true);
    await sleep(400);

    const postState = await evaluate(`
      (() => {
        const clearBtn = document.querySelector('[data-testid="clear-filter-btn"]');
        const postCards = Array.from(document.querySelectorAll('[data-testid^="post-card-"]'));
        
        // Assert every post shown has #systemdesign
        const allMatch = postCards.every(card => {
          return card.textContent.toLowerCase().includes('#systemdesign');
        });
        
        return {
          hasClearBtn: !!clearBtn,
          postCount: postCards.length,
          allMatch,
        };
      })()
    `);

    assert.strictEqual(postState.hasClearBtn, true, 'Active filter clear button must appear');
    assert.ok(postState.postCount > 0, 'Matching posts must be displayed');
    assert.strictEqual(postState.allMatch, true, 'All displayed posts must contain #systemdesign');

    await captureScreenshot('newsfeed_filtered_hashtag.png');
  });

  await t.test('3. Clicking Clear Filter restores complete post stream', async () => {
    const resetResult = await evaluate(`
      (() => {
        const clearBtn = document.querySelector('[data-testid="clear-filter-btn"]');
        if (!clearBtn) return { error: 'clear button missing' };
        clearBtn.click();
        return { clicked: true };
      })()
    `);
    assert.strictEqual(resetResult.clicked, true);
    await sleep(400);

    const resetState = await evaluate(`
      (() => {
        const clearBtn = document.querySelector('[data-testid="clear-filter-btn"]');
        const postCards = document.querySelectorAll('[data-testid^="post-card-"]');
        return {
          clearBtnPresent: !!clearBtn,
          postCount: postCards.length,
        };
      })()
    `);

    assert.strictEqual(resetState.clearBtnPresent, false, 'Clear filter button must disappear');
    assert.ok(resetState.postCount >= 5, 'Full chronological post stream restored');
  });

  await t.test('4. Clicking shortcuts filters to Media Only and resets on All Posts', async () => {
    // Click Media Only
    await evaluate(`document.querySelector('[data-testid="shortcut-media"]').click()`);
    await sleep(400);

    const mediaState = await evaluate(`
      (() => {
        const clearBtn = document.querySelector('[data-testid="clear-filter-btn"]');
        const postCards = Array.from(document.querySelectorAll('[data-testid^="post-card-"]'));
        const allHaveMedia = postCards.every(c => c.querySelector('img') || c.querySelector('video'));
        return { hasClearBtn: !!clearBtn, allHaveMedia, count: postCards.length };
      })()
    `);

    assert.strictEqual(mediaState.hasClearBtn, true, 'Media filter banner active');
    assert.strictEqual(mediaState.allHaveMedia, true, 'Only posts with images/videos are shown');

    // Reset via All Posts shortcut
    await evaluate(`document.querySelector('[data-testid="shortcut-all"]').click()`);
    await sleep(400);

    const allState = await evaluate(`
      (() => {
        const clearBtn = document.querySelector('[data-testid="clear-filter-btn"]');
        const postCards = document.querySelectorAll('[data-testid^="post-card-"]');
        return { clearBtnPresent: !!clearBtn, count: postCards.length };
      })()
    `);

    assert.strictEqual(allState.clearBtnPresent, false, 'Cleared back to All Posts');
    assert.ok(allState.count >= 5, 'Full feed restored');
  });

  await t.test('5. Following suggested creator updates button to Following and syncs state', async () => {
    const initialText = await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="follow-suggested-usr_sarah_03"] button');
        return btn ? btn.textContent.trim() : null;
      })()
    `);
    assert.strictEqual(initialText, 'Follow', 'Initial state must be Follow');

    // Click Follow button
    await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="follow-suggested-usr_sarah_03"] button');
        btn.click();
      })()
    `);
    await sleep(400);

    const updatedText = await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="follow-suggested-usr_sarah_03"] button');
        return btn ? btn.textContent.trim() : null;
      })()
    `);
    assert.strictEqual(updatedText, 'Following', 'Button text must update to Following');
  });

  await t.test('6. Responsive layout: collapsing to tablet (< 1280px) hides right rail cleanly', async () => {
    // Emulate tablet viewport 1024x900
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1100,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);

    const responsiveState = await evaluate(`
      (() => {
        const rightRail = document.querySelector('[data-testid="newsfeed-right-rail"]');
        const leftRail = document.querySelector('[data-testid="newsfeed-left-rail"]');
        const rightStyle = rightRail ? window.getComputedStyle(rightRail) : null;
        const leftStyle = leftRail ? window.getComputedStyle(leftRail) : null;

        return {
          rightHidden: rightStyle ? rightStyle.display === 'none' : false,
          leftVisible: leftStyle ? leftStyle.display !== 'none' : false,
        };
      })()
    `);

    assert.strictEqual(responsiveState.rightHidden, true, 'Right rail must be hidden at 1100px width');
    assert.strictEqual(responsiveState.leftVisible, true, 'Left rail stays visible at 1100px width');

    await captureScreenshot('newsfeed_tablet_responsive.png');

    // Reset device metrics override
    await send('Emulation.clearDeviceMetricsOverride');
  });
});
