// Copyright (c) Meta Platforms, Inc. and affiliates.
// Test Suite: Notification Page Astryx Design System Adherence (refine_3_ui Task 8)
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const notificationSourcePath = path.resolve(__dirname, '../src/app/notifications/NotificationListPage.tsx');

test('Notification Page Astryx Design System Adherence Suite', async (suite) => {
  const source = fs.readFileSync(notificationSourcePath, 'utf8');

  await suite.test('1. No external icon libraries or Heroicons imported', () => {
    assert.strictEqual(
      source.includes('@heroicons/react'),
      false,
      'NotificationListPage must not import @heroicons/react'
    );
    assert.strictEqual(
      source.includes('lucide-react'),
      false,
      'NotificationListPage must not import lucide-react'
    );
  });

  await suite.test('2. UI components and icons imported strictly from @astryxdesign/core', () => {
    assert.ok(
      source.includes("from '@astryxdesign/core/Icon'"),
      'Must use Astryx Icon component'
    );
    assert.ok(
      source.includes("from '@astryxdesign/core/Card'"),
      'Must use Astryx Card component'
    );
    assert.ok(
      source.includes("from '@astryxdesign/core/Badge'"),
      'Must use Astryx Badge component'
    );
  });

  await suite.test('3. No blue, red, or green custom status colors or badges', () => {
    assert.strictEqual(
      source.includes('color="error"'),
      false,
      'Must not use error (red) icon colors'
    );
    assert.strictEqual(
      source.includes('color="success"'),
      false,
      'Must not use success (green) icon colors'
    );
    assert.strictEqual(
      source.includes('variant="blue"'),
      false,
      'Must not use blue badge variant'
    );
    assert.strictEqual(
      source.includes('#0171E3'),
      false,
      'Must not use hardcoded blue unread dot color'
    );
    assert.ok(
      source.includes('variant="neutral"'),
      'Must use neutral Astryx badge variant'
    );
  });
});
