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

function hasValidIdentity(user?: Partial<SearchableUser> | null): user is SearchableUser {
  if (!user) return false;
  if (!user.id) return false;
  if (!user.name) return false;
  return Boolean(user.username);
}

function appendUser(map: Map<string, SearchableUser>, user?: Partial<SearchableUser> | null) {
  if (!hasValidIdentity(user)) return;
  if (!map.has(user.id)) {
    map.set(user.id, {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      headline: user.headline,
    });
  }
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

  appendUser(userMap, currentUser);
  demoUsers.forEach(du => appendUser(userMap, du));
  suggestedCreators.forEach(sc => appendUser(userMap, sc));
  posts.forEach(p => appendUser(userMap, p.author));

  return Array.from(userMap.values());
}

function isUserMatch(user: SearchableUser, queryLower: string, excludeId?: string): boolean {
  if (user.id === excludeId) return false;
  if (user.name.toLowerCase().includes(queryLower)) return true;
  return user.username.toLowerCase().includes(queryLower);
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
    const isMatch = isUserMatch(user, q, excludeId);
    if (!isMatch) continue;

    matched.push(user);
    if (matched.length >= limit) return matched;
  }

  return matched;
}
