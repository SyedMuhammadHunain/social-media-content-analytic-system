// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Shared Cross-Profile Posts Store

import type { Post } from '../types/social.ts';
import { INITIAL_POSTS } from '../mock/socialSeedData.ts';

const POSTS_STORAGE_KEY = 'smcas_shared_posts';

export function getSharedPosts(): Post[] {
  if (typeof localStorage === 'undefined') {
    return INITIAL_POSTS;
  }

  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: Post) => p.id));
        const missingSeeds = INITIAL_POSTS.filter((seed) => !existingIds.has(seed.id));
        return [...parsed, ...missingSeeds];
      }
    }
  } catch (err) {
    console.warn('Failed to parse shared posts from localStorage:', err);
  }

  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
  } catch {}

  return INITIAL_POSTS;
}

export function saveSharedPost(newPost: Post): Post[] {
  const current = getSharedPosts();
  const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)];

  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist shared post to localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('social:posts-updated', { detail: updated }));
  }

  return updated;
}

export function updateSharedPost(postId: string, updater: (post: Post) => Post): Post[] {
  const current = getSharedPosts();
  const updated = current.map((p) => (p.id === postId ? updater(p) : p));

  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist updated shared post to localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('social:posts-updated', { detail: updated }));
  }

  return updated;
}

export function deleteSharedPost(postId: string): Post[] {
  const current = getSharedPosts();
  const updated = current.filter((p) => p.id !== postId);

  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist deleted shared post to localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('social:posts-updated', { detail: updated }));
  }

  return updated;
}

export function syncSharedPosts(posts: Post[]): void {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('social:posts-updated', { detail: posts }));
  }
}
