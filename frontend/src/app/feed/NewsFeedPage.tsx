// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState } from 'react';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';

import type { CreatePostInput, UpdatePostInput, Post, UserProfile } from '../../types/social';
import { CURRENT_USER, INITIAL_POSTS } from '../../mock/socialSeedData';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { UserProfileCard } from '../../components/profile/UserProfileCard';
import { UserProfileView } from '../../components/profile/UserProfileView';
import { useAnalytics } from '../../context/useAnalytics';

interface NewsFeedPageProps {
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
}

export function NewsFeedPage({
  currentUser = CURRENT_USER,
  onOpenProfile,
}: NewsFeedPageProps) {
  const { recordLikeToggle, recordFollowToggle, recordComment } = useAnalytics();
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

  const handleEditPost = (postId: string, input: UpdatePostInput) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          text: input.text !== undefined ? input.text : p.text,
          description: input.description !== undefined ? input.description : p.description,
          mediaUrls: input.mediaUrls !== undefined ? input.mediaUrls : p.mediaUrls,
          hashtags: input.hashtags !== undefined ? input.hashtags : p.hashtags,
        };
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleToggleLike = (postId: string) => {
    let nextIsLiked = false;
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        nextIsLiked = isLiked;
        const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
        return { ...p, isLiked, likesCount };
      })
    );
    recordLikeToggle(nextIsLiked);
  };

  const handleToggleFollow = (userId: string) => {
    let nextIsFollowed = false;
    setPosts(prev =>
      prev.map(p => {
        if (p.author.id !== userId) return p;
        const isFollowed = !p.author.isFollowed;
        nextIsFollowed = isFollowed;
        return {
          ...p,
          author: { ...p.author, isFollowed },
        };
      })
    );
    recordFollowToggle(nextIsFollowed);
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
    recordComment();
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
        onUpdateAvatar={(newAvatarUrl) => setUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }))}
        onUpdateBanner={(newBannerUrl) => setUser(prev => ({ ...prev, coverBannerUrl: newBannerUrl }))}
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
          <style>{`
            .newsfeed-layout {
              max-width: 680px;
              width: 100%;
              margin: 0 auto;
              position: relative;
            }
            .newsfeed-fixed-sidebar {
              position: fixed;
              top: 88px;
              left: max(16px, calc(50vw - 648px));
              width: 280px;
              z-index: 20;
            }
            @media (max-width: 1024px) {
              .newsfeed-fixed-sidebar {
                position: static;
                width: 100%;
                margin-bottom: 24px;
              }
            }
          `}</style>

          <div className="newsfeed-layout">
            {/* Fixed Left Sidebar Profile Card */}
            <aside className="newsfeed-fixed-sidebar">
              <UserProfileCard
                user={user}
                onOpenProfile={handleOpenProfile}
              />
            </aside>

            {/* Main Chronological News Feed - Centered to Screen */}
            <main style={{ width: '100%', maxWidth: 680, minWidth: 0 }}>
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
                        currentUser={user}
                        onToggleLike={handleToggleLike}
                        onToggleFollow={handleToggleFollow}
                        onAddComment={handleAddComment}
                        onEditPost={handleEditPost}
                        onDeletePost={handleDeletePost}
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
