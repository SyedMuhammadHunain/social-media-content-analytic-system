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
  parentCommentId?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  type: PostType;
  text?: string;
  mediaUrls?: string[];
  mediaId?: string;
  description?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  formattedCount: string;
  category?: string;
}

export interface SuggestedCreator extends User {
  headline: string;
  tags?: string[];
  mutualFollowersCount?: number;
}

export type FeedFilterType = 'ALL' | 'MEDIA' | 'BOOKMARKS' | 'HASHTAG';

export interface FeedFilter {
  type: FeedFilterType;
  value?: string;
  label: string;
}

export interface CreatePostInput {
  type: PostType;
  text?: string;
  mediaUrl?: string;
  mediaId?: string;
  description?: string;
  hashtags: string[];
}

export interface UpdatePostInput {
  text?: string;
  description?: string;
  mediaUrls?: string[];
  hashtags?: string[];
}

