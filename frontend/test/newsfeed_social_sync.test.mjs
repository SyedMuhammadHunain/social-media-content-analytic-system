// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Newsfeed & Social Interaction Sync

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const {
  setApiGatewayUrl,
  feedApi,
  postsApi,
  socialApi,
} = await import('../src/api/index.ts');

test('Newsfeed & Social Interaction Sync Suite', async (suite) => {
  let server;
  let serverPort;
  let lastRequest = null;

  const mockFeedData = {
    userId: 'user_hunain',
    page: 0,
    size: 20,
    posts: [
      {
        postId: 'post_atlas_01',
        authorId: 'user_alice',
        authorName: 'Alice Walker',
        authorAvatar: 'https://images.unsplash.com/photo-alice',
        text: 'Live post fetched directly from MongoDB Atlas SMCAS cluster.',
        mediaUrl: 'https://images.unsplash.com/photo-diagram.png',
        mediaType: 'IMAGE',
        hashtags: ['#distributed', '#mongodb', '#cloud'],
        likeCount: 15,
        commentCount: 4,
        likedByCurrentUser: false,
        createdAt: '2026-10-26T20:00:00Z',
      },
      {
        postId: 'post_atlas_02',
        authorId: 'user_bob',
        authorName: 'Bob Creator',
        authorAvatar: 'https://images.unsplash.com/photo-bob',
        text: 'Video streaming pipeline benchmark: 4K @ 60fps.',
        mediaUrl: 'https://images.unsplash.com/video-thumb.mp4',
        mediaType: 'VIDEO',
        hashtags: ['#streaming', '#video'],
        likeCount: 32,
        commentCount: 2,
        likedByCurrentUser: true,
        createdAt: '2026-10-26T21:00:00Z',
      },
    ],
  };

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

        // Feed endpoint
        if (req.url?.startsWith('/v1/feeds/user_hunain') && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: mockFeedData }));
          return;
        }

        // Post creation
        if (req.url === '/v1/posts' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: {
              id: 'post_new_generated_99',
              userId: parsed.userId,
              text: parsed.text,
              mediaUrl: parsed.mediaUrl,
              mediaType: parsed.mediaType || 'TEXT',
              hashtags: parsed.hashtags || [],
              likeCount: 0,
              commentCount: 0,
              createdAt: '2026-10-26T23:45:00Z',
              deleted: false,
            },
          }));
          return;
        }

        // Post update
        if (req.url === '/v1/posts/post_atlas_01' && req.method === 'PUT') {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: {
              id: 'post_atlas_01',
              userId: parsed.userId,
              text: parsed.text,
              hashtags: parsed.hashtags,
              likeCount: 15,
              commentCount: 4,
              createdAt: '2026-10-26T20:00:00Z',
              deleted: false,
            },
          }));
          return;
        }

        // Post delete
        if (req.url?.startsWith('/v1/posts/post_atlas_01') && req.method === 'DELETE') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', data: { postId: 'post_atlas_01', deleted: true } }));
          return;
        }

        // Likes
        if (req.url === '/v1/like' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { postId: parsed.postId, liked: true, totalLikes: 16 },
          }));
          return;
        }

        if (req.url === '/v1/unlike' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { postId: parsed.postId, liked: false, totalLikes: 15 },
          }));
          return;
        }

        // Comments
        if (req.url === '/v1/comment' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: {
              id: 'c_live_888',
              postId: parsed.postId,
              userId: parsed.userId,
              content: parsed.content,
              createdAt: '2026-10-26T23:46:00Z',
              deleted: false,
            },
          }));
          return;
        }

        if (req.url === '/v1/comment/post_atlas_01' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: [
              {
                id: 'c_seed_01',
                postId: 'post_atlas_01',
                userId: 'user_charlie',
                content: 'Super clean architecture!',
                createdAt: '2026-10-26T20:30:00Z',
                deleted: false,
              },
            ],
          }));
          return;
        }

        // Follow
        if (req.url === '/v1/follow' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { followerId: parsed.followerId, followingId: parsed.followingId, isFollowing: true },
          }));
          return;
        }

        if (req.url === '/v1/unfollow' && req.method === 'POST') {
          const parsed = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'SUCCESS',
            data: { followerId: parsed.followerId, followingId: parsed.followingId, isFollowing: false },
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
    if (server) {
      server.close();
    }
    setApiGatewayUrl(null);
  });

  await suite.test('getFeedPostsUi retrieves and maps live posts from Gateway', async () => {
    const posts = await feedApi.getFeedPostsUi('user_hunain');
    assert.strictEqual(posts.length, 2);

    const first = posts[0];
    assert.strictEqual(first.id, 'post_atlas_01');
    assert.strictEqual(first.userId, 'user_alice');
    assert.strictEqual(first.author.name, 'Alice Walker');
    assert.strictEqual(first.type, 'IMAGE');
    assert.deepStrictEqual(first.mediaUrls, ['https://images.unsplash.com/photo-diagram.png']);
    assert.strictEqual(first.likesCount, 15);
    assert.strictEqual(first.isLiked, false);

    const second = posts[1];
    assert.strictEqual(second.id, 'post_atlas_02');
    assert.strictEqual(second.type, 'VIDEO');
    assert.strictEqual(second.isLiked, true);
  });

  await suite.test('createPost persists to POST /v1/posts', async () => {
    const created = await postsApi.createPost({
      userId: 'user_hunain',
      text: 'Deploying edge gateway filters on Port 8080.',
      hashtags: ['#spring', '#gateway'],
    });

    assert.strictEqual(created.id, 'post_new_generated_99');
    assert.strictEqual(created.userId, 'user_hunain');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/posts');
    assert.strictEqual(lastRequest.body.text, 'Deploying edge gateway filters on Port 8080.');
  });

  await suite.test('likePost and unlikePost update counters against /v1/like & /v1/unlike', async () => {
    const likeRes = await socialApi.likePost('user_hunain', 'post_atlas_01');
    assert.strictEqual(likeRes.liked, true);
    assert.strictEqual(likeRes.totalLikes, 16);
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/like');

    const unlikeRes = await socialApi.unlikePost('user_hunain', 'post_atlas_01');
    assert.strictEqual(unlikeRes.liked, false);
    assert.strictEqual(unlikeRes.totalLikes, 15);
    assert.strictEqual(lastRequest.url, '/v1/unlike');
  });

  await suite.test('addComment and getComments sync against /v1/comment', async () => {
    const commentRes = await socialApi.addComment({
      userId: 'user_hunain',
      postId: 'post_atlas_01',
      content: 'Impressive sub-second fan-out!',
    });
    assert.strictEqual(commentRes.id, 'c_live_888');
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/comment');

    const comments = await socialApi.getComments('post_atlas_01');
    assert.strictEqual(comments.length, 1);
    assert.strictEqual(comments[0].id, 'c_seed_01');
    assert.strictEqual(comments[0].content, 'Super clean architecture!');
    assert.strictEqual(lastRequest.method, 'GET');
    assert.strictEqual(lastRequest.url, '/v1/comment/post_atlas_01');
  });

  await suite.test('followUser and unfollowUser sync against /v1/follow & /v1/unfollow', async () => {
    const followRes = await socialApi.followUser('user_hunain', 'user_charlie');
    assert.strictEqual(followRes.isFollowing, true);
    assert.strictEqual(lastRequest.method, 'POST');
    assert.strictEqual(lastRequest.url, '/v1/follow');

    const unfollowRes = await socialApi.unfollowUser('user_hunain', 'user_charlie');
    assert.strictEqual(unfollowRes.isFollowing, false);
    assert.strictEqual(lastRequest.url, '/v1/unfollow');
  });

  await suite.test('updatePost and deletePost sync against /v1/posts/{postId}', async () => {
    const updated = await postsApi.updatePost('post_atlas_01', {
      userId: 'user_alice',
      text: 'Updated post content for Atlas.',
      hashtags: ['#updated'],
    });
    assert.strictEqual(updated.text, 'Updated post content for Atlas.');
    assert.strictEqual(lastRequest.method, 'PUT');
    assert.strictEqual(lastRequest.url, '/v1/posts/post_atlas_01');

    const deleted = await postsApi.deletePost('post_atlas_01', 'user_alice');
    assert.strictEqual(deleted.deleted, true);
    assert.strictEqual(lastRequest.method, 'DELETE');
    assert.strictEqual(lastRequest.url, '/v1/posts/post_atlas_01?userId=user_alice');
  });
});
