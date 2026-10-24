// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState } from 'react';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';

import type { CreatePostInput, Post, User } from '../../types/social';
import { CURRENT_USER, INITIAL_POSTS } from '../../mock/socialSeedData';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';

interface NewsFeedPageProps {
  currentUser?: User;
}

export function NewsFeedPage({ currentUser = CURRENT_USER }: NewsFeedPageProps) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const handleCreatePost = (input: CreatePostInput) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      author: currentUser,
      type: input.type,
      text: input.text,
      description: input.description,
      mediaUrls: input.mediaUrl ? [input.mediaUrl] : undefined,
      hashtags: input.hashtags,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
      createdAt: 'Just now',
    };

    // Prepend new post to the top (newest first - Req 4.1.vi)
    setPosts(prev => [newPost, ...prev]);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
        return { ...p, isLiked, likesCount };
      })
    );
  };

  const handleToggleFollow = (userId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.author.id !== userId) return p;
        const isFollowed = !p.author.isFollowed;
        return {
          ...p,
          author: { ...p.author, isFollowed },
        };
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      postId,
      userId: currentUser.id,
      author: currentUser,
      text,
      createdAt: 'Just now',
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...p.comments],
        };
      })
    );
  };

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <div style={{ maxWidth: 740, margin: '0 auto', width: '100%' }}>
            <VStack gap={6}>
              {/* Post Composer */}
              <PostComposer
                currentUser={currentUser}
                onCreatePost={handleCreatePost}
              />

              {/* Chronological Feed */}
              <VStack gap={4}>
                {posts.length === 0 ? (
                  <Card padding={6}>
                    <VStack gap={2} hAlign="center">
                      <Heading level={3}>No Posts Yet</Heading>
                      <Text type="body" color="secondary">
                        Be the first to publish content to the chronological feed.
                      </Text>
                    </VStack>
                  </Card>
                ) : (
                  posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onToggleLike={handleToggleLike}
                      onToggleFollow={handleToggleFollow}
                      onAddComment={handleAddComment}
                    />
                  ))
                )}
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
export default NewsFeedPage;
