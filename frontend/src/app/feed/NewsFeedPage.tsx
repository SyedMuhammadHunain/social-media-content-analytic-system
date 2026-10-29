// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState, useEffect } from 'react';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';

import type {
  Post,
  UserProfile,
  FeedFilter,
  SuggestedCreator,
  User,
} from '../../types/social.ts';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  SUGGESTED_CREATORS,
} from '../../mock/socialSeedData.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { PostComposer } from './PostComposer.tsx';
import { PostCreateModal } from './PostCreateModal.tsx';
import { UserProfileView } from '../../components/profile/UserProfileView.tsx';
import { useAnalytics } from '../../context/useAnalytics.ts';
import { useAuth } from '../../context/useAuth.ts';
import { useFeedMutations } from './useFeedMutations.ts';
import { useFeedLoader, useFeedFilter } from './useFeedState.ts';
import { FeedPostList } from './FeedPostList.tsx';
import { FeedFilterPill } from './FeedFilterPill.tsx';
import { FeedRefreshBanner } from './FeedRefreshBanner.tsx';
import { NewsFeedLeftSidebar } from './NewsFeedLeftSidebar.tsx';
import { NewsFeedRightSidebar } from './NewsFeedRightSidebar.tsx';
import { ProfileViewersModal } from '../../components/profile/ProfileViewersModal.tsx';
import {
  getProfileActivity,
  recordProfileView,
  type ProfileViewer,
} from '../../utils/profileActivityStore.ts';

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

