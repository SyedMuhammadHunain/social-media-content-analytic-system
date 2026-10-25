// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Social Types

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO';

export interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowed: boolean;
}

export interface UserProfile extends User {
  headline: string;
  tags: string[];
  bio: string;
  followerCount: number;
  followingCount: number;
  coverBannerUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  type: PostType;
  text?: string;
  mediaUrls?: string[];
  description?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface CreatePostInput {
  type: PostType;
  text?: string;
  mediaUrl?: string;
  description?: string;
  hashtags: string[];
}
