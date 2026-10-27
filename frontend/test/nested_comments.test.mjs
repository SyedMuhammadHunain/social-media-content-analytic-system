// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Nested Comment Replies Engine (CT-263 Section 10.3 Comment.reply & Section 8.1 CommentsDB)

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  socialApi,
} = await import('../src/api/index.ts');

test('Nested Comment Replies Suite', async (suite) => {
  let server;
  let serverPort;
  let requests = [];

  const mockCommentsDatabase = [
    {
      id: 'comm_root_01',
      postId: 'post_nested_01',
      userId: 'user_alice',
      content: 'Distributed caching provides sub-millisecond latencies.',
      parentCommentId: null,
      createdAt: '2026-10-27T10:00:00Z',
      deleted: false,
    },
    {
      id: 'comm_reply_01',
      postId: 'post_nested_01',
      userId: 'user_hunain',
      content: 'Which eviction policy did you choose? LRU or LFU?',
      parentCommentId: 'comm_root_01',
      createdAt: '2026-10-27T10:05:00Z',
      deleted: false,
    },
    {
      id: 'comm_reply_02',
      postId: 'post_nested_01',
      userId: 'user_alice',
      content: 'We use W-TinyLFU with caffeine cache backing.',
      parentCommentId: 'comm_reply_01',
      createdAt: '2026-10-27T10:08:00Z',
      deleted: false,
    },
  ];

  suite.before(async () => {
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const parsedBody = body ? JSON.parse(body) : null;
        requests.push({
          method: req.method,
          url: req.url,
          body: parsedBody,
        });

        // GET /v1/comment/{postId}
        if (req.url === '/v1/comment/post_nested_01' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: mockCommentsDatabase }));
          return;
        }

        // POST /v1/comment
        if (req.url === '/v1/comment' && req.method === 'POST') {
          const newComment = {
            id: `comm_reply_${Date.now()}`,
            postId: parsedBody.postId,
            userId: parsedBody.userId,
            content: parsedBody.content,
            parentCommentId: parsedBody.parentCommentId || null,
            createdAt: new Date().toISOString(),
            deleted: false,
          };
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: newComment }));
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ERROR', message: 'Not found' }));
      });
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
    if (server) server.close();
    setApiGatewayUrl(null);
  });

  await suite.test('getComments retrieves nested comment thread preserving parentCommentId', async () => {
    const comments = await socialApi.getComments('post_nested_01');
    assert.strictEqual(comments.length, 3);

    const root = comments.find(c => c.id === 'comm_root_01');
    assert.strictEqual(root.parentCommentId, null);
    assert.strictEqual(root.content, 'Distributed caching provides sub-millisecond latencies.');

    const reply1 = comments.find(c => c.id === 'comm_reply_01');
    assert.strictEqual(reply1.parentCommentId, 'comm_root_01');
    assert.strictEqual(reply1.content, 'Which eviction policy did you choose? LRU or LFU?');

    const reply2 = comments.find(c => c.id === 'comm_reply_02');
    assert.strictEqual(reply2.parentCommentId, 'comm_reply_01');
  });

  await suite.test('addComment successfully dispatches reply with parentCommentId (PDF Section 10.3)', async () => {
    const replyPayload = {
      postId: 'post_nested_01',
      userId: 'user_charlie',
      content: 'Also consider Redis cluster if you need distributed eviction.',
      parentCommentId: 'comm_root_01',
    };

    const saved = await socialApi.addComment(replyPayload);
    assert.ok(saved.id);
    assert.strictEqual(saved.parentCommentId, 'comm_root_01');
    assert.strictEqual(saved.content, replyPayload.content);

    const lastReq = requests[requests.length - 1];
    assert.strictEqual(lastReq.method, 'POST');
    assert.strictEqual(lastReq.url, '/v1/comment');
    assert.strictEqual(lastReq.body.parentCommentId, 'comm_root_01');
  });

  await suite.test('hierarchical tree construction partitions roots and nested child replies', async () => {
    const comments = await socialApi.getComments('post_nested_01');
    const allIds = new Set(comments.map(c => c.id));

    const rootComments = comments.filter(c => !c.parentCommentId || !allIds.has(c.parentCommentId));
    assert.strictEqual(rootComments.length, 1);
    assert.strictEqual(rootComments[0].id, 'comm_root_01');

    const repliesByParent = new Map();
    comments.forEach(c => {
      if (c.parentCommentId && allIds.has(c.parentCommentId)) {
        const list = repliesByParent.get(c.parentCommentId) || [];
        list.push(c);
        repliesByParent.set(c.parentCommentId, list);
      }
    });

    const rootReplies = repliesByParent.get('comm_root_01');
    assert.strictEqual(rootReplies.length, 1);
    assert.strictEqual(rootReplies[0].id, 'comm_reply_01');

    const nestedReplies = repliesByParent.get('comm_reply_01');
    assert.strictEqual(nestedReplies.length, 1);
    assert.strictEqual(nestedReplies[0].id, 'comm_reply_02');
  });
});
