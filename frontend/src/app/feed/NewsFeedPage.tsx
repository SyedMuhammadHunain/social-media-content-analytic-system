// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState, useEffect } from 'react';
import { Layout, LayoutContent, VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';

import type {
  CreatePostInput,
  UpdatePostInput,
  Post,
  UserProfile,
  FeedFilter,
  FeedFilterType,
  SuggestedCreator,
} from '../../types/social.ts';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  TRENDING_TOPICS,
  SUGGESTED_CREATORS,
} from '../../mock/socialSeedData.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { PostComposer } from './PostComposer.tsx';
import { PostCard } from './PostCard.tsx';
import { FeedShortcutsCard } from './FeedShortcutsCard.tsx';
import { TrendingTopicsCard } from './TrendingTopicsCard.tsx';
import { WhoToFollowCard } from './WhoToFollowCard.tsx';
import { PlatformInfoFooter } from './PlatformInfoFooter.tsx';
import { UserProfileCard } from '../../components/profile/UserProfileCard.tsx';
import { UserProfileView } from '../../components/profile/UserProfileView.tsx';
import { useAnalytics } from '../../context/useAnalytics.ts';
import { feedApi } from '../../api/feedApi.ts';
import { postsApi } from '../../api/postsApi.ts';
import { socialApi } from '../../api/socialApi.ts';

interface NewsFeedPageProps {
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
  onNavigateAnalytics?: () => void;
}

