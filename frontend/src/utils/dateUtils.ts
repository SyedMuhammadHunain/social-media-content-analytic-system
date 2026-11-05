// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Date & Timestamp Formatting Utilities

function formatRecentDifference(diffMs: number): string | null {
  if (diffMs < 45 * 1000) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return null;
}

function formatCalendarDate(date: Date, now: Date): string {
  const isSameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: isSameYear ? undefined : 'numeric',
  });
}

/**
 * Formats a raw timestamp (ISO 8601 string, relative time string, or Date) into
 * a clean, human-readable social media relative time (e.g. "Just now", "5m ago", "2h ago", "3d ago", "Oct 29").
 */
export function formatPostTimestamp(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';

  const trimmed = dateStr.trim();
  if (/^\d+[smhdw]\s*ago$/i.test(trimmed) || /just now/i.test(trimmed)) {
    return trimmed;
  }

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return trimmed;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const recent = formatRecentDifference(diffMs);
  if (recent) return recent;

  return formatCalendarDate(date, now);
}

/**
 * Returns a detailed localized tooltip title for the timestamp.
 */
export function getPostFullDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}
