// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState } from 'react';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';

import type { CreatePostInput, Post, UserProfile } from '../../types/social';
import { CURRENT_USER, INITIAL_POSTS } from '../../mock/socialSeedData';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { UserProfileCard } from '../../components/profile/UserProfileCard';
import { UserProfileView } from '../../components/profile/UserProfileView';

interface NewsFeedPageProps {
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
}

export function NewsFeedPage({
  currentUser = CURRENT_USER,
  onOpenProfile,
}: NewsFeedPageProps) {
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [viewMode, setViewMode] = useState<'feed' | 'profile'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const handleCreatePost = (input: CreatePostInput) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      author: user,
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
      userId: user.id,
      author: user,
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

  const handleOpenProfile = () => {
    setViewMode('profile');
    onOpenProfile?.();
  };

  if (viewMode === 'profile') {
    return (
      <UserProfileView
        user={user}
        posts={posts.filter(p => p.author.id === user.id)}
        onBack={() => setViewMode('feed')}
        onUpdateBio={(newBio) => setUser(prev => ({ ...prev, bio: newBio }))}
        onToggleLike={handleToggleLike}
        onToggleFollow={handleToggleFollow}
        onAddComment={handleAddComment}
      />
    );
  }

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <div
            style={{
              maxWidth: 1060,
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            {/* Sticky Left Sidebar Profile Card */}
            <aside
              style={{
                flex: '0 0 280px',
                width: 280,
                maxWidth: '100%',
                position: 'sticky',
                top: 24,
                alignSelf: 'flex-start',
                zIndex: 10,
              }}
            >
              <UserProfileCard
                user={user}
                onOpenProfile={handleOpenProfile}
              />
            </aside>

            {/* Main Chronological News Feed */}
            <main style={{ flex: '1 1 640px', minWidth: 0, maxWidth: 680 }}>
              <VStack gap={6}>
                {/* Post Composer */}
                <PostComposer
                  currentUser={user}
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
            </main>
          </div>
        </LayoutContent>
      }
    />
  );
}

export default NewsFeedPage;
