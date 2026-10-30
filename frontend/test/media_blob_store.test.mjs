// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Blob Persistence Store Test Suite

import test from 'node:test';
import assert from 'node:assert';
import {
  storeMediaBlob,
  getMediaBlob,
  getOrRehydrateObjectUrl,
} from '../src/utils/mediaBlobStore.ts';

test('Media Blob Persistence Store Suite', async (suite) => {
  await suite.test('1. storeMediaBlob and getMediaBlob store and retrieve binary blob in memory fallback', async () => {
    const mediaId = 'media_test_01';
    const fakeBlob = new Blob(['sample video data'], { type: 'video/mp4' });

    await storeMediaBlob(mediaId, fakeBlob);
    const retrieved = await getMediaBlob(mediaId);

    assert.ok(retrieved, 'Blob should be retrieved from store');
    assert.strictEqual(retrieved.type, 'video/mp4');
    assert.strictEqual(retrieved.size, fakeBlob.size);
  });

  await suite.test('2. getOrRehydrateObjectUrl generates fresh object URL for stored blob', async () => {
    const mediaId = 'media_test_02';
    const fakeBlob = new Blob(['another video data'], { type: 'video/webm' });

    await storeMediaBlob(mediaId, fakeBlob);
    const objectUrl = await getOrRehydrateObjectUrl(mediaId);

    assert.ok(objectUrl, 'Object URL should be returned');
    assert.ok(objectUrl.startsWith('blob:'), 'URL should be a valid blob: URI');

    // Calling again returns cached active URL for the session
    const cachedUrl = await getOrRehydrateObjectUrl(mediaId);
    assert.strictEqual(cachedUrl, objectUrl);
  });

  await suite.test('3. getMediaBlob returns null for unknown mediaId', async () => {
    const result = await getMediaBlob('media_unknown_999');
    assert.strictEqual(result, null);
  });
});
