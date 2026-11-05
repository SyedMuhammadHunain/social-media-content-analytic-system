// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - User Search & Index Utilities

import type { UserProfile, SuggestedCreator, Post } from '../types/social.ts';
import type { DemoUserSummary } from '../context/auth-context-def.ts';

export interface SearchableUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  headline?: string;
}

/**
 * Builds a deduplicated user pool from all available sources.
 * Precedence: demoUsers > suggestedCreators > post authors > current user.
 */
export function buildUserPool(
  demoUsers: DemoUserSummary[] = [],
  suggestedCreators: SuggestedCreator[] = [],
  posts: Post[] = [],
  currentUser?: UserProfile | null
): SearchableUser[] {
  const userMap = new Map<string, SearchableUser>();

  const addUser = (user: SearchableUser) => {
    if (!user || !user.id) return;
    if (!userMap.has(user.id)) {
      userMap.set(user.id, user);
    }
  };

  // 1. Current user
  if (currentUser) {
    addUser({
      id: currentUser.id,
      name: currentUser.name,
      username: currentUser.username,
      avatarUrl: currentUser.avatarUrl,
      headline: currentUser.headline,
    });
  }

  // 2. Demo users (accounts from auth state)
  for (const du of demoUsers) {
    addUser({
      id: du.id,
      name: du.name,
      username: du.username,
      avatarUrl: du.avatarUrl,
      headline: du.headline,
    });
  }

  // 3. Suggested creators
  for (const sc of suggestedCreators) {
    addUser({
      id: sc.id,
      name: sc.name,
      username: sc.username,
      avatarUrl: sc.avatarUrl,
      headline: sc.headline,
    });
  }

  // 4. Authors of posts
  for (const p of posts) {
    if (p.author) {
      addUser({
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
      });
    }
  }

  return Array.from(userMap.values());
}

/**
 * Matches users against query using case-insensitive substring on name and username.
 * Excludes the user matching excludeId. Returns up to limit (default 8).
 */
export function matchUsers(
  query: string,
  users: SearchableUser[],
  excludeId?: string,
  limit: number = 8
): SearchableUser[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matched: SearchableUser[] = [];
  for (const user of users) {
    if (excludeId && user.id === excludeId) continue;

    const matchName = user.name?.toLowerCase().includes(q);
    const matchUsername = user.username?.toLowerCase().includes(q);

    if (matchName || matchUsername) {
      matched.push(user);
      if (matched.length >= limit) {
        break;
      }
    }
  }

  return matched;
}
