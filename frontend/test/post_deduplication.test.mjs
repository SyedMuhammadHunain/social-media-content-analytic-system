// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Post Deduplication & 2x Duplicate Post Fix

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage in global scope for Node test runner
const mockStore = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStore.get(key) ?? null,
  setItem: (key, val) => mockStore.set(key, String(val)),
  removeItem: (key) => mockStore.delete(key),
  clear: () => mockStore.clear(),
};

test('Post Deduplication & Reconcile Suite', async (suite) => {
  const { deduplicatePosts } = await import('../src/utils/postDeduplicationUtils.ts');
  const { saveSharedPost, getSharedPosts } = await import('../src/utils/sharedPostsStore.ts');

  suite.beforeEach(() => {
    mockStore.clear();
  });

  await suite.test('1. deduplicatePosts eliminates identical ID duplicates', () => {
    const posts = [
      { id: 'post_1', userId: 'user_alex', author: { id: 'user_alex', username: 'alex', name: 'Alex' }, text: 'Hello', createdAt: 'Just now' },
      { id: 'post_1', userId: 'user_alex', author: { id: 'user_alex', username: 'alex', name: 'Alex' }, text: 'Hello', createdAt: 'Just now' },
    ];
    const result = deduplicatePosts(posts);
    assert.strictEqual(result.length, 1);
  });

  await suite.test('2. deduplicatePosts reconciles optimistic tempId with backend created.id', () => {
    const optimisticPost = {
      id: 'post_1730000000000',
      userId: 'user_alex',
      author: { id: 'user_alex', username: 'alex', name: 'Alex' },
      text: 'My brand new post!',
      mediaUrls: ['https://example.com/photo.jpg'],
      createdAt: 'Just now',
    };
    const backendPost = {
      id: '672000000000000000000001',
      userId: 'user_alex',
      author: { id: 'user_alex', username: 'alex', name: 'Alex' },
      text: 'My brand new post!',
      mediaUrls: ['https://example.com/photo.jpg'],
      createdAt: '2026-11-05T09:00:00Z',
    };

    // Both in list (optimistic + live backend copy)
    const result = deduplicatePosts([optimisticPost, backendPost]);
    assert.strictEqual(result.length, 1, 'Must collapse optimistic and backend copies into 1 post');
    assert.strictEqual(result[0].id, '672000000000000000000001', 'Must prefer the backend persistent ID');

    // Reverse order: backend post arrived first, followed by optimistic
    const resultReverse = deduplicatePosts([backendPost, optimisticPost]);
    assert.strictEqual(resultReverse.length, 1, 'Must collapse in reverse order');
    assert.strictEqual(resultReverse[0].id, '672000000000000000000001');
  });

  await suite.test('3. deduplicatePosts preserves distinct posts with same text from different users', () => {
    const post1 = {
      id: 'post_100',
      userId: 'user_alex',
      author: { id: 'user_alex', username: 'alex', name: 'Alex' },
      text: 'Good morning!',
      createdAt: '10:00 AM',
    };
    const post2 = {
      id: 'post_101',
      userId: 'user_maria',
      author: { id: 'user_maria', username: 'maria', name: 'Maria' },
      text: 'Good morning!',
      createdAt: '10:01 AM',
    };
    const result = deduplicatePosts([post1, post2]);
    assert.strictEqual(result.length, 2, 'Distinct users posting same text must both be kept');
  });

  await suite.test('4. saveSharedPost prevents persisting 2x duplicate copies in shared store', () => {
    const postA = {
      id: 'post_temp_9999999',
      userId: 'user_alex',
      author: { id: 'user_alex', username: 'alex', name: 'Alex' },
      text: 'Shared store uniqueness test',
      likesCount: 0,
      commentsCount: 0,
      comments: [],
      createdAt: 'Just now',
    };

    saveSharedPost(postA);
    // Saving second time with same ID
    saveSharedPost(postA);

    const stored = getSharedPosts();
    const matches = stored.filter(p => p.text === 'Shared store uniqueness test');
    assert.strictEqual(matches.length, 1, 'Shared store must contain exactly 1 copy of the post');
  });
});
