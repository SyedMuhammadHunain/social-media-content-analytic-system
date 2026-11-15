# Changelog

All notable changes to the Social Media Content Analysis System (SMCAS) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Mobile Light Theme Font Visibility (Android / Mobile Screens ≤ 767px):**
  - Replaced hardcoded off-white `#f1f5f9 !important` and `#ffffff !important` text colors in mobile CSS with dynamic Meta Astryx design tokens (`var(--color-text-primary, currentColor) !important` for body/author text and `var(--color-text-secondary, currentColor) !important` for timestamps).
  - Resolved white-on-white text washout on post cards in light theme, elevating contrast ratio to **21.00:1** (passing WCAG AAA standards).
  - Hardened mobile drawer (`MobileNavigationDrawer.tsx`) fallbacks to use `currentColor` and `transparent` to preserve contrast in light mode.

### Added
- **Automated Regression & Contrast Test Suite:**
  - Added `frontend/test/mobile_light_theme_contrast.test.mjs` verifying removal of hardcoded light colors and binding to Astryx CSS variables (6/6 tests passing).
- **Chrome DevTools Protocol (CDP) Browser Verification:**
  - Added `frontend/scripts/run-devtools-light-theme-contrast.mjs` to orchestrate headless Chrome under Pixel 7 Android emulation, measure computed runtime styles, and generate verification screenshots.
  - Added `frontend/scripts/run-performance-audit.mjs` measuring TTFB (1ms), FCP (956ms), CLS (0.00), and JS heap memory (7.6MB).
- **Documentation & Reports:**
  - Added `docs/intent/intent-mobile-light-theme-contrast.md`.
  - Added `docs/reports/mobile_light_theme_devtools_report.md` with visual artifacts.
  - Added `docs/reports/code-review-mobile-light-theme-contrast.md`.
  - Added `docs/reports/security-audit-mobile-light-theme-contrast.md`.
  - Added `docs/reports/performance-audit-report.md`.