export function NewsFeedPage({
  currentUser = CURRENT_USER,
  onOpenProfile,
  onNavigateAnalytics,
}: NewsFeedPageProps) {
  const { recordLikeToggle, recordFollowToggle, recordComment } = useAnalytics();
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [viewMode, setViewMode] = useState<'feed' | 'profile'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [suggestedCreators, setSuggestedCreators] = useState<SuggestedCreator[]>(SUGGESTED_CREATORS);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>({
    type: 'ALL',
    label: 'All Posts',
  });
  const backendUserId = normalizeBackendUserId(user.id);

  // Load live newsfeed from API Gateway on user switch or mount
  useEffect(() => {
    let isMounted = true;

    feedApi
      .getFeedPostsUi(backendUserId, 0, 20)
      .then((feedPosts) => {
        if (!isMounted || !feedPosts || feedPosts.length === 0) return;
        setPosts(feedPosts);
      })
      .catch(() => {
        // Gateway offline: retain INITIAL_POSTS fallback
      });

    return () => {
      isMounted = false;
    };
  }, [backendUserId]);

  const handleCreatePost = async (input: CreatePostInput) => {
    const tempId = `post_${Date.now()}`;

    const newPost: Post = {
      id: tempId,
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
      isBookmarked: false,
      comments: [],
      createdAt: 'Just now',
    };

    // Prepend new post to the top (newest first - Req 4.1.vi)
    setPosts((prev) => [newPost, ...prev]);

    try {
      const created = await postsApi.createPost({
        userId: backendUserId,
        text: input.text,
        mediaUrl: input.mediaUrl,
        mediaType: input.type,
        hashtags: input.hashtags,
      });

      if (created && created.id) {
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: created.id } : p))
        );
      }
    } catch {
      // Offline fallback: keep optimistic post
    }
  };

  const handleEditPost = async (postId: string, input: UpdatePostInput) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          text: input.text ?? p.text,
          description: input.description ?? p.description,
          mediaUrls: input.mediaUrls ?? p.mediaUrls,
          hashtags: input.hashtags ?? p.hashtags,
        };
      })
    );

    try {
      await postsApi.updatePost(postId, {
        userId: backendUserId,
        text: input.text,
        hashtags: input.hashtags,
      });
    } catch {
      // Offline fallback
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await postsApi.deletePost(postId, backendUserId);
    } catch {
      // Offline fallback
    }
  };

  const handleToggleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const nextIsLiked = !post.isLiked;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likesCount = nextIsLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
        return { ...p, isLiked: nextIsLiked, likesCount };
      })
    );
    recordLikeToggle(nextIsLiked);

    try {
      const res = nextIsLiked
        ? await socialApi.likePost(backendUserId, postId)
        : await socialApi.unlikePost(backendUserId, postId);

      if (res && typeof res.totalLikes === 'number') {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likesCount: res.totalLikes } : p))
        );
      }
    } catch {
      // Offline fallback: retain optimistic state
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const creator = suggestedCreators.find((c) => c.id === userId);
    const post = posts.find((p) => p.author.id === userId);
    const nextIsFollowed = creator ? !creator.isFollowed : post ? !post.author.isFollowed : true;

    // 1. Toggle in suggested creators list
    setSuggestedCreators((prev) =>
      prev.map((c) => (c.id === userId ? { ...c, isFollowed: nextIsFollowed } : c))
    );

    // 2. Toggle author state across all feed posts
    setPosts((prev) =>
      prev.map((p) =>
        p.author.id === userId ? { ...p, author: { ...p.author, isFollowed: nextIsFollowed } } : p
      )
    );

    // 3. Update current user following counter
    setUser((prev) => ({
      ...prev,
      followingCount: nextIsFollowed ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
    }));

    recordFollowToggle(nextIsFollowed);

    try {
      if (nextIsFollowed) {
        await socialApi.followUser(backendUserId, userId);
      } else {
        await socialApi.unfollowUser(backendUserId, userId);
      }
    } catch {
      // Offline fallback
    }
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const handleAddComment = async (postId: string, text: string) => {
    const tempCommentId = `c_${Date.now()}`;

    const newComment = {
      id: tempCommentId,
      postId,
      userId: user.id,
      author: user,
      text,
      createdAt: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...p.comments],
        };
      })
    );
    recordComment();

    try {
      const saved = await socialApi.addComment({
        userId: backendUserId,
        postId,
        content: text,
      });

      if (saved && saved.id) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) => (c.id === tempCommentId ? { ...c, id: saved.id } : c)),
            };
          })
        );
      }
    } catch {
      // Offline fallback
    }
  };

  const SHORTCUT_LABELS: Record<FeedFilterType, string> = {
    ALL: 'All Posts',
    MEDIA: 'Media Only',
    BOOKMARKS: 'Saved Posts',
    HASHTAG: 'Filtered Posts',
  };

  const handleSelectShortcut = (type: FeedFilterType) => {
    setActiveFilter({ type, label: SHORTCUT_LABELS[type] });
  };

  const handleSelectHashtag = (tag: string) => {
    setActiveFilter({
      type: 'HASHTAG',
      value: tag,
      label: `Filtered by ${tag}`,
    });
  };

  const handleClearFilter = () => {
    handleSelectShortcut('ALL');
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
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    );
  }

  // Filter posts based on active filter selection
  const filteredPosts = posts.filter(post => {
    if (activeFilter.type === 'MEDIA') {
      return (post.mediaUrls && post.mediaUrls.length > 0) || post.type === 'IMAGE' || post.type === 'VIDEO';
    }
    if (activeFilter.type === 'BOOKMARKS') {
      return Boolean(post.isBookmarked);
    }
    if (activeFilter.type === 'HASHTAG' && activeFilter.value) {
      return post.hashtags.some(
        h => h.toLowerCase() === activeFilter.value?.toLowerCase()
      );
    }
    return true;
  });

  const savedCount = posts.filter(p => p.isBookmarked).length;

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
              display: flex;
              flex-direction: column;
              gap: 16px;
              max-height: calc(100vh - 104px);
              overflow-y: auto;
              scrollbar-width: none;
            }
            .newsfeed-fixed-sidebar::-webkit-scrollbar {
              display: none;
            }
            .newsfeed-right-sidebar {
              position: fixed;
              top: 88px;
              right: max(16px, calc(50vw - 688px));
              width: 320px;
              z-index: 20;
              display: flex;
              flex-direction: column;
              gap: 16px;
              max-height: calc(100vh - 104px);
              overflow-y: auto;
              scrollbar-width: none;
            }
            .newsfeed-right-sidebar::-webkit-scrollbar {
              display: none;
            }
            @media (max-width: 1279px) {
              .newsfeed-right-sidebar {
                display: none !important;
              }
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
            {/* Fixed Left Sidebar: UserProfileCard + FeedShortcutsCard */}
            <aside className="newsfeed-fixed-sidebar" data-testid="newsfeed-left-rail">
              <UserProfileCard
                user={user}
                onOpenProfile={handleOpenProfile}
              />
              <FeedShortcutsCard
                activeFilterType={activeFilter.type}
                savedCount={savedCount}
                followerCount={user.followerCount}
                onSelectShortcut={handleSelectShortcut}
                onNavigateAnalytics={onNavigateAnalytics}
              />
            </aside>

            {/* Main Chronological News Feed - Centered to Screen */}
            <main style={{ width: '100%', maxWidth: 680, minWidth: 0 }}>
              <VStack gap={4}>
                {/* Post Composer */}
                <PostComposer
                  currentUser={user}
                  onCreatePost={handleCreatePost}
                />

                {/* Active Filter Indicator Pill (when filter is active) */}
                {activeFilter.type !== 'ALL' && (
                  <Card padding={3}>
                    <HStack justify="between" vAlign="center">
                      <HStack gap={2} vAlign="center">
                        <Badge variant="neutral" label={activeFilter.label} />
                        <Text type="supporting" color="secondary">
                          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                        </Text>
                      </HStack>
                      <Button
                        data-testid="clear-filter-btn"
                        size="sm"
                        variant="ghost"
                        label="Clear Filter"
                        onClick={handleClearFilter}
                      />
                    </HStack>
                  </Card>
                )}

                {/* Chronological Feed */}
                <VStack gap={4}>
                  {filteredPosts.length === 0 ? (
                    <Card padding={6}>
                      <EmptyState
                        headingLevel={3}
                        title="No Posts Found"
                        description={
                          activeFilter.type === 'BOOKMARKS'
                            ? 'You have not saved any posts yet. Click the bookmark icon on any post to save it here.'
                            : 'No posts match the active filter criteria.'
                        }
                        actions={
                          activeFilter.type !== 'ALL' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              label="Reset to All Posts"
                              onClick={handleClearFilter}
                            />
                          ) : undefined
                        }
                      />
                    </Card>
                  ) : (
                    filteredPosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onToggleLike={handleToggleLike}
                        onToggleFollow={handleToggleFollow}
                        onAddComment={handleAddComment}
                        onToggleBookmark={handleToggleBookmark}
                        onEditPost={handleEditPost}
                        onDeletePost={handleDeletePost}
                      />
                    ))
                  )}
                </VStack>
              </VStack>
            </main>

            {/* Fixed Right Sidebar: TrendingTopicsCard + WhoToFollowCard + PlatformInfoFooter */}
            <aside className="newsfeed-right-sidebar" data-testid="newsfeed-right-rail">
              <TrendingTopicsCard
                topics={TRENDING_TOPICS}
                activeHashtag={activeFilter.type === 'HASHTAG' ? activeFilter.value : undefined}
                onSelectHashtag={handleSelectHashtag}
              />
              <WhoToFollowCard
                creators={suggestedCreators}
                onToggleFollow={handleToggleFollow}
              />
              <PlatformInfoFooter />
            </aside>
          </div>
        </LayoutContent>
      }
    />
  );
}

export default NewsFeedPage;
