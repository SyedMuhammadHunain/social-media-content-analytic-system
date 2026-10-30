// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Video Upload & Playback Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOptimisticPost } from '../src/app/feed/usePostCrud.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feedDir = path.resolve(__dirname, '../src/app/feed');

test('Video Upload, Preview & Playback Reliability Suite', async (suite) => {
  const dummyUser = {
    id: 'usr_afzal_01',
    username: 'afzalxdreader_goog',
    name: 'AFZAL iqbal',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isFollowed: false,
  };

  await suite.test('1. buildOptimisticPost retains video mediaUrl and VIDEO postType', () => {
    const videoBlobUrl = 'blob:http://localhost:5173/sample-video-uuid-1234';
    const input = {
      type: 'VIDEO',
      text: 'hackinsight project demo video',
      description: 'hackinsight project demo video',
      mediaUrl: videoBlobUrl,
      hashtags: ['#hackinsight', '#video'],
    };

    const post = buildOptimisticPost(input, dummyUser, 'post_test_video_101');

    assert.strictEqual(post.type, 'VIDEO', 'Post type must be VIDEO');
    assert.ok(Array.isArray(post.mediaUrls), 'mediaUrls must be an array');
    assert.strictEqual(post.mediaUrls[0], videoBlobUrl, 'Post must retain the active video mediaUrl');
    assert.strictEqual(post.text, 'hackinsight project demo video');
    assert.strictEqual(post.author.username, 'afzalxdreader_goog');
  });

  await suite.test('2. Video extension detection identifies web video formats vs unsupported containers', () => {
    const isWebVideo = (filename) => /\.(mp4|webm|ogg|mov)$/i.test(filename);
    const isUnsupportedContainer = (filename) => /\.(mkv|avi|wmv|flv)$/i.test(filename);

    assert.strictEqual(isWebVideo('demo.mp4'), true, '.mp4 is supported web video');
    assert.strictEqual(isWebVideo('presentation.webm'), true, '.webm is supported web video');
    assert.strictEqual(isWebVideo('clip.ogg'), true, '.ogg is supported web video');
    assert.strictEqual(isWebVideo('photo.jpg'), false, '.jpg is an image, not video');

    assert.strictEqual(isUnsupportedContainer('project.mkv'), true, '.mkv is an unsupported web container');
    assert.strictEqual(isUnsupportedContainer('archive.avi'), true, '.avi is an unsupported web container');
    assert.strictEqual(isUnsupportedContainer('demo.mp4'), false, '.mp4 is supported');
  });

  await suite.test('3. PostComposer.tsx does not revoke object URLs on submit', () => {
    const composerContent = fs.readFileSync(path.join(feedDir, 'PostComposer.tsx'), 'utf-8');
    
    // handleSubmit should reset state without calling handleRemoveMedia() or URL.revokeObjectURL
    const submitMatch = composerContent.match(/const handleSubmit = \(\) => \{([\s\S]*?)\};/);
    assert.ok(submitMatch, 'handleSubmit function found in PostComposer.tsx');
    assert.strictEqual(
      submitMatch[1].includes('handleRemoveMedia()'),
      false,
      'handleSubmit must NOT invoke handleRemoveMedia() which prematurely destroys blob URLs'
    );
    assert.strictEqual(
      submitMatch[1].includes('URL.revokeObjectURL'),
      false,
      'handleSubmit must NOT revoke object URLs on publish'
    );
  });

  await suite.test('4. PostMediaViewer.tsx implements video playback error boundary', () => {
    const viewerContent = fs.readFileSync(path.join(feedDir, 'PostMediaViewer.tsx'), 'utf-8');
    
    assert.ok(viewerContent.includes('onError='), 'PostMediaViewer must attach onError listener to video element');
    assert.ok(viewerContent.includes('failedMediaUrl'), 'PostMediaViewer tracks failed video URLs');
    assert.ok(viewerContent.includes('VideoCameraSlashIcon'), 'PostMediaViewer imports VideoCameraSlashIcon for fallback');
    assert.ok(viewerContent.includes('Open Video Source'), 'PostMediaViewer provides a direct source action on playback failure');
  });
});
