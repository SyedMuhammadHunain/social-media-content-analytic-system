// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Header, Author Normalization & Logo Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveAuthorPresentation } from '../src/utils/authorUtils.ts';
import { formatPostTimestamp, getPostFullDate } from '../src/utils/dateUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

test('Post Header Presentation & Branding Assets Suite', async (suite) => {
  await suite.test('1. resolveAuthorPresentation correctly maps usr_alex_01 to Alex Chen', () => {
    const resolved = resolveAuthorPresentation({
      id: 'usr_alex_01',
      name: 'usr_alex_01',
      username: 'usr_alex_01',
    });

    assert.strictEqual(resolved.name, 'Alex Chen', 'Displays human-readable name Alex Chen instead of usr_alex_01');
    assert.strictEqual(resolved.username, 'alex_chen_ai', 'Displays clean handle alex_chen_ai');
    assert.ok(resolved.avatarUrl, 'Provides fallback avatar URL');
  });

  await suite.test('2. resolveAuthorPresentation gracefully formats generic raw IDs', () => {
    const raw = resolveAuthorPresentation({
      id: 'usr_sophia_miller_09',
      name: 'usr_sophia_miller_09',
      username: 'usr_sophia_miller_09',
    });

    assert.strictEqual(raw.name, 'Sophia Miller', 'Cleans usr_ prefix, numbers, and capitalizes words');
    assert.strictEqual(raw.username, 'sophia_miller', 'Cleans handle prefix and trailing digits');
  });

  await suite.test('3. formatPostTimestamp converts ISO strings to social media relative times', () => {
    const isoString = '2026-10-29T20:41:55.636Z';
    const formatted = formatPostTimestamp(isoString);

    assert.notStrictEqual(formatted, isoString, 'Must not return raw ISO string');
    assert.ok(
      /^\d+[smhd]\s*ago$/i.test(formatted) || /^[A-Z][a-z]{2}\s+\d+/i.test(formatted) || formatted === 'Just now',
      `Expected relative or calendar timestamp format, got: ${formatted}`
    );

    const fullTitle = getPostFullDate(isoString);
    assert.ok(fullTitle.includes('2026') || fullTitle.includes('October') || fullTitle.includes('Oct'), 'Tooltip title contains localized full date');
  });

  await suite.test('4. formatPostTimestamp preserves already-relative strings and handles nulls', () => {
    assert.strictEqual(formatPostTimestamp('5m ago'), '5m ago');
    assert.strictEqual(formatPostTimestamp('Just now'), 'Just now');
    assert.strictEqual(formatPostTimestamp('2h ago'), '2h ago');
    assert.strictEqual(formatPostTimestamp(null), 'Just now');
    assert.strictEqual(formatPostTimestamp(undefined), 'Just now');
  });

  await suite.test('5. Branding logo images.png is properly placed in public directory', () => {
    const imagesPngPath = path.join(publicDir, 'images.png');
    assert.ok(fs.existsSync(imagesPngPath), 'images.png exists in public directory');
    const stats = fs.statSync(imagesPngPath);
    assert.ok(stats.size > 0, 'images.png is a valid non-empty file');

    const logoPngPath = path.join(publicDir, 'logo.png');
    assert.ok(fs.existsSync(logoPngPath), 'logo.png exists in public directory');
    const logoStats = fs.statSync(logoPngPath);
    assert.strictEqual(logoStats.size, stats.size, 'logo.png is synchronized with images.png');
  });
});
