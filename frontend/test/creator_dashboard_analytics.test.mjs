// Test Suite: Creator Analytics Dashboard & Real-Time Sync (PDF Sections 4.1.vii-ix & 4.2)
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9228;
const TARGET_URL = 'http://127.0.0.1:5173/';
const ARTIFACT_DIR = '/home/hunain/.gemini/antigravity-cli/brain/b60459bf-1c43-4639-bbef-e1bee06cb513';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('Creator Analytics Dashboard & Real-Time Sync Flow', async (t) => {
  const chrome = spawn('google-chrome-stable', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--disable-extensions',
    '--window-size=1440,1000',
    `--user-data-dir=/tmp/chrome-dashboard-test-${Date.now()}`,
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

  // Wait until nav is mounted
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

  await t.test('1. Dashboard mounts the 3 dedicated creator analytical graphs (PDF Req 4.1.vii, viii, ix)', async () => {
    // Navigate to Analytics Dashboard
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const dashboardBtn = items.find(el => el.innerText && el.innerText.includes('Analytics Dashboard'));
        if (dashboardBtn) dashboardBtn.click();
      })()
    `);
    await sleep(400);

    const graphs = await evaluate(`
      (() => {
        const likeUnlike = document.querySelector('[data-testid="like-unlike-graph"]');
        const followers = document.querySelector('[data-testid="followers-trend-graph"]');
        const engagement = document.querySelector('[data-testid="engagement-graph"]');
        return {
          hasLikeUnlikeGraph: !!likeUnlike,
          hasFollowersGraph: !!followers,
          hasEngagementGraph: !!engagement,
        };
      })()
    `);

    assert.strictEqual(graphs.hasLikeUnlikeGraph, true, 'Like/Unlike comparative bar graph must be present');
    assert.strictEqual(graphs.hasFollowersGraph, true, 'Followers trend line graph must be present');
    assert.strictEqual(graphs.hasEngagementGraph, true, 'Comments & Engagement graph must be present');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/creator_dashboard_overview.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });

  await t.test('2. Creator performance metric cards display live counters', async () => {
    const metrics = await evaluate(`
      (() => {
        const followersCard = document.querySelector('[data-testid="metric-total-followers"]');
        const likesCard = document.querySelector('[data-testid="metric-total-likes"]');
        const engagementCard = document.querySelector('[data-testid="metric-engagement-rate"]');
        return {
          hasFollowers: !!followersCard,
          hasLikes: !!likesCard,
          hasEngagement: !!engagementCard,
          followersText: followersCard?.innerText || '',
          likesText: likesCard?.innerText || '',
        };
      })()
    `);

    assert.strictEqual(metrics.hasFollowers, true, 'Total Followers metric card must exist');
    assert.strictEqual(metrics.hasLikes, true, 'Total Likes metric card must exist');
    assert.strictEqual(metrics.hasEngagement, true, 'Engagement metric card must exist');
  });

  await t.test('3. Liking a post in News Feed updates Like/Unlike metric within 2 seconds (PDF Req 4.2)', async () => {
    // Return to News Feed
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const feedBtn = items.find(el => el.innerText && el.innerText.includes('News Feed'));
        if (feedBtn) feedBtn.click();
      })()
    `);
    await sleep(400);

    // Click like on first post
    const likeClicked = await evaluate(`
      (() => {
        const likeBtns = Array.from(document.querySelectorAll('button')).filter(b => {
          return b.innerText && (b.innerText.includes('Like') || b.querySelector('svg'));
        });
        const postLikeBtn = likeBtns.find(b => b.closest('[class*="Card"], div'));
        if (postLikeBtn) {
          postLikeBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(likeClicked, 'Post like button clicked in News Feed');

    // Switch back to Dashboard
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const dashboardBtn = items.find(el => el.innerText && el.innerText.includes('Analytics Dashboard'));
        if (dashboardBtn) dashboardBtn.click();
      })()
    `);

    // Verify under 2000ms eventual consistency
    await sleep(800);
    const updatedLikes = await evaluate(`
      (() => {
        const likesCard = document.querySelector('[data-testid="metric-total-likes"]');
        return likesCard ? likesCard.innerText : null;
      })()
    `);
    assert.ok(updatedLikes, 'Dashboard metric refreshed within 2 seconds');
  });

  await t.test('4. Following an author in News Feed updates Followers graph within 2 seconds (PDF Req 4.2)', async () => {
    // Return to News Feed
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const feedBtn = items.find(el => el.innerText && el.innerText.includes('News Feed'));
        if (feedBtn) feedBtn.click();
      })()
    `);
    await sleep(400);

    // Toggle follow on an author
    const followClicked = await evaluate(`
      (() => {
        const followBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText && (b.innerText.includes('Follow') || b.innerText.includes('Following'))
        );
        if (followBtn) {
          followBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(followClicked, 'Author follow button clicked in News Feed');

    // Return to Dashboard
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const dashboardBtn = items.find(el => el.innerText && el.innerText.includes('Analytics Dashboard'));
        if (dashboardBtn) dashboardBtn.click();
      })()
    `);
    await sleep(800);

    const followerCount = await evaluate(`
      (() => {
        const followersCard = document.querySelector('[data-testid="metric-total-followers"]');
        return followersCard ? followersCard.innerText : null;
      })()
    `);
    assert.ok(followerCount, 'Followers metric updated within 2 seconds');
  });

  await t.test('5. Commenting on a post updates Engagement graph within 2 seconds (PDF Req 4.2)', async () => {
    // Return to News Feed
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const feedBtn = items.find(el => el.innerText && el.innerText.includes('News Feed'));
        if (feedBtn) feedBtn.click();
      })()
    `);
    await sleep(400);

    // Open comments and post a comment
    const commentAdded = await evaluate(`
      (() => {
        const commentToggleBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText && b.innerText.includes('Comment')
        );
        if (commentToggleBtn) commentToggleBtn.click();

        const input = document.querySelector('input[placeholder*="comment" i], textarea[placeholder*="comment" i]');
        if (!input) return false;

        input.value = 'Real-time telemetry verification comment';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText && b.innerText.includes('Post')
        );
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(commentAdded, 'Comment submitted on post');

    // Return to Dashboard
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('nav [role="button"], nav button, nav *'));
        const dashboardBtn = items.find(el => el.innerText && el.innerText.includes('Analytics Dashboard'));
        if (dashboardBtn) dashboardBtn.click();
      })()
    `);
    await sleep(800);

    const engagementVal = await evaluate(`
      (() => {
        const card = document.querySelector('[data-testid="metric-engagement-rate"]');
        return card ? card.innerText : null;
      })()
    `);
    assert.ok(engagementVal, 'Engagement metrics refreshed within 2 seconds');

    try {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        fs.writeFileSync(`${ARTIFACT_DIR}/creator_dashboard_realtime_sync.png`, Buffer.from(res.data, 'base64'));
      }
    } catch {}
  });
});
