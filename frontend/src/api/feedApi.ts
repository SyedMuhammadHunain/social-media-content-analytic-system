// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Newsfeed Reader API

import { api } from './client.ts';
import type { Post, PostType, User } from '../types/social.ts';
import type { BackendPost } from './postsApi.ts';
import { resolveAuthorPresentation } from '../utils/authorUtils.ts';

export interface BackendFeedPostDto {
  postId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | string;
  hashtags?: string[];
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
  createdAt?: string;
}

export interface FeedResponse {
  userId: string;
  page: number;
  size: number;
  posts: BackendFeedPostDto[];
}

function formatHashtags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map((t) => (t.startsWith('#') ? t : `#${t}`));
}

export function mapBackendPostToUi(dto: BackendFeedPostDto): Post {
  const initialAuthor = {
    id: dto.authorId,
    username: dto.authorName
      ? dto.authorName.toLowerCase().replace(/\s+/g, '_')
      : dto.authorId.replace(/^user_/, ''),
    name: dto.authorName || dto.authorId.replace(/^user_/, ''),
    avatarUrl: dto.authorAvatar,
  };
  const resolved = resolveAuthorPresentation(initialAuthor);

  return {
    id: dto.postId,
    userId: dto.authorId,
    author: {
      id: dto.authorId,
      username: resolved.username,
      name: resolved.name,
      avatarUrl:
        resolved.avatarUrl ||
        dto.authorAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
    },
    type: (dto.mediaType as PostType) || 'TEXT',
    text: dto.text,
    description: dto.text,
    mediaUrls: dto.mediaUrl ? [dto.mediaUrl] : undefined,
    hashtags: formatHashtags(dto.hashtags),
    likesCount: dto.likeCount ?? 0,
    commentsCount: dto.commentCount ?? 0,
    isLiked: !!dto.likedByCurrentUser,
    comments: [],
    createdAt: dto.createdAt ? new Date(dto.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function mapBackendModelPostToUi(backendPost: BackendPost, authorUser?: User): Post {
  const initialAuthor = authorUser || {
    id: backendPost.userId,
    username: backendPost.userId.replace(/^user_/, ''),
    name: backendPost.userId,
  };
  const resolved = resolveAuthorPresentation(initialAuthor);

  return {
    id: backendPost.id,
    userId: backendPost.userId,
    author: {
      id: backendPost.userId,
      username: resolved.username,
      name: resolved.name,
      avatarUrl:
        resolved.avatarUrl ||
        (authorUser && authorUser.avatarUrl) ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isFollowed: authorUser ? !!authorUser.isFollowed : false,
    },
    type: (backendPost.mediaType as PostType) || 'TEXT',
    text: backendPost.text,
    description: backendPost.text,
    mediaUrls: backendPost.mediaUrl ? [backendPost.mediaUrl] : undefined,
    hashtags: formatHashtags(backendPost.hashtags),
    likesCount: backendPost.likeCount ?? 0,
    commentsCount: backendPost.commentCount ?? 0,
    isLiked: false,
    comments: [],
    createdAt: backendPost.createdAt ? new Date(backendPost.createdAt).toISOString() : new Date().toISOString(),
  };
}

export const feedApi = {
  getFeedForUser(userId: string, page = 0, size = 20): Promise<FeedResponse> {
    const encodedId = encodeURIComponent(userId);
    return api.get<FeedResponse>(`/v1/feeds/${encodedId}?page=${page}&size=${size}`);
  },

  async getFeedPostsUi(userId: string, page = 0, size = 20): Promise<Post[]> {
    const feed = await this.getFeedForUser(userId, page, size);
    return (feed.posts || []).map(mapBackendPostToUi);
  },
};
