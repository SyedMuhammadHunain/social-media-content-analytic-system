// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Astryx Landing Page & Gallery Hero Unit Test

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..');
const GALLERY_HERO_PATH = path.join(FRONTEND_DIR, 'src/app/gallery-hero/page.tsx');
const APP_PATH = path.join(FRONTEND_DIR, 'src/App.tsx');
const LOGIN_CARD_PATH = path.join(FRONTEND_DIR, 'src/app/login-card/page.tsx');
const LANDING_PUBLIC_DIR = path.join(FRONTEND_DIR, 'public/landing');

test('Astryx Landing Page & Gallery Hero Verification Suite', async (t) => {
  await t.test('1. gallery-hero/page.tsx strictly imports Meta Astryx components and zero third-party icons', () => {
    assert.ok(fs.existsSync(GALLERY_HERO_PATH), 'gallery-hero/page.tsx must exist');
    const content = fs.readFileSync(GALLERY_HERO_PATH, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'gallery-hero/page.tsx must not import @heroicons'
    );
    assert.ok(
      !content.includes('lucide-react'),
      'gallery-hero/page.tsx must not import lucide-react'
    );
    assert.ok(
      content.includes('@astryxdesign/core/Layout'),
      'gallery-hero/page.tsx must import Astryx Layout primitives'
    );
    assert.ok(
      content.includes('@astryxdesign/core/Grid'),
      'gallery-hero/page.tsx must import Astryx Grid'
    );
    assert.ok(
      content.includes('@astryxdesign/core/AspectRatio'),
      'gallery-hero/page.tsx must import Astryx AspectRatio'
    );
    assert.ok(
      content.includes('icon="chevronRight"'),
      'gallery-hero/page.tsx must use Astryx chevronRight icon for Get Started CTA'
    );
  });

  await t.test('2. 3 user photography assets are properly placed in public/landing and mapped in page.tsx', () => {
    const img1 = path.join(LANDING_PUBLIC_DIR, 'gallery-1.jpg');
    const img2 = path.join(LANDING_PUBLIC_DIR, 'gallery-2.jpg');
    const img3 = path.join(LANDING_PUBLIC_DIR, 'gallery-3.jpg');

    assert.ok(fs.existsSync(img1), 'public/landing/gallery-1.jpg must exist');
    assert.ok(fs.existsSync(img2), 'public/landing/gallery-2.jpg must exist');
    assert.ok(fs.existsSync(img3), 'public/landing/gallery-3.jpg must exist');

    const content = fs.readFileSync(GALLERY_HERO_PATH, 'utf8');
    assert.ok(content.includes('/landing/gallery-1.jpg'), 'gallery-1.jpg must be in IMAGES array');
    assert.ok(content.includes('/landing/gallery-2.jpg'), 'gallery-2.jpg must be in IMAGES array');
    assert.ok(content.includes('/landing/gallery-3.jpg'), 'gallery-3.jpg must be in IMAGES array');
  });

  await t.test('3. Copy and CTAs adhere to specification', () => {
    const content = fs.readFileSync(GALLERY_HERO_PATH, 'utf8');

    assert.ok(
      content.includes('Analyze Social Media at Scale'),
      'Heading must be "Analyze Social Media at Scale"'
    );
    assert.ok(
      content.includes('Instant creator metrics, post telemetry, and predictive audience analytics.'),
      'Subtitle must describe analytics value proposition'
    );
    assert.ok(
      content.includes('data-testid="landing-get-started-btn"'),
      'Get Started button must have test id'
    );
    assert.ok(
      content.includes('data-testid="landing-learn-more-btn"'),
      'Learn More button must have test id'
    );
  });

  await t.test('4. App.tsx default unauthenticated view is GalleryHeroLandingPage with Get Started routing', () => {
    const content = fs.readFileSync(APP_PATH, 'utf8');

    assert.ok(
      content.includes("lazy(() => import('./app/gallery-hero/page'))"),
      'App.tsx must lazy-load gallery-hero landing page'
    );
    assert.ok(
      content.includes("unauthView === 'landing'"),
      'App.tsx must check for unauthView === landing'
    );
    assert.ok(
      content.includes("onGetStarted={() => setUnauthView('login')}"),
      'App.tsx must transition to login on Get Started'
    );
  });

  await t.test('5. LoginCardPage does not contain onBack prop or Back to overview button', () => {
    const content = fs.readFileSync(LOGIN_CARD_PATH, 'utf8');

    assert.ok(
      !content.includes('onBack'),
      'LoginCardPage must not have onBack prop'
    );
    assert.ok(
      !content.includes('back-to-landing-btn'),
      'LoginCardPage must not have back-to-landing-btn'
    );
  });
});
