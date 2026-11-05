// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Author Normalization Utilities

export interface ResolvedAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface KnownAuthorProfile {
  name: string;
  username: string;
  avatarUrl?: string;
}

interface AuthorKeys {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

const KNOWN_AUTHORS: Record<string, KnownAuthorProfile> = {
  usr_alex_01: {
    name: 'Alex Chen',
    username: 'alex_chen_ai',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  usr_alex_02: {
    name: 'Alex Rivera',
    username: 'alex_distrib',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  alex_chen_ai: {
    name: 'Alex Chen',
    username: 'alex_chen_ai',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  alex_distrib: {
    name: 'Alex Rivera',
    username: 'alex_distrib',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  usr_me_01: {
    name: 'Syed Muhammad Hunain',
    username: 'hunain_creator',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  user_hunain: {
    name: 'Syed Muhammad Hunain',
    username: 'hunain',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  user_alice: {
    name: 'Alice Walker',
    username: 'alice',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  user_bob: {
    name: 'Bob Creator',
    username: 'bob',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  user_charlie: {
    name: 'Charlie Dev',
    username: 'charlie',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
};

const RAW_ID_REGEX = /^(usr|user)_[a-zA-Z0-9_]+$/i;

function cleanString(val?: string): string {
  if (!val) return '';
  return val.trim();
}

function extractAuthorKeys(author: {
  id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}): AuthorKeys {
  return {
    id: cleanString(author.id),
    name: cleanString(author.name),
    username: cleanString(author.username).replace(/^@/, ''),
    avatarUrl: author.avatarUrl,
  };
}

function isAlex01(keys: AuthorKeys): boolean {
  if (keys.id === 'usr_alex_01') return true;
  if (keys.id.includes('alex_01')) return true;
  if (keys.name === 'usr_alex_01') return true;
  return keys.username === 'usr_alex_01';
}

function isRawId(val: string): boolean {
  if (!val) return true;
  return RAW_ID_REGEX.test(val);
}

function formatRawName(raw: string): string {
  if (!RAW_ID_REGEX.test(raw)) return raw;
  return raw
    .replace(/^(usr|user)_/i, '')
    .replace(/_\d+$/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatRawUsername(raw: string): string {
  const clean = raw.replace(/^@/, '');
  if (!RAW_ID_REGEX.test(clean)) return clean;
  return clean
    .replace(/^(usr|user)_/i, '')
    .replace(/_\d+$/, '');
}

function findKnownAuthor(keys: AuthorKeys): KnownAuthorProfile | undefined {
  if (KNOWN_AUTHORS[keys.id]) return KNOWN_AUTHORS[keys.id];
  if (KNOWN_AUTHORS[keys.name]) return KNOWN_AUTHORS[keys.name];
  return KNOWN_AUTHORS[keys.username];
}

function buildAlexProfile(keys: AuthorKeys): ResolvedAuthor {
  const defaultAlex = KNOWN_AUTHORS.usr_alex_01;
  const id = keys.id ? keys.id : 'usr_alex_01';
  const avatar = keys.avatarUrl ? keys.avatarUrl : (defaultAlex.avatarUrl ?? '');
  return {
    id,
    name: 'Alex Chen',
    username: 'alex_chen_ai',
    avatarUrl: avatar,
  };
}

function buildMatchedProfile(
  keys: AuthorKeys,
  matched: KnownAuthorProfile
): ResolvedAuthor {
  const name = isRawId(keys.name) ? matched.name : keys.name;
  const username = isRawId(keys.username) ? matched.username : keys.username;
  const avatar = keys.avatarUrl ?? matched.avatarUrl;
  const id = keys.id || 'creator';
  return { id, name, username, avatarUrl: avatar };
}

function resolveFallbackProfile(keys: AuthorKeys): ResolvedAuthor {
  const rawCandidate = keys.name || keys.username || keys.id || 'Anonymous Creator';
  const userCandidate = keys.username || keys.name || keys.id || 'creator';
  return {
    id: keys.id,
    name: formatRawName(rawCandidate),
    username: formatRawUsername(userCandidate),
    avatarUrl: keys.avatarUrl,
  };
}

/**
 * Normalizes author ID, name, and username to human-readable presentation values.
 * Resolves raw backend IDs (such as usr_alex_01) to proper names ("Alex Chen") and handles ("@alex_chen_ai").
 * Preserves all legitimate existing human-readable names without modifying them.
 */
export function resolveAuthorPresentation(author: {
  id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}): ResolvedAuthor {
  const keys = extractAuthorKeys(author);

  if (isAlex01(keys)) {
    return buildAlexProfile(keys);
  }

  const isLegitName = !isRawId(keys.name);
  const isLegitUser = !isRawId(keys.username);
  if (isLegitName && isLegitUser) {
    return {
      id: keys.id,
      name: keys.name,
      username: keys.username,
      avatarUrl: keys.avatarUrl,
    };
  }

  const matched = findKnownAuthor(keys);
  if (matched) {
    return buildMatchedProfile(keys, matched);
  }

  return resolveFallbackProfile(keys);
}
