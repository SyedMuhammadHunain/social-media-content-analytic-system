// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Live Auth & Demo User Switcher Integration

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  setAuthToken,
  getAuthToken,
  authApi,
} = await import('../src/api/index.ts');

const { SEED_ACCOUNTS } = await import('../src/mock/authSeedData.ts');

test('Auth Integration & User Switcher Suite', async (suite) => {
  let server;
  let serverPort;
  let lastRequest = null;
  let mockUsers = [
    { id: 'user_hunain', username: 'hunain', name: 'Syed Muhammad Hunain', avatarUrl: 'https://images.unsplash.com/photo-hunain' },
    { id: 'user_alice', username: 'alice', name: 'Alice Walker', avatarUrl: 'https://images.unsplash.com/photo-alice' },
    { id: 'user_bob', username: 'bob', name: 'Bob Creator', avatarUrl: 'https://images.unsplash.com/photo-bob' },
    { id: 'user_charlie', username: 'charlie', name: 'Charlie Dev', avatarUrl: 'https://images.unsplash.com/photo-charlie' },
  ];

  suite.before(async () => {
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        lastRequest = {
          method: req.method,
          url: req.url,
          body: body ? JSON.parse(body) : null,
        };

        if (req.url === '/v1/auth/users' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: mockUsers }));
          return;
        }

        if (req.url === '/v1/auth/login' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          if (parsed.password === 'password123') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'SUCCESS',
              data: {
                userId: parsed.usernameOrEmail === 'alice' ? 'user_alice' : 'user_hunain',
                username: parsed.usernameOrEmail,
                email: `${parsed.usernameOrEmail}@example.com`,
                token: `jwt_token_${parsed.usernameOrEmail}`,
              },
            }));
            return;
          }
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ERROR', message: 'Invalid credentials' }));
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
    if (server) {
      server.close();
    }
    setApiGatewayUrl(null);
    setAuthToken(null);
  });

  await suite.test('Verifies seed accounts contain all 4 Atlas demo users', () => {
    const userIds = SEED_ACCOUNTS.map(a => a.user.id);
    assert.ok(userIds.includes('user_hunain'), 'Contains user_hunain');
    assert.ok(userIds.includes('user_alice'), 'Contains user_alice');
    assert.ok(userIds.includes('user_bob'), 'Contains user_bob');
    assert.ok(userIds.includes('user_charlie'), 'Contains user_charlie');
  });

  await suite.test('Fetches live demo users from Gateway /v1/auth/users', async () => {
    const users = await authApi.getDemoUsers();
    assert.strictEqual(users.length, 4);
    assert.strictEqual(users[0].id, 'user_hunain');
    assert.strictEqual(users[1].id, 'user_alice');
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/auth/users');
  });

  await suite.test('Live Gateway Login sets auth token in client', async () => {
    const loginRes = await authApi.login({ usernameOrEmail: 'alice', password: 'password123' });
    assert.strictEqual(loginRes.userId, 'user_alice');
    assert.strictEqual(loginRes.token, 'jwt_token_alice');
    assert.strictEqual(getAuthToken(), 'jwt_token_alice');
  });

  await suite.test('Offline fallback: seed accounts have valid passwords and profiles', () => {
    const aliceAcc = SEED_ACCOUNTS.find(a => a.user.id === 'user_alice');
    assert.ok(aliceAcc);
    assert.strictEqual(aliceAcc.email, 'alice@example.com');
    assert.strictEqual(aliceAcc.passwordHash, 'password123');
    assert.strictEqual(aliceAcc.user.name, 'Alice Walker');

    const bobAcc = SEED_ACCOUNTS.find(a => a.user.id === 'user_bob');
    assert.ok(bobAcc);
    assert.strictEqual(bobAcc.email, 'bob@example.com');
    assert.strictEqual(bobAcc.user.name, 'Bob Creator');
  });

  await suite.test('Logout clears auth token and triggers confirmation state', () => {
    setAuthToken('mock_session_token_123');
    assert.strictEqual(getAuthToken(), 'mock_session_token_123');

    authApi.logout();
    assert.strictEqual(getAuthToken(), null, 'Session token cleared upon logout');
  });
});
