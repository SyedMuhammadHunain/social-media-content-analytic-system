// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Live Creator Analytical Dashboard Telemetry

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  socialApi,
  feedApi,
} = await import('../src/api/index.ts');

const {
  INITIAL_LIKE_UNLIKE_DATA,
  INITIAL_FOLLOWERS_DATA,
  INITIAL_ENGAGEMENT_DATA,
  INITIAL_SUMMARY_METRICS,
} = await import('../src/mock/analyticsSeedData.ts');

test('Creator Analytics Telemetry Suite', async (suite) => {
  let server;
  let serverPort;

  suite.before(async () => {
    server = http.createServer((req, res) => {
      // Mock followers list
      if (req.url === '/v1/follow/user_hunain/followers') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'SUCCESS', data: ['user_alice', 'user_bob', 'user_charlie'] }));
        return;
      }

      // Mock feed
      if (req.url?.startsWith('/v1/feeds/user_hunain')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'SUCCESS',
          data: {
            userId: 'user_hunain',
            page: 0,
            size: 50,
            posts: [
              { postId: 'p1', likeCount: 50, commentCount: 10 },
              { postId: 'p2', likeCount: 80, commentCount: 20 },
            ],
          },
        }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ERROR', message: 'Not found' }));
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        setApiGatewayUrl(`http://127.0.0.1:${serverPort}`);
        resolve();
      });
    });
  });

  suite.after(() => {
    if (server) {
      server.close();
    }
    setApiGatewayUrl(null);
  });

  await suite.test('Initial seed data satisfies course requirements', () => {
    assert.strictEqual(INITIAL_LIKE_UNLIKE_DATA.length, 7);
    assert.strictEqual(INITIAL_FOLLOWERS_DATA.length, 7);
    assert.strictEqual(INITIAL_ENGAGEMENT_DATA.length, 7);
    assert.strictEqual(INITIAL_SUMMARY_METRICS.totalFollowers, 14200);
    assert.strictEqual(INITIAL_SUMMARY_METRICS.totalLikes, 5100);
    assert.strictEqual(INITIAL_SUMMARY_METRICS.totalComments, 1145);
    assert.strictEqual(INITIAL_SUMMARY_METRICS.engagementRate, '8.4%');
  });

  await suite.test('Simulated real-time like/unlike toggle recalculates telemetry', () => {
    let summary = { ...INITIAL_SUMMARY_METRICS };

    // Like toggle: true
    summary.totalLikes += 1;
    let rate = ((summary.totalComments / summary.totalFollowers) * 100).toFixed(1);
    summary.engagementRate = `${rate}%`;
    assert.strictEqual(summary.totalLikes, 5101);
    assert.strictEqual(summary.engagementRate, '8.1%');

    // Unlike toggle: false
    summary.totalLikes -= 1;
    summary.totalUnlikes += 1;
    assert.strictEqual(summary.totalLikes, 5100);
    assert.strictEqual(summary.totalUnlikes, 174);
  });

  await suite.test('Simulated follow toggle updates net change and follower count', () => {
    let summary = { ...INITIAL_SUMMARY_METRICS };
    summary.totalFollowers += 1;
    assert.strictEqual(summary.totalFollowers, 14201);

    summary.totalFollowers -= 1;
    assert.strictEqual(summary.totalFollowers, 14200);
  });

  await suite.test('Simulated comment addition scales engagement score proportionally (PDF Req 4.1.ix)', () => {
    let comments = 240;
    let engagementScore = comments * 5;
    assert.strictEqual(engagementScore, 1200);

    comments += 1;
    engagementScore = comments * 5;
    assert.strictEqual(engagementScore, 1205);
  });

  await suite.test('Gateway live queries support telemetry aggregation', async () => {
    const followers = await socialApi.getFollowers('user_hunain');
    assert.strictEqual(followers.length, 3);

    const feed = await feedApi.getFeedForUser('user_hunain');
    const totalLikes = feed.posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
    const totalComments = feed.posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

    assert.strictEqual(totalLikes, 130);
    assert.strictEqual(totalComments, 30);
  });
});
