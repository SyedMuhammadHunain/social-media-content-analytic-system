// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Comments Mapping & Fetch Utility

import { socialApi, type BackendComment } from '../../api/socialApi.ts';
import type { Comment, UserProfile } from '../../types/social.ts';

export function shouldFetchRemoteComments(
  nextShow: boolean,
  localCount: number,
  totalCount: number,
  remoteCount: number
): boolean {
  if (!nextShow) return false;
  if (localCount > 0) return false;
  if (remoteCount > 0) return false;
  return totalCount > 0;
}

export function isGifUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.gif') || lower.includes('giphy.com') || lower.includes('tenor.com');
}

export function deduplicateComments(comments: Comment[]): Comment[] {
  const seenIds = new Set<string>();
  const fpToIndex = new Map<string, number>();
  const result: Comment[] = [];

  for (const c of comments) {
    if (!c || !c.id || seenIds.has(c.id)) continue;

    // Content fingerprint: authorId + parentCommentId + trimmed text + mediaUrl
    const authorId = c.author?.id || c.userId || '';
    const fp = `${authorId}:${c.parentCommentId || 'root'}:${c.text?.trim() || ''}:${c.mediaUrl || ''}`;
    const existingIdx = fpToIndex.get(fp);

    if (existingIdx !== undefined) {
      // If we already recorded an optimistic placeholder and now receive the saved backend comment, upgrade it
      if (result[existingIdx].id.startsWith('c_') && !c.id.startsWith('c_')) {
        seenIds.delete(result[existingIdx].id);
        seenIds.add(c.id);
        result[existingIdx] = c;
      }
      continue;
    }

    seenIds.add(c.id);
    fpToIndex.set(fp, result.length);
    result.push(c);
  }

  return result;
}

export function parseCommentContent(content?: string): {
  text: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'GIF' | 'VIDEO';
} {
  if (!content) return { text: '' };

  const mediaRegex = /\[media:(https?:\/\/[^\]]+)\]/;
  const match = content.match(mediaRegex);
  if (match) {
    const url = match[1];
    return {
      text: content.replace(mediaRegex, '').trim(),
      mediaUrl: url,
      mediaType: isGifUrl(url) ? 'GIF' : 'IMAGE',
    };
  }

  // Check if content is a direct GIF / image URL
  const trimmed = content.trim();
  if (/^https?:\/\/\S+\.(gif|jpe?g|png|webp)(\?\S*)?$/i.test(trimmed) || trimmed.includes('media.giphy.com/media/')) {
    return {
      text: '',
      mediaUrl: trimmed,
      mediaType: isGifUrl(trimmed) ? 'GIF' : 'IMAGE',
    };
  }

  return { text: content };
}

export function mapBackendComment(dto: BackendComment, currentUser?: UserProfile): Comment {
  const isSelf = currentUser && dto.userId === currentUser.id;
  const username = dto.userId.replace(/^user_/, '');
  const { text, mediaUrl, mediaType } = parseCommentContent(dto.content);

  return {
    id: dto.id,
    postId: dto.postId,
    userId: dto.userId,
    author: {
      id: dto.userId,
      username,
      name: isSelf ? currentUser.name : username,
      avatarUrl: isSelf ? currentUser.avatarUrl : undefined,
      isFollowed: false,
    },
    text,
    mediaUrl,
    mediaType,
    parentCommentId: dto.parentCommentId,
    createdAt: new Date(dto.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function fetchRemoteCommentsForPost(
  postId: string,
  currentUser?: UserProfile
): Promise<Comment[]> {
  try {
    const list = await socialApi.getComments(postId);
    if (!list?.length) return [];
    return list.map((dto) => mapBackendComment(dto, currentUser));
  } catch {
    return [];
  }
}
