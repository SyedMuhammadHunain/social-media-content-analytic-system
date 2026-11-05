// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card Border Style Helper

export interface CardPositionFlags {
  hasTopComposer: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function resolveTopComposerRadius(isFirst: boolean, isLast: boolean): string {
  if (isLast) return '0 0 var(--radius-container, 12px) var(--radius-container, 12px)';
  if (isFirst) return '0';
  return '0';
}

function resolveStandardRadius(isFirst: boolean, isLast: boolean): string | undefined {
  if (isFirst && isLast) return undefined;
  if (isFirst) return 'var(--radius-container, 12px) var(--radius-container, 12px) 0 0';
  if (isLast) return '0 0 var(--radius-container, 12px) var(--radius-container, 12px)';
  return '0';
}

export function resolveCardBorderRadius(flags: CardPositionFlags): string | undefined {
  if (flags.hasTopComposer) {
    return resolveTopComposerRadius(flags.isFirst, flags.isLast);
  }
  return resolveStandardRadius(flags.isFirst, flags.isLast);
}
