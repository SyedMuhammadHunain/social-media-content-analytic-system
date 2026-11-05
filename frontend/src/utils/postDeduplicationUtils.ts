// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Deduplication & Reconciliation Utility

import type { Post } from '../types/social.ts';

export function isOptimisticPostId(id: string): boolean {
  return id.startsWith('post_17') || id.startsWith('post_18') || id.startsWith('post_temp') || id.startsWith('temp_');
}

export function buildPostFingerprint(post: Post): string {
  const authorId = post.author?.id || post.userId || '';
  const textSnippet = (post.text || '').trim();
  const media = post.mediaUrls?.[0] || '';
  return `${authorId}:${textSnippet}:${media}`;
}

export function deduplicatePosts(posts: Post[]): Post[] {
  const seenIds = new Set<string>();
  const fpToIndex = new Map<string, number>();
  const result: Post[] = [];

  for (const p of posts) {
    if (!p || !p.id || seenIds.has(p.id)) continue;

    const authorId = p.author?.id || p.userId || '';
    const fp = authorId ? buildPostFingerprint(p) : '';
    const existingIdx = fp ? fpToIndex.get(fp) : undefined;

    if (existingIdx !== undefined) {
      const existing = result[existingIdx];
      // Reconcile optimistic placeholder with persistent backend post
      if (isOptimisticPostId(existing.id) && !isOptimisticPostId(p.id)) {
        seenIds.delete(existing.id);
        seenIds.add(p.id);
        result[existingIdx] = {
          ...p,
          isBookmarked: existing.isBookmarked || p.isBookmarked,
          isLiked: existing.isLiked || p.isLiked,
        };
        continue;
      }
      if (!isOptimisticPostId(existing.id) && isOptimisticPostId(p.id)) {
        // Real backend post already present; drop optimistic copy
        continue;
      }
      if (isOptimisticPostId(existing.id) && isOptimisticPostId(p.id)) {
        // Duplicate optimistic post attempts; drop second
        continue;
      }
    }

    seenIds.add(p.id);
    if (fp) fpToIndex.set(fp, result.length);
    result.push(p);
  }

  return result;
}
