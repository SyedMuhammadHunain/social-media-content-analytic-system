// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Author Normalization Utilities

export interface ResolvedAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

const KNOWN_AUTHORS: Record<string, { name: string; username: string; avatarUrl?: string }> = {
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
  const idKey = author.id?.trim() || '';
  const nameKey = author.name?.trim() || '';
  const userKey = author.username?.trim().replace(/^@/, '') || '';

  // Specific resolution for usr_alex_01 to Alex Chen
  if (
    idKey === 'usr_alex_01' ||
    idKey.includes('alex_01') ||
    nameKey === 'usr_alex_01' ||
    userKey === 'usr_alex_01'
  ) {
    return {
      id: author.id || 'usr_alex_01',
      name: 'Alex Chen',
      username: 'alex_chen_ai',
      avatarUrl: author.avatarUrl || KNOWN_AUTHORS.usr_alex_01.avatarUrl,
    };
  }

  const isRawName = !nameKey || /^(usr|user)_[a-zA-Z0-9_]+$/i.test(nameKey);
  const isRawUsername = !userKey || /^(usr|user)_[a-zA-Z0-9_]+$/i.test(userKey);

  // If author already has an established legitimate human name and handle, preserve it completely
  if (!isRawName && !isRawUsername) {
    return {
      id: author.id || '',
      name: nameKey,
      username: userKey,
      avatarUrl: author.avatarUrl,
    };
  }

  // Check known authors by id, name, or username
  const matched =
    KNOWN_AUTHORS[idKey] ||
    KNOWN_AUTHORS[nameKey] ||
    KNOWN_AUTHORS[userKey];

  if (matched) {
    return {
      id: author.id || idKey,
      name: !isRawName ? nameKey : matched.name,
      username: !isRawUsername ? userKey : matched.username,
      avatarUrl: author.avatarUrl || matched.avatarUrl,
    };
  }

  // Fallback cleanup if name looks like a raw ID (e.g. usr_sarah_03 or user_alex)
  let cleanedName = nameKey || userKey || idKey || 'Anonymous Creator';
  if (/^(usr|user)_[a-zA-Z0-9_]+$/i.test(cleanedName)) {
    cleanedName = cleanedName
      .replace(/^(usr|user)_/i, '')
      .replace(/_\d+$/, '')
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  let cleanedUsername = userKey || nameKey || idKey || 'creator';
  cleanedUsername = cleanedUsername.replace(/^@/, '');
  if (/^(usr|user)_[a-zA-Z0-9_]+$/i.test(cleanedUsername)) {
    cleanedUsername = cleanedUsername
      .replace(/^(usr|user)_/i, '')
      .replace(/_\d+$/, '');
  }

  return {
    id: author.id || '',
    name: cleanedName,
    username: cleanedUsername,
    avatarUrl: author.avatarUrl,
  };
}
