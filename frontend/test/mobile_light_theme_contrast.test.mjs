// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Mobile Light Theme Contrast & Legibility Test Suite

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

test('Mobile Light Theme Contrast & Legibility Suite', async (suite) => {
  const newsFeedPath = path.join(frontendRoot, 'src', 'app', 'feed', 'NewsFeedPage.tsx');
  assert.ok(fs.existsSync(newsFeedPath), 'NewsFeedPage.tsx must exist');
  const newsFeedContent = fs.readFileSync(newsFeedPath, 'utf8');

  // Extract mobile media query block
  const mobileMediaMatch = newsFeedContent.match(/@media\s*\(max-width:\s*767px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mobileMediaMatch, 'Mobile media query (max-width: 767px) must be present in NewsFeedPage.tsx');
  const mobileBlock = mobileMediaMatch[1];

  await suite.test('1. Mobile CSS contains no hardcoded light colors for typography', () => {
    // #f1f5f9 and #ffffff wash out completely against white surfaces in light theme
    assert.strictEqual(
      mobileBlock.includes('#f1f5f9'),
      false,
      'Mobile CSS must not contain hardcoded #f1f5f9 for text color'
    );
    assert.strictEqual(
      mobileBlock.includes('#ffffff'),
      false,
      'Mobile CSS must not contain hardcoded #ffffff for text color'
    );
  });

  await suite.test('2. Post card body text and author headings bind to Astryx primary text token', () => {
    assert.ok(
      mobileBlock.includes('.post-card-content-text p'),
      'Mobile CSS must target .post-card-content-text p'
    );
    assert.ok(
      mobileBlock.includes('color: var(--color-text-primary, currentColor) !important;'),
      'Mobile CSS must set color to var(--color-text-primary, currentColor) !important for body and author text'
    );
    assert.ok(
      mobileBlock.includes('[data-testid^="post-author-"] span'),
      'Mobile CSS must target [data-testid^="post-author-"] span'
    );
  });

  await suite.test('3. Post card timestamps and supporting labels bind to Astryx secondary text token', () => {
    assert.ok(
      mobileBlock.includes('[data-testid^="post-card-"] time'),
      'Mobile CSS must target post-card time element'
    );
    assert.ok(
      mobileBlock.includes('color: var(--color-text-secondary, currentColor) !important;'),
      'Mobile CSS must set color to var(--color-text-secondary, currentColor) !important for timestamps'
    );
  });

  await suite.test('4. Mobile typography readability enhancements are preserved', () => {
    assert.ok(
      mobileBlock.includes('font-size: 15.5px !important;'),
      'Mobile CSS must maintain 15.5px font-size for mobile legibility'
    );
    assert.ok(
      mobileBlock.includes('line-height: 1.55 !important;'),
      'Mobile CSS must maintain 1.55 line-height'
    );
    assert.ok(
      mobileBlock.includes('word-break: break-word !important;'),
      'Mobile CSS must maintain word-break to prevent overflow on mobile'
    );
  });

  await suite.test('5. MobileNavigationDrawer avoids hardcoded white text fallbacks on non-primary surfaces', () => {
    const drawerPath = path.join(frontendRoot, 'src', 'app', 'feed', 'MobileNavigationDrawer.tsx');
    assert.ok(fs.existsSync(drawerPath), 'MobileNavigationDrawer.tsx must exist');
    const drawerContent = fs.readFileSync(drawerPath, 'utf8');

    // Verify fallbacks use currentColor or theme variables rather than #FFFFFF on text
    assert.strictEqual(
      drawerContent.includes("color: 'var(--color-text-primary, #FFFFFF)'"),
      false,
      'Drawer must not use #FFFFFF fallback for text-primary'
    );
    assert.strictEqual(
      drawerContent.includes("color: 'var(--color-text-secondary, #9CA3AF)'"),
      false,
      'Drawer must not use #9CA3AF fallback for text-secondary'
    );
    assert.ok(
      drawerContent.includes("var(--color-text-primary, currentColor)"),
      'Drawer user title must fallback to currentColor'
    );
    assert.ok(
      drawerContent.includes("var(--color-text-secondary, currentColor)"),
      'Drawer user handle must fallback to currentColor'
    );
  });
});
