// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState } from 'react';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';

import type {
  Post,
  UserProfile,
  FeedFilter,
  SuggestedCreator,
} from '../../types/social.ts';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  SUGGESTED_CREATORS,
} from '../../mock/socialSeedData.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { PostComposer } from './PostComposer.tsx';
import { UserProfileView } from '../../components/profile/UserProfileView.tsx';
import { useAnalytics } from '../../context/useAnalytics.ts';
import { useFeedMutations } from './useFeedMutations.ts';
import { useFeedLoader, useFeedFilter } from './useFeedState.ts';
import { FeedPostList } from './FeedPostList.tsx';
import { FeedFilterPill } from './FeedFilterPill.tsx';
import { NewsFeedLeftSidebar } from './NewsFeedLeftSidebar.tsx';
import { NewsFeedRightSidebar } from './NewsFeedRightSidebar.tsx';

const NEWSFEED_CSS = `
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
`;

function filterPosts(posts: Post[], activeFilter: FeedFilter): Post[] {
  if (activeFilter.type === 'MEDIA') {
    return posts.filter(
      (p) => (p.mediaUrls && p.mediaUrls.length > 0) || p.type === 'IMAGE' || p.type === 'VIDEO'
    );
  }
  if (activeFilter.type === 'BOOKMARKS') {
    return posts.filter((p) => Boolean(p.isBookmarked));
  }
  if (activeFilter.type === 'HASHTAG' && activeFilter.value) {
    const targetTag = activeFilter.value.toLowerCase();
    return posts.filter((p) => p.hashtags.some((h) => h.toLowerCase() === targetTag));
  }
  return posts;
}

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
  const backendUserId = normalizeBackendUserId(user.id);

  useFeedLoader(backendUserId, setPosts);

  const { activeFilter, handleSelectShortcut, handleSelectHashtag, handleClearFilter } =
    useFeedFilter();

  const mutations = useFeedMutations({
    user,
    backendUserId,
    posts,
    setPosts,
    suggestedCreators,
    setSuggestedCreators,
    setUser,
    recordLikeToggle,
    recordFollowToggle,
    recordComment,
  });

  const handleOpenProfile = () => {
    setViewMode('profile');
    onOpenProfile?.();
  };

  if (viewMode === 'profile') {
    return (
      <UserProfileView
        user={user}
        posts={posts.filter((p) => p.author.id === user.id)}
        onBack={() => setViewMode('feed')}
        onUpdateBio={(newBio) => setUser((prev) => ({ ...prev, bio: newBio }))}
        onUpdateAvatar={(newAvatarUrl) => setUser((prev) => ({ ...prev, avatarUrl: newAvatarUrl }))}
        onUpdateBanner={(newBannerUrl) => setUser((prev) => ({ ...prev, coverBannerUrl: newBannerUrl }))}
        onToggleLike={mutations.handleToggleLike}
        onToggleFollow={mutations.handleToggleFollow}
        onAddComment={mutations.handleAddComment}
        onEditPost={mutations.handleEditPost}
        onDeletePost={mutations.handleDeletePost}
      />
    );
  }

  const filteredPosts = filterPosts(posts, activeFilter);
  const savedCount = posts.filter((p) => p.isBookmarked).length;

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <style>{NEWSFEED_CSS}</style>

          <div className="newsfeed-layout">
            <NewsFeedLeftSidebar
              user={user}
              activeFilterType={activeFilter.type}
              savedCount={savedCount}
              onOpenProfile={handleOpenProfile}
              onSelectShortcut={handleSelectShortcut}
              onNavigateAnalytics={onNavigateAnalytics}
            />

            <main style={{ width: '100%', maxWidth: 680, minWidth: 0 }}>
              <VStack gap={4}>
                <PostComposer
                  currentUser={user}
                  onCreatePost={mutations.handleCreatePost}
                />

                <FeedFilterPill
                  activeFilter={activeFilter}
                  postCount={filteredPosts.length}
                  onClearFilter={handleClearFilter}
                />

                <FeedPostList
                  posts={filteredPosts}
                  currentUser={user}
                  isBookmarksFilter={activeFilter.type === 'BOOKMARKS'}
                  hasActiveFilter={activeFilter.type !== 'ALL'}
                  onClearFilter={handleClearFilter}
                  onToggleLike={mutations.handleToggleLike}
                  onToggleFollow={mutations.handleToggleFollow}
                  onAddComment={mutations.handleAddComment}
                  onToggleBookmark={mutations.handleToggleBookmark}
                  onEditPost={mutations.handleEditPost}
                  onDeletePost={mutations.handleDeletePost}
                />
              </VStack>
            </main>

            <NewsFeedRightSidebar
              activeHashtag={activeFilter.type === 'HASHTAG' ? activeFilter.value : undefined}
              suggestedCreators={suggestedCreators}
              onSelectHashtag={handleSelectHashtag}
              onToggleFollow={mutations.handleToggleFollow}
            />
          </div>
        </LayoutContent>
      }
    />
  );
}

export default NewsFeedPage;
