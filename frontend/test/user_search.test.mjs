// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - User Search & Index Test Suite

import test from 'node:test';
import assert from 'node:assert';
import { buildUserPool, matchUsers } from '../src/utils/userSearchIndex.ts';

test('User Search & Index Utility Suite', async (suite) => {
  const mockCurrentUser = {
    id: 'user_hunain',
    username: 'hunain',
    name: 'Syed Muhammad Hunain',
    avatarUrl: 'https://example.com/hunain.jpg',
    headline: 'Staff Architect',
    tags: ['Architecture'],
    bio: 'Bio text',
    followerCount: 14000,
    followingCount: 400,
    isFollowed: false,
  };

  const mockDemoUsers = [
    {
      id: 'user_alice',
      username: 'alice',
      name: 'Alice Walker',
      avatarUrl: 'https://example.com/alice.jpg',
      headline: 'Cloud Lead',
    },
    {
      id: 'user_bob',
      username: 'bob_dev',
      name: 'Bob Creator',
      avatarUrl: 'https://example.com/bob.jpg',
      headline: 'Media Director',
    },
  ];

  const mockSuggested = [
    {
      id: 'user_alice', // Duplicate ID with demoUsers
      username: 'alice',
      name: 'Alice Walker',
      avatarUrl: 'https://example.com/alice_alt.jpg',
      isFollowed: false,
      headline: 'Suggested Lead',
    },
    {
      id: 'user_charlie',
      username: 'charlie_ux',
      name: 'Charlie Smith',
      avatarUrl: 'https://example.com/charlie.jpg',
      isFollowed: true,
      headline: 'UI Specialist',
    },
  ];

  const mockPosts = [
    {
      id: 'post_1',
      userId: 'user_david',
      author: {
        id: 'user_david',
        username: 'david_db',
        name: 'David Kim',
        avatarUrl: 'https://example.com/david.jpg',
        isFollowed: false,
      },
      type: 'TEXT',
      hashtags: [],
      likesCount: 1,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: '1m ago',
    },
  ];

  await suite.test('1. buildUserPool merges and deduplicates sources by user id', () => {
    const pool = buildUserPool(mockDemoUsers, mockSuggested, mockPosts, mockCurrentUser);

    const ids = pool.map((u) => u.id);
    assert.strictEqual(new Set(ids).size, ids.length, 'All IDs in pool must be unique');
    assert.ok(ids.includes('user_hunain'), 'Includes current user');
    assert.ok(ids.includes('user_alice'), 'Includes demo user');
    assert.ok(ids.includes('user_bob'), 'Includes demo user');
    assert.ok(ids.includes('user_charlie'), 'Includes suggested creator');
    assert.ok(ids.includes('user_david'), 'Includes post author');

    // Precedence test: Alice's headline should come from demoUsers (first added), not suggested
    const alice = pool.find((u) => u.id === 'user_alice');
    assert.strictEqual(alice?.headline, 'Cloud Lead');
  });

  await suite.test('2. matchUsers returns matching users by name case-insensitively', () => {
    const pool = buildUserPool(mockDemoUsers, mockSuggested, mockPosts, mockCurrentUser);
    const results = matchUsers('alice', pool);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].username, 'alice');

    const partialName = matchUsers('WALK', pool);
    assert.strictEqual(partialName.length, 1);
    assert.strictEqual(partialName[0].id, 'user_alice');
  });

  await suite.test('3. matchUsers returns matching users by username case-insensitively', () => {
    const pool = buildUserPool(mockDemoUsers, mockSuggested, mockPosts, mockCurrentUser);
    const results = matchUsers('bob_dev', pool);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 'user_bob');
  });

  await suite.test('4. matchUsers returns empty array on empty query or whitespace', () => {
    const pool = buildUserPool(mockDemoUsers, mockSuggested, mockPosts, mockCurrentUser);
    assert.deepStrictEqual(matchUsers('', pool), []);
    assert.deepStrictEqual(matchUsers('   ', pool), []);
  });

  await suite.test('5. matchUsers excludes user matching excludeId', () => {
    const pool = buildUserPool(mockDemoUsers, mockSuggested, mockPosts, mockCurrentUser);
    const resultsWithoutFilter = matchUsers('hunain', pool);
    assert.strictEqual(resultsWithoutFilter.length, 1);

    const resultsWithFilter = matchUsers('hunain', pool, 'user_hunain');
    assert.strictEqual(resultsWithFilter.length, 0);
  });

  await suite.test('6. matchUsers caps results to specified limit', () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: `user_${i}`,
      name: `Test User ${i}`,
      username: `testuser_${i}`,
    }));

    const resultsDefaultLimit = matchUsers('test', manyUsers);
    assert.strictEqual(resultsDefaultLimit.length, 8);

    const resultsCustomLimit = matchUsers('test', manyUsers, undefined, 3);
    assert.strictEqual(resultsCustomLimit.length, 3);
  });
});
