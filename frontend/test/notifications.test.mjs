// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Notification System API Client & Reactive Gateway Endpoints (CT-263 Gap 1)

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  notificationsApi,
} = await import('../src/api/index.ts');

test('Notification System Client Suite', async (suite) => {
  let server;
  let serverPort;
  let lastRequest = null;

  const mockNotifications = [
    {
      id: 'notif_seed_01',
      recipientUserId: 'user_hunain',
      actorUserId: 'user_alice',
      actorName: 'Alice Walker',
      actorAvatar: 'https://images.unsplash.com/photo-alice',
      type: 'LIKE',
      targetPostId: 'post_01',
      message: 'Alice Walker liked your post.',
      read: false,
      createdAt: '2026-10-27T10:15:00Z',
    },
    {
      id: 'notif_seed_02',
      recipientUserId: 'user_hunain',
      actorUserId: 'user_bob',
      actorName: 'Bob Creator',
      actorAvatar: 'https://images.unsplash.com/photo-bob',
      type: 'COMMENT',
      targetPostId: 'post_01',
      message: 'Bob Creator commented on your post.',
      read: false,
      createdAt: '2026-10-27T10:10:00Z',
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
        lastRequest = {
          method: req.method,
          url: req.url,
          body: parsedBody,
        };

        // GET /v1/notifications/{userId}
        if (req.url === '/v1/notifications/user_hunain' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: mockNotifications }));
          return;
        }

        // GET /v1/notifications/{userId}/unread-count
        if (req.url === '/v1/notifications/user_hunain/unread-count' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { userId: 'user_hunain', unreadCount: 2 },
          }));
          return;
        }

        // PUT /v1/notifications/{id}/read
        if (req.url === '/v1/notifications/notif_seed_01/read' && req.method === 'PUT') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { ...mockNotifications[0], read: true },
          }));
          return;
        }

        // PUT /v1/notifications/{userId}/read-all
        if (req.url === '/v1/notifications/user_hunain/read-all' && req.method === 'PUT') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { userId: 'user_hunain', markedCount: 2 },
          }));
          return;
        }

        // POST /v1/notifications
        if (req.url === '/v1/notifications' && req.method === 'POST') {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: {
              id: 'notif_new_99',
              ...parsedBody,
              read: false,
              createdAt: new Date().toISOString(),
            },
          }));
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

  await suite.test('getNotifications returns list of notification entities', async () => {
    const list = await notificationsApi.getNotifications('user_hunain');
    assert.strictEqual(list.length, 2);
    assert.strictEqual(list[0].id, 'notif_seed_01');
    assert.strictEqual(list[0].type, 'LIKE');
    assert.strictEqual(list[1].type, 'COMMENT');
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/notifications/user_hunain');
  });

  await suite.test('getUnreadCount returns correct numerical count', async () => {
    const count = await notificationsApi.getUnreadCount('user_hunain');
    assert.strictEqual(count, 2);
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/notifications/user_hunain/unread-count');
  });

  await suite.test('markAsRead updates notification state', async () => {
    const updated = await notificationsApi.markAsRead('notif_seed_01');
    assert.strictEqual(updated.id, 'notif_seed_01');
    assert.strictEqual(updated.read, true);
    assert.strictEqual(lastRequest.method, 'PUT');
    assert.strictEqual(lastRequest.url, '/v1/notifications/notif_seed_01/read');
  });

  await suite.test('markAllAsRead marks all notifications as read', async () => {
    const marked = await notificationsApi.markAllAsRead('user_hunain');
    assert.strictEqual(marked, 2);
    assert.strictEqual(lastRequest.method, 'PUT');
    assert.strictEqual(lastRequest.url, '/v1/notifications/user_hunain/read-all');
  });

  await suite.test('triggerNotification creates new notification alert', async () => {
    const created = await notificationsApi.triggerNotification({
      recipientUserId: 'user_hunain',
      actorUserId: 'user_charlie',
      actorName: 'Charlie Davis',
      type: 'FOLLOW',
      message: 'Charlie Davis started following you.',
    });
    assert.strictEqual(created.id, 'notif_new_99');
    assert.strictEqual(created.type, 'FOLLOW');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/notifications');
  });

  await suite.test('Live Gateway /v1/notifications integration test', async () => {
    setApiGatewayUrl('http://127.0.0.1:8080');
    try {
      const liveList = await notificationsApi.getNotifications('user_hunain');
      assert.ok(Array.isArray(liveList));
      assert.ok(liveList.length >= 1);
      assert.strictEqual(liveList[0].recipientUserId, 'user_hunain');

      const count = await notificationsApi.getUnreadCount('user_hunain');
      assert.strictEqual(typeof count, 'number');
    } finally {
      setApiGatewayUrl(`http://127.0.0.1:${serverPort}`);
    }
  });
});
