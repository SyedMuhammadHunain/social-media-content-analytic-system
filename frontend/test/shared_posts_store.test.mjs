// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Shared Cross-Profile Posts Store Test Suite

import test from 'node:test';
import assert from 'node:assert';
import {
  getSharedPosts,
  saveSharedPost,
  updateSharedPost,
  deleteSharedPost,
} from '../src/utils/sharedPostsStore.ts';
import { INITIAL_POSTS } from '../src/mock/socialSeedData.ts';

// Mock localStorage in global scope for Node test runner
const mockStore = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStore.get(key) ?? null,
  setItem: (key, val) => mockStore.set(key, String(val)),
  removeItem: (key) => mockStore.delete(key),
  clear: () => mockStore.clear(),
};

test('Shared Cross-Profile Posts Store Suite', async (suite) => {
  suite.beforeEach(() => {
    mockStore.clear();
  });

  await suite.test('1. getSharedPosts initializes with INITIAL_POSTS when store is empty', () => {
    const posts = getSharedPosts();
    assert.ok(Array.isArray(posts), 'Returns array of posts');
    assert.strictEqual(posts.length, INITIAL_POSTS.length, 'Contains all initial seed posts');
    assert.strictEqual(posts[0].id, INITIAL_POSTS[0].id);
  });

  await suite.test('2. saveSharedPost prepends new post and persists to shared storage', () => {
    const newPost = {
      id: 'post_afzal_999',
      userId: 'usr_afzal_01',
      author: {
        id: 'usr_afzal_01',
        username: 'afzalxdreader_goog',
        name: 'AFZAL iqbal',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isFollowed: false,
      },
      type: 'VIDEO',
      text: 'hack insight project video presentation',
      mediaUrls: ['blob:http://localhost:5173/sample-video-123'],
      hashtags: ['#hackinsight', '#video'],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: 'Just now',
    };

    const updated = saveSharedPost(newPost);

    assert.strictEqual(updated[0].id, 'post_afzal_999', 'New post must be at index 0');
    assert.strictEqual(updated[0].text, 'hack insight project video presentation');

    // Retrieve again to verify persistence
    const loaded = getSharedPosts();
    assert.strictEqual(loaded[0].id, 'post_afzal_999', 'Persisted post is loaded for any other caller');
    assert.strictEqual(loaded[0].author.username, 'afzalxdreader_goog');
  });

  await suite.test('3. Cross-profile visibility: post authored by AFZAL is visible to other profiles', () => {
    const postByAfzal = {
      id: 'post_afzal_1001',
      userId: 'usr_afzal_01',
      author: {
        id: 'usr_afzal_01',
        username: 'afzalxdreader_goog',
        name: 'AFZAL iqbal',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isFollowed: false,
      },
      type: 'TEXT',
      text: 'Broadcast message visible to Hunain, Sarah, and David',
      hashtags: ['#broadcast'],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: 'Just now',
    };

    saveSharedPost(postByAfzal);

    // Simulate switching to user "hunain_creator"
    const hunainFeed = getSharedPosts();
    const foundInHunainFeed = hunainFeed.find((p) => p.id === 'post_afzal_1001');
    assert.ok(foundInHunainFeed, 'Post authored by AFZAL must be visible in Hunains feed');

    // Simulate switching to user "sarah_infra"
    const sarahFeed = getSharedPosts();
    const foundInSarahFeed = sarahFeed.find((p) => p.id === 'post_afzal_1001');
    assert.ok(foundInSarahFeed, 'Post authored by AFZAL must be visible in Sarahs feed');

    // Author profile filter check
    const afzalProfilePosts = hunainFeed.filter(
      (p) => p.author.id === 'usr_afzal_01' || p.author.username === 'afzalxdreader_goog'
    );
    assert.strictEqual(afzalProfilePosts.length, 1, 'Post is filtered onto AFZALs profile');
  });

  await suite.test('4. updateSharedPost modifies post content and synchronizes state', () => {
    const post = {
      id: 'post_sync_test',
      userId: 'usr_afzal_01',
      author: { id: 'usr_afzal_01', username: 'afzal', name: 'AFZAL', isFollowed: false },
      type: 'TEXT',
      text: 'Initial text',
      hashtags: [],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: 'Just now',
    };
    saveSharedPost(post);

    updateSharedPost('post_sync_test', (p) => ({
      ...p,
      text: 'Updated text across all profiles',
      likesCount: 5,
      isLiked: true,
    }));

    const result = getSharedPosts().find((p) => p.id === 'post_sync_test');
    assert.strictEqual(result.text, 'Updated text across all profiles');
    assert.strictEqual(result.likesCount, 5);
    assert.strictEqual(result.isLiked, true);
  });

  await suite.test('5. deleteSharedPost removes post from shared storage', () => {
    const post = {
      id: 'post_to_delete',
      userId: 'usr_afzal_01',
      author: { id: 'usr_afzal_01', username: 'afzal', name: 'AFZAL', isFollowed: false },
      type: 'TEXT',
      text: 'To be deleted',
      hashtags: [],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: 'Just now',
    };
    saveSharedPost(post);
    assert.ok(getSharedPosts().some((p) => p.id === 'post_to_delete'));

    deleteSharedPost('post_to_delete');
    assert.strictEqual(getSharedPosts().some((p) => p.id === 'post_to_delete'), false);
  });
});