@keyframes feedSkeletonFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes feedBannerSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes postCardFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card-animated {
  animation: postCardFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
`;

function normalizeTag(tag: string): string {
  return tag.replace(/^#/, '').toLowerCase();
}

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
    const targetTag = normalizeTag(activeFilter.value);
    return posts.filter((p) => p.hashtags.some((h) => normalizeTag(h) === targetTag));
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
  const { updateUser, demoUsers } = useAuth();
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [viewMode, setViewMode] = useState<'feed' | 'profile'>('feed');
  const [viewedUser, setViewedUser] = useState<UserProfile | User | null>(null);
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [profileActivity, setProfileActivity] = useState(() =>
    getProfileActivity(user.id, user.username, user.followingCount)
  );
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [suggestedCreators, setSuggestedCreators] = useState<SuggestedCreator[]>(SUGGESTED_CREATORS);
  const backendUserId = normalizeBackendUserId(user.id);

  useEffect(() => {
    const handleOpenCreatePost = () => {
      setIsNewPostModalOpen(true);
    };
    window.addEventListener('social:open-create-post', handleOpenCreatePost);
    return () => window.removeEventListener('social:open-create-post', handleOpenCreatePost);
  }, []);

  useEffect(() => {
    setUser(currentUser);
    setProfileActivity(getProfileActivity(currentUser.id, currentUser.username, currentUser.followingCount));
  }, [currentUser]);

  useEffect(() => {
    const handleActivitySync = () => {
      setProfileActivity(getProfileActivity(user.id, user.username, user.followingCount));
    };
    window.addEventListener('profile-activity-updated', handleActivitySync);
    return () => window.removeEventListener('profile-activity-updated', handleActivitySync);
  }, [user.id, user.username, user.followingCount]);

  useEffect(() => {
    if (demoUsers && demoUsers.length > 0) {
      const dynamicSuggestions: SuggestedCreator[] = demoUsers
        .filter((d) => d.id !== user.id && d.username.toLowerCase() !== user.username.toLowerCase())
        .map((d) => ({
          id: d.id,
          username: d.username,
          name: d.name,
          avatarUrl: d.avatarUrl || '',
          headline: d.headline || 'Active Creator',
          isFollowed: false,
        }));
      if (dynamicSuggestions.length > 0) {
        setSuggestedCreators((prev) => {
          const dynamicIds = new Set(dynamicSuggestions.map((s) => s.id));
          const existingPreserved = prev.filter((p) => !dynamicIds.has(p.id));
          return [...existingPreserved, ...dynamicSuggestions];
        });
      }
    }
  }, [demoUsers, user.id, user.username]);

  const { isLoading, isRefreshing, refreshFeed } = useFeedLoader(backendUserId, setPosts);

  const { activeFilter, handleSelectShortcut, handleSelectHashtag, handleClearFilter } =
    useFeedFilter();

  useEffect(() => {
    const handleRefreshEvent = () => {
      if (viewMode === 'profile') {
        setViewMode('feed');
        setViewedUser(null);
      }
      handleClearFilter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refreshFeed();
    };
    window.addEventListener('social:refresh-feed', handleRefreshEvent);
    return () => window.removeEventListener('social:refresh-feed', handleRefreshEvent);
  }, [viewMode, handleClearFilter, refreshFeed]);

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
    setViewedUser(user);
    setViewMode('profile');
    onOpenProfile?.();
  };

  const handleViewUserProfile = (targetUser: UserProfile | User | SuggestedCreator | ProfileViewer) => {
    const isOwn =
      targetUser.id === user.id ||
      targetUser.username.toLowerCase() === user.username.toLowerCase();

    if (isOwn) {
      handleOpenProfile();
      return;
    }

    const resolvedProfile: UserProfile = {
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      avatarUrl: targetUser.avatarUrl || '',
      coverBannerUrl: (targetUser as any).coverBannerUrl || '',
      isFollowed:
        (targetUser as any).isFollowed ??
        suggestedCreators.find((s) => s.id === targetUser.id)?.isFollowed ??
        false,
      headline: (targetUser as any).headline || 'Social Media Creator',
      tags: (targetUser as any).tags || ['Creator', 'Meta Astryx'],
      bio: (targetUser as any).bio || `Welcome to @${targetUser.username}'s profile.`,
      followerCount: (targetUser as any).followerCount ?? 128,
      followingCount: (targetUser as any).followingCount ?? 45,
    };

    setViewedUser(resolvedProfile);
    setViewMode('profile');

    // Dynamically record profile visit
    recordProfileView(
      {
        id: resolvedProfile.id,
        name: resolvedProfile.name,
        username: resolvedProfile.username,
        avatarUrl: resolvedProfile.avatarUrl,
        headline: resolvedProfile.headline,
      },
      user
    );
  };

  const handleModalCreatePost = async (postInput: any) => {
    await mutations.handleCreatePost(postInput);
    setIsNewPostModalOpen(false);
    if (viewMode === 'profile') {
      setViewMode('feed');
      setViewedUser(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (viewMode === 'profile') {
    const activeProfile: UserProfile = viewedUser
      ? {
          id: viewedUser.id,
          username: viewedUser.username,
          name: viewedUser.name,
          avatarUrl: viewedUser.avatarUrl || '',
          coverBannerUrl: (viewedUser as any).coverBannerUrl || '',
          isFollowed:
            (viewedUser as any).isFollowed ??
            suggestedCreators.find((s) => s.id === viewedUser.id)?.isFollowed ??
            false,
          headline: (viewedUser as any).headline || 'Social Media Creator',
          tags: (viewedUser as any).tags || ['Creator', 'Meta Astryx'],
          bio: (viewedUser as any).bio || `Welcome to @${viewedUser.username}'s profile.`,
          followerCount: (viewedUser as any).followerCount ?? 0,
          followingCount: (viewedUser as any).followingCount ?? 0,
        }
      : user;

    const isOwnProfile = activeProfile.id === user.id;

    return (
      <>
        <UserProfileView
          user={activeProfile}
          posts={posts.filter((p) => p.author.id === activeProfile.id || p.author.username === activeProfile.username)}
          isOwnProfile={isOwnProfile}
          onBack={() => {
            setViewMode('feed');
            setViewedUser(null);
          }}
          onUpdateBio={(newBio) => {
            if (isOwnProfile) {
              setUser((prev) => ({ ...prev, bio: newBio }));
              updateUser?.({ bio: newBio });
            }
          }}
          onUpdateAvatar={(newAvatarUrl) => {
            if (isOwnProfile) {
              setUser((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
              updateUser?.({ avatarUrl: newAvatarUrl });
            }
          }}
          onUpdateBanner={(newBannerUrl) => {
            if (isOwnProfile) {
              setUser((prev) => ({ ...prev, coverBannerUrl: newBannerUrl }));
              updateUser?.({ coverBannerUrl: newBannerUrl });
            }
          }}
          onToggleLike={mutations.handleToggleLike}
          onToggleFollow={(userId) => {
            mutations.handleToggleFollow(userId);
            if (viewedUser && viewedUser.id === userId) {
              setViewedUser((prev: any) =>
                prev ? { ...prev, isFollowed: !prev.isFollowed } : null
              );
            }
          }}
          onAddComment={mutations.handleAddComment}
          onEditPost={mutations.handleEditPost}
          onDeletePost={mutations.handleDeletePost}
        />

        <PostCreateModal
          isOpen={isNewPostModalOpen}
          onClose={() => setIsNewPostModalOpen(false)}
          currentUser={user}
          onCreatePost={handleModalCreatePost}
        />
      </>
    );
  }

  const filteredPosts = filterPosts(posts, activeFilter);
  const savedCount = posts.filter((p) => p.isBookmarked).length;

  return (
    <Layout
      height="auto"
      content={
        <LayoutContent padding={6}>
          <style>{NEWSFEED_CSS}</style>

          <div className="newsfeed-layout">
            <NewsFeedLeftSidebar
              user={user}
              activeFilterType={activeFilter.type}
              savedCount={savedCount}
              onOpenProfile={handleOpenProfile}
              onOpenProfileViews={() => setIsViewersModalOpen(true)}
              onSelectShortcut={handleSelectShortcut}
              onNavigateAnalytics={onNavigateAnalytics}
            />

            <main style={{ width: '100%', maxWidth: 680, minWidth: 0 }}>
              <VStack gap={4}>
                {isRefreshing && <FeedRefreshBanner />}

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
                  onViewUserProfile={handleViewUserProfile}
                  isLoading={isLoading}
                />
              </VStack>
            </main>

            <NewsFeedRightSidebar
              activeHashtag={activeFilter.type === 'HASHTAG' ? activeFilter.value : undefined}
              suggestedCreators={suggestedCreators}
              onSelectHashtag={handleSelectHashtag}
              onToggleFollow={mutations.handleToggleFollow}
              onViewProfile={handleViewUserProfile}
            />
          </div>

          <ProfileViewersModal
            isOpen={isViewersModalOpen}
            onClose={() => setIsViewersModalOpen(false)}
            viewers={profileActivity.viewers}
            totalViews={profileActivity.views}
            onViewProfile={handleViewUserProfile}
          />

          <PostCreateModal
            isOpen={isNewPostModalOpen}
            onClose={() => setIsNewPostModalOpen(false)}
            currentUser={user}
            onCreatePost={handleModalCreatePost}
          />
        </LayoutContent>
      }
    />
  );
}

export default NewsFeedPage;
