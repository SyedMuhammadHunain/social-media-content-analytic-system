// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Notification System API Client & Reactive Gateway Endpoints (CT-263 Gap 1)

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  notificationsApi,
} = await import('../src/api/index.ts');

const {
  generateDynamicNotificationsForUser,
  getAvailableActorsForUser,
  isSelfActor,
  normalizeIdentity,
} = await import('../src/components/nav/useNotificationPolling.ts');

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

  await suite.test('Dynamic notification generator guarantees self-exclusion for any user', async () => {
    const testUsers = [
      { id: 'user_hunain', name: 'Syed Muhammad Hunain', username: 'hunain' },
      { id: 'usr_afzal', name: 'Afzal Khan (Verified Lead)', username: 'afzal' },
      { id: 'user_alice', name: 'Alice Walker', username: 'alice' },
      { id: 'user_bob', name: 'Bob Creator', username: 'bob' },
      { id: 'user_charlie', name: 'Charlie Davis', username: 'charlie' },
      { id: 'user_dev_999', name: 'Custom Developer', username: 'custom_dev' },
    ];

    for (const u of testUsers) {
      const notifs = generateDynamicNotificationsForUser(u);
      assert.strictEqual(notifs.length, 4, `Must generate 4 notifications for ${u.name}`);

      for (const n of notifs) {
        assert.strictEqual(n.recipientUserId, u.id);
        assert.notStrictEqual(n.actorUserId, u.id, `Actor ID must not equal recipient ID for ${u.name}`);
        assert.notStrictEqual(n.actorName.toLowerCase(), u.name.toLowerCase(), `Actor name must not equal recipient name for ${u.name}`);
        assert.ok(n.message.length > 0, 'Notification message must not be empty');
        assert.ok(['LIKE', 'COMMENT', 'FOLLOW'].includes(n.type), `Valid notification type expected, got ${n.type}`);
        assert.ok(!isNaN(Date.parse(n.createdAt)), 'Valid ISO createdAt expected');
      }
    }
  });

  await suite.test('getAvailableActorsForUser filters self and merges demoUsers pool', async () => {
    const user = { id: 'user_alice', name: 'Alice Walker', username: 'alice' };
    const extraCreators = [
      { id: 'user_diana', name: 'Diana Prince', username: 'diana', avatarUrl: 'https://example.com/diana.jpg' },
      { id: 'user_alice', name: 'Alice Walker', username: 'alice' }, // duplicate self
    ];

    const actors = getAvailableActorsForUser(user, extraCreators);
    assert.ok(actors.length >= 4);
    assert.ok(actors.every((a) => !isSelfActor(a, user)), 'No actor in the filtered list should match the user');
    assert.ok(actors.some((a) => a.id === 'user_diana'), 'Extra candidate actor Diana must be present');
  });

  await suite.test('normalizeIdentity correctly cleans user ID prefixes', async () => {
    assert.strictEqual(normalizeIdentity('user_hunain'), 'hunain');
    assert.strictEqual(normalizeIdentity('usr_afzal'), 'afzal');
    assert.strictEqual(normalizeIdentity('alice'), 'alice');
    assert.strictEqual(normalizeIdentity(''), '');
  });

  await suite.test('Live Gateway /v1/notifications integration test', async () => {
    // Check if live Gateway on port 8080 is reachable
    let isGatewayLive = false;
    try {
      const ping = await fetch('http://127.0.0.1:8080/actuator/health', { signal: AbortSignal.timeout(1500) });
      isGatewayLive = ping.ok;
    } catch {
      isGatewayLive = false;
    }

    if (!isGatewayLive) {
      // Mock gateway response for isolated test environment
      const list = await notificationsApi.getNotifications('user_hunain');
      assert.ok(Array.isArray(list));
      assert.strictEqual(list.length, 2);
      assert.strictEqual(list[0].recipientUserId, 'user_hunain');
      const count = await notificationsApi.getUnreadCount('user_hunain');
      assert.strictEqual(count, 2);
      return;
    }

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
