// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Comment Deduplication & Media/GIF/Emoji Support in Comments

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const { deduplicateComments, parseCommentContent, mapBackendComment } = await import('../src/app/feed/postCommentUtils.ts');

test('Comment Deduplication & Rich Media Integration Suite', async (suite) => {
  await suite.test('1. deduplicateComments prevents 2x and 3x duplicate comments in feed', () => {
    const rawComments = [
      {
        id: 'c_1730000000000',
        postId: 'post_1',
        userId: 'user_alex',
        author: { id: 'user_alex', username: 'alexchen', name: 'Alex Chen', isFollowed: false },
        text: 'This is a great update!',
        createdAt: 'Just now',
      },
      {
        id: 'c_1730000000000', // duplicate by ID
        postId: 'post_1',
        userId: 'user_alex',
        author: { id: 'user_alex', username: 'alexchen', name: 'Alex Chen', isFollowed: false },
        text: 'This is a great update!',
        createdAt: 'Just now',
      },
      {
        id: 'comm_saved_999', // reconciled saved copy from backend with same author + content
        postId: 'post_1',
        userId: 'user_alex',
        author: { id: 'user_alex', username: 'alexchen', name: 'Alex Chen', isFollowed: false },
        text: 'This is a great update!',
        createdAt: '10:30 AM',
      },
      {
        id: 'comm_saved_999', // duplicate from remoteComments array
        postId: 'post_1',
        userId: 'user_alex',
        author: { id: 'user_alex', username: 'alexchen', name: 'Alex Chen', isFollowed: false },
        text: 'This is a great update!',
        createdAt: '10:30 AM',
      },
      {
        id: 'comm_other_01',
        postId: 'post_1',
        userId: 'user_maria',
        author: { id: 'user_maria', username: 'maria', name: 'Maria Garcia', isFollowed: false },
        text: 'Agreed completely.',
        createdAt: '10:32 AM',
      },
    ];

    const deduplicated = deduplicateComments(rawComments);

    // Must deduplicate down to exactly 2 unique comments
    assert.strictEqual(deduplicated.length, 2, 'Deduplication must eliminate all duplicates');
    assert.ok(
      deduplicated.some(c => c.text === 'This is a great update!'),
      'Must preserve comment content'
    );
    assert.ok(
      deduplicated.some(c => c.text === 'Agreed completely.'),
      'Must preserve unique second comment'
    );
  });

  await suite.test('2. parseCommentContent extracts [media:url] and identifies animated GIFs vs Photos', () => {
    // 2a. Content with [media:url]
    const parsedWithGif = parseCommentContent(
      'Awesome work! [media:https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif]'
    );
    assert.strictEqual(parsedWithGif.text, 'Awesome work!');
    assert.strictEqual(parsedWithGif.mediaUrl, 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif');
    assert.strictEqual(parsedWithGif.mediaType, 'GIF');

    // 2b. Photo attachment
    const parsedWithPhoto = parseCommentContent(
      'Check this photo [media:https://images.unsplash.com/photo-1514525253161?w=480]'
    );
    assert.strictEqual(parsedWithPhoto.text, 'Check this photo');
    assert.strictEqual(parsedWithPhoto.mediaUrl, 'https://images.unsplash.com/photo-1514525253161?w=480');
    assert.strictEqual(parsedWithPhoto.mediaType, 'IMAGE');

    // 2c. Standalone GIF URL with no extra text
    const parsedStandaloneGif = parseCommentContent(
      'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif'
    );
    assert.strictEqual(parsedStandaloneGif.text, '');
    assert.strictEqual(parsedStandaloneGif.mediaUrl, 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif');
    assert.strictEqual(parsedStandaloneGif.mediaType, 'GIF');

    // 2d. Plain text without media
    const parsedPlain = parseCommentContent('Just a normal text comment');
    assert.strictEqual(parsedPlain.text, 'Just a normal text comment');
    assert.strictEqual(parsedPlain.mediaUrl, undefined);
  });

  await suite.test('3. mapBackendComment properly populates Comment model with mediaUrl and mediaType', () => {
    const backendDto = {
      id: 'comm_backend_42',
      postId: 'post_100',
      userId: 'user_alex',
      content: 'Dancing all night! [media:https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif]',
      parentCommentId: undefined,
      createdAt: '2026-11-05T10:00:00Z',
      deleted: false,
    };

    const mapped = mapBackendComment(backendDto);
    assert.strictEqual(mapped.id, 'comm_backend_42');
    assert.strictEqual(mapped.text, 'Dancing all night!');
    assert.strictEqual(mapped.mediaUrl, 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif');
    assert.strictEqual(mapped.mediaType, 'GIF');
  });

  await suite.test('4. CommentSection.tsx includes Media, GIF, and Emoji action toolbar', () => {
    const commentSectionPath = path.join(projectRoot, 'frontend/src/app/feed/CommentSection.tsx');
    assert.ok(fs.existsSync(commentSectionPath), 'CommentSection.tsx must exist');

    const content = fs.readFileSync(commentSectionPath, 'utf8');

    assert.ok(content.includes('data-testid="comment-file-input"'), 'Must have file input for photos');
    assert.ok(content.includes('data-testid="comment-media-btn"'), 'Must have attach photo button');
    assert.ok(content.includes('data-testid="comment-gif-btn"'), 'Must have choose GIF button');
    assert.ok(content.includes('data-testid="comment-emoji-btn"'), 'Must have insert emoji button');
    assert.ok(content.includes('data-testid="comment-media-preview"'), 'Must render media preview');
    assert.ok(content.includes('GifPickerPopover'), 'Must integrate GifPickerPopover');
    assert.ok(content.includes('EmojiPickerPopover'), 'Must integrate EmojiPickerPopover');
    assert.ok(content.includes('deduplicateComments'), 'Must call deduplicateComments');
  });

  await suite.test('5. CommentTreeItem.tsx renders attached media and GIF badge', () => {
    const itemPath = path.join(projectRoot, 'frontend/src/app/feed/CommentTreeItem.tsx');
    assert.ok(fs.existsSync(itemPath), 'CommentTreeItem.tsx must exist');

    const content = fs.readFileSync(itemPath, 'utf8');

    assert.ok(content.includes('data-testid={`comment-media-${comment.id}`}'), 'Must render comment media container');
    assert.ok(content.includes('data-testid={`comment-gif-badge-${comment.id}`}'), 'Must render comment GIF badge');
    assert.ok(content.includes('comment.mediaUrl'), 'Must render comment.mediaUrl');
  });
});
