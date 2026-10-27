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

export function mapBackendComment(dto: BackendComment, currentUser?: UserProfile): Comment {
  const isSelf = currentUser && dto.userId === currentUser.id;
  const username = dto.userId.replace(/^user_/, '');
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
    text: dto.content,
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
