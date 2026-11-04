// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Dashboard Page Astryx & Cleanliness Unit Test

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DASHBOARD_DIR = path.resolve(__dirname, '../src/app/dashboard');

test('Dashboard Page Meta Astryx & Cleanliness Verification (Task 10)', async (t) => {
  await t.test('1. DashboardEngagementChart does not contain "Current Engagement Index: 0.0%" and uses Astryx stop icon', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardEngagementChart.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('Current Engagement Index'),
      'Current Engagement Index text must be removed from DashboardEngagementChart'
    );
    assert.ok(
      !content.includes('@heroicons'),
      'DashboardEngagementChart must not import any @heroicons'
    );
    assert.ok(
      content.includes('icon="stop"'),
      'DashboardEngagementChart must use Astryx stop icon'
    );
  });

  await t.test('2. DashboardSentimentBarChart uses Meta Astryx icons and concise description', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardSentimentBarChart.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'DashboardSentimentBarChart must not import any @heroicons'
    );
    assert.ok(
      content.includes('icon="check"'),
      'DashboardSentimentBarChart must use Astryx check icon'
    );
    assert.ok(
      content.includes('icon="stop"'),
      'DashboardSentimentBarChart must use Astryx stop icon'
    );
    assert.ok(
      content.includes('Audience approval versus dissent over time'),
      'DashboardSentimentBarChart must use concise description'
    );
  });

  await t.test('3. DashboardFollowerTrendChart uses Meta Astryx icons and concise description', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardFollowerTrendChart.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'DashboardFollowerTrendChart must not import any @heroicons'
    );
    assert.ok(
      content.includes('icon="arrowUp"'),
      'DashboardFollowerTrendChart must use Astryx arrowUp icon'
    );
    assert.ok(
      content.includes('icon="stop"'),
      'DashboardFollowerTrendChart must use Astryx stop icon'
    );
    assert.ok(
      content.includes('Audience growth velocity across intervals'),
      'DashboardFollowerTrendChart must use concise description'
    );
  });

  await t.test('4. DashboardAnalyticsInterpretation uses strictly Meta Astryx icons and tokens', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardAnalyticsInterpretation.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'DashboardAnalyticsInterpretation must not import any @heroicons'
    );
    assert.ok(
      content.includes('@astryxdesign/core/Icon'),
      'DashboardAnalyticsInterpretation must import Astryx Icon'
    );
  });

  await t.test('5. DashboardKpiCards uses strictly Meta Astryx icons', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardKpiCards.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'DashboardKpiCards must not import any @heroicons'
    );
    assert.ok(
      content.includes('icon="arrowUp"'),
      'DashboardKpiCards must use Astryx arrowUp icon'
    );
    assert.ok(
      content.includes('icon="arrowDown"'),
      'DashboardKpiCards must use Astryx arrowDown icon'
    );
  });

  await t.test('6. DashboardHeader does not contain 24H, 7D, 30D, Refresh button, or @heroicons (Task 11)', () => {
    const filePath = path.join(DASHBOARD_DIR, 'DashboardHeader.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(
      !content.includes('@heroicons'),
      'DashboardHeader must not import any @heroicons'
    );
    assert.ok(
      !content.includes('refresh-metrics-btn'),
      'DashboardHeader must not contain refresh metrics button'
    );
    assert.ok(
      !content.includes('24h') && !content.includes('30d'),
      'DashboardHeader must not contain 24h or 30d range controls'
    );
  });
});
