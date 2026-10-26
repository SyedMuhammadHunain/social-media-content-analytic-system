// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Frontend Typed Gateway API Client Layer

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

// Import typed API client via Node native ESM + TypeScript support
const {
  api,
  ApiError,
  setApiGatewayUrl,
  getApiGatewayUrl,
  setAuthToken,
  getAuthToken,
  authApi,
  feedApi,
  mapBackendPostToUi,
  mapBackendModelPostToUi,
  postsApi,
  socialApi,
  mediaApi,
} = await import('../src/api/index.ts');

test('API Client Suite', async (suite) => {
  let server;
  let serverPort;
  let lastRequest = null;
  let mockResponse = { status: 'SUCCESS', data: { ok: true } };
  let mockStatusCode = 200;

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
          headers: req.headers,
          body: body ? JSON.parse(body) : null,
        };

        res.writeHead(mockStatusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockResponse));
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

  await suite.test('Client base URL and token management', () => {
    assert.strictEqual(getApiGatewayUrl(), `http://127.0.0.1:${serverPort}`);

    setAuthToken('jwt_test_token_123');
    assert.strictEqual(getAuthToken(), 'jwt_test_token_123');

    setAuthToken(null);
    assert.strictEqual(getAuthToken(), null);
  });

  await suite.test('Auth token header inclusion in requests', async () => {
    setAuthToken('token_abc_xyz');
    mockStatusCode = 200;
    mockResponse = { status: 'SUCCESS', data: { verified: true } };

    const result = await api.get('/v1/test/auth');
    assert.deepStrictEqual(result, { verified: true });
    assert.strictEqual(lastRequest.headers.authorization, 'Bearer token_abc_xyz');
    setAuthToken(null);
  });

  await suite.test('Handles ApiResponse envelope and error responses', async () => {
    mockStatusCode = 400;
    mockResponse = { status: 'ERROR', message: 'Invalid payload' };

    await assert.rejects(
      async () => {
        await api.post('/v1/test/error', { bad: true });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.strictEqual(err.status, 400);
        assert.strictEqual(err.message, 'Invalid payload');
        return true;
      }
    );
  });

  await suite.test('authApi: login, register, demo users, and logout', async () => {
    mockStatusCode = 200;
    mockResponse = {
      status: 'SUCCESS',
      data: {
        userId: 'user_hunain',
        username: 'hunain',
        email: 'hunain@example.com',
        token: 'auth_jwt_hunain_777',
      },
    };

    const loginRes = await authApi.login({ usernameOrEmail: 'hunain', password: 'password123' });
    assert.strictEqual(loginRes.userId, 'user_hunain');
    assert.strictEqual(getAuthToken(), 'auth_jwt_hunain_777');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/auth/login');
    assert.strictEqual(lastRequest.body.usernameOrEmail, 'hunain');

    mockResponse = {
      status: 'SUCCESS',
      data: [
        { id: 'user_hunain', username: 'hunain', name: 'Syed Muhammad Hunain' },
        { id: 'user_alice', username: 'alice', name: 'Alice Walker' },
      ],
    };
    const demoUsers = await authApi.getDemoUsers();
    assert.strictEqual(demoUsers.length, 2);
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/auth/users');

    authApi.logout();
    assert.strictEqual(getAuthToken(), null);
  });

  await suite.test('feedApi: getFeedForUser and DTO mapping to UI Post model', async () => {
    const rawDto = {
      postId: 'post_seed_01',
      authorId: 'user_alice',
      authorName: 'Alice Walker',
      authorAvatar: 'https://images.unsplash.com/photo-alice',
      text: 'Deep dive into event-driven CQRS fan-out systems.',
      mediaUrl: 'https://images.unsplash.com/photo-diagram',
      mediaType: 'IMAGE',
      hashtags: ['#distributedsystems', '#cqrs'],
      likeCount: 42,
      commentCount: 7,
      likedByCurrentUser: true,
      createdAt: '2026-10-26T12:00:00Z',
    };

    mockStatusCode = 200;
    mockResponse = {
      status: 'SUCCESS',
      data: {
        userId: 'user_alice',
        page: 0,
        size: 20,
        posts: [rawDto],
      },
    };

    const feed = await feedApi.getFeedForUser('user_alice', 0, 10);
    assert.strictEqual(feed.posts.length, 1);
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/feeds/user_alice?page=0&size=10');

    // Test mapBackendPostToUi
    const uiPost = mapBackendPostToUi(rawDto);
    assert.strictEqual(uiPost.id, 'post_seed_01');
    assert.strictEqual(uiPost.userId, 'user_alice');
    assert.strictEqual(uiPost.author.name, 'Alice Walker');
    assert.strictEqual(uiPost.type, 'IMAGE');
    assert.deepStrictEqual(uiPost.mediaUrls, ['https://images.unsplash.com/photo-diagram']);
    assert.strictEqual(uiPost.likesCount, 42);
    assert.strictEqual(uiPost.commentsCount, 7);
    assert.strictEqual(uiPost.isLiked, true);
    assert.deepStrictEqual(uiPost.hashtags, ['#distributedsystems', '#cqrs']);

    // Test mapBackendModelPostToUi
    const backendPost = {
      id: 'p_101',
      userId: 'user_bob',
      text: 'Bob created a post',
      mediaType: 'TEXT',
      hashtags: ['#dev'],
      likeCount: 5,
      commentCount: 1,
      createdAt: '2026-10-26T15:00:00Z',
      deleted: false,
    };
    const mappedModel = mapBackendModelPostToUi(backendPost);
    assert.strictEqual(mappedModel.id, 'p_101');
    assert.strictEqual(mappedModel.type, 'TEXT');
    assert.strictEqual(mappedModel.text, 'Bob created a post');
  });

  await suite.test('postsApi: create, get, update, delete', async () => {
    mockStatusCode = 201;
    mockResponse = {
      status: 'SUCCESS',
      data: {
        id: 'post_new_01',
        userId: 'user_hunain',
        text: 'Hello world from test',
        mediaType: 'TEXT',
        hashtags: ['#hello'],
        likeCount: 0,
        commentCount: 0,
        createdAt: '2026-10-26T16:00:00Z',
        deleted: false,
      },
    };

    const created = await postsApi.createPost({
      userId: 'user_hunain',
      text: 'Hello world from test',
      mediaType: 'TEXT',
      hashtags: ['#hello'],
    });
    assert.strictEqual(created.id, 'post_new_01');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/posts');

    mockStatusCode = 200;
    mockResponse = {
      status: 'SUCCESS',
      data: { postId: 'post_new_01', deleted: true },
    };
    const delRes = await postsApi.deletePost('post_new_01', 'user_hunain');
    assert.strictEqual(delRes.deleted, true);
    assert.strictEqual(lastRequest.method, 'DELETE');
    assert.strictEqual(lastRequest.url, '/v1/posts/post_new_01?userId=user_hunain');
  });

  await suite.test('socialApi: like, unlike, comment, follow', async () => {
    // Like
    mockStatusCode = 200;
    mockResponse = {
      status: 'SUCCESS',
      data: { postId: 'post_01', liked: true, totalLikes: 43 },
    };
    const likeRes = await socialApi.likePost('user_hunain', 'post_01');
    assert.strictEqual(likeRes.liked, true);
    assert.strictEqual(likeRes.totalLikes, 43);
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/like');

    // Unlike
    mockResponse = {
      status: 'SUCCESS',
      data: { postId: 'post_01', liked: false, totalLikes: 42 },
    };
    const unlikeRes = await socialApi.unlikePost('user_hunain', 'post_01');
    assert.strictEqual(unlikeRes.liked, false);
    assert.strictEqual(lastRequest.url, '/v1/unlike');

    // Comment
    mockResponse = {
      status: 'SUCCESS',
      data: {
        id: 'c_999',
        postId: 'post_01',
        userId: 'user_hunain',
        content: 'Insightful post!',
        createdAt: '2026-10-26T17:00:00Z',
        deleted: false,
      },
    };
    const commentRes = await socialApi.addComment({
      userId: 'user_hunain',
      postId: 'post_01',
      content: 'Insightful post!',
    });
    assert.strictEqual(commentRes.id, 'c_999');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/comment');

    // Follow
    mockResponse = {
      status: 'SUCCESS',
      data: { followerId: 'user_hunain', followingId: 'user_alice', isFollowing: true },
    };
    const followRes = await socialApi.followUser('user_hunain', 'user_alice');
    assert.strictEqual(followRes.isFollowing, true);
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/follow');

    // Follow Status
    mockResponse = { status: 'SUCCESS', data: { isFollowing: true } };
    const status = await socialApi.checkFollowStatus('user_hunain', 'user_alice');
    assert.strictEqual(status, true);
    assert.strictEqual(lastRequest.method, 'GET');
    assert.ok(lastRequest.url.startsWith('/v1/follow/status'));
  });

  await suite.test('mediaApi: presign request', async () => {
    mockStatusCode = 200;
    mockResponse = {
      status: 'SUCCESS',
      data: {
        uploadUrl: 'https://socialmedia.blob.core.windows.net/posts/image.jpg?sas=123',
        publicBlobUrl: 'https://socialmedia.blob.core.windows.net/posts/image.jpg',
        expiresAt: '2026-10-26T18:00:00Z',
      },
    };

    const presign = await mediaApi.getPresignedUploadUrl({
      userId: 'user_hunain',
      fileName: 'image.jpg',
      contentType: 'image/jpeg',
    });
    assert.strictEqual(presign.publicBlobUrl, 'https://socialmedia.blob.core.windows.net/posts/image.jpg');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/media/presign');
  });
});
