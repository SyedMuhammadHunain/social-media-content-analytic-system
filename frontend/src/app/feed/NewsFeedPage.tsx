// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - News Feed Page (PDF Section 4.1.vi)

'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
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
  SUGGESTED_CREATORS,
} from '../../mock/socialSeedData.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';
import { PostComposer } from './PostComposer.tsx';
import { PostCreateModal } from './PostCreateModal.tsx';
import { UserProfileView } from '../../components/profile/UserProfileView.tsx';
import { NotificationListPage } from '../notifications/NotificationListPage.tsx';
import { useAnalytics } from '../../context/useAnalytics.ts';
import { useAuth } from '../../context/useAuth.ts';
import { useFeedMutations } from './useFeedMutations.ts';
import { useFeedLoader, useFeedFilter } from './useFeedState.ts';
import { FeedPostList } from './FeedPostList.tsx';
import { FeedFilterPill } from './FeedFilterPill.tsx';
import { FeedRefreshBanner } from './FeedRefreshBanner.tsx';
import { NewsFeedLeftSidebar } from './NewsFeedLeftSidebar.tsx';
import { NewsFeedRightSidebar } from './NewsFeedRightSidebar.tsx';
import { MobileAppHeader } from './MobileAppHeader.tsx';
import { MobileBottomNav, type MobileNavItem } from './MobileBottomNav.tsx';
import { MobileNavigationDrawer } from './MobileNavigationDrawer.tsx';
import { SidebarSearchBox } from './SidebarSearchBox.tsx';
import { useNotificationPolling } from '../../components/nav/useNotificationPolling.ts';
import { ProfileViewersModal } from '../../components/profile/ProfileViewersModal.tsx';
import {
  getProfileActivity,
  recordProfileView,
  type ProfileViewer,
} from '../../utils/profileActivityStore.ts';
import { getSharedPosts } from '../../utils/sharedPostsStore.ts';
import { buildUserPool, type SearchableUser } from '../../utils/userSearchIndex.ts';

const DashboardPage = lazy(() => import('../dashboard/page.tsx'));

const NEWSFEED_CSS = `
.newsfeed-layout {
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  position: relative;
}
.newsfeed-center-scroll {
  width: 100%;
  max-width: 680px;
  min-width: 0;
  height: calc(100vh - 48px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}
.newsfeed-center-scroll::-webkit-scrollbar {
  display: none;
}
.newsfeed-fixed-sidebar {
  position: fixed;
  top: 24px;
  left: max(16px, calc(50vw - 648px));
  width: 280px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  scrollbar-width: none;
}
.newsfeed-fixed-sidebar::-webkit-scrollbar {
  display: none;
}
.newsfeed-right-sidebar {
  position: fixed;
  top: 24px;
  right: max(16px, calc(50vw - 688px));
  width: 320px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 48px);
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
@media (min-width: 768px) and (max-width: 1024px) {
  .newsfeed-fixed-sidebar {
    position: static;
    width: 100%;
    margin-bottom: 24px;
  }
}
@media (max-width: 767px) {
  /* 1. Hide desktop sidebars */
  .newsfeed-fixed-sidebar,
  .newsfeed-right-sidebar {
    display: none !important;
  }

  /* 2. Full width covering the whole device without side margins */
  .newsfeed-page-wrapper {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .newsfeed-layout {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .newsfeed-center-scroll {
    max-width: 100% !important;
    width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin: 0 !important;
    height: auto !important;
    min-height: calc(100vh - 56px) !important;
    padding-bottom: 84px !important;
  }

  /* 3. Edge-to-edge full width cards & optimal mobile padding */
  .post-card-root {
    content-visibility: auto;
    contain-intrinsic-size: 0 380px;
  }
  .post-card-root,
  .post-card-animated,
  .post-card-item,
  [data-testid^="post-card-"],
  [data-testid="post-composer-prompt-bar"] {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .post-card-surface,
  .post-composer-surface,
  [data-testid^="post-card-"] > div,
  [data-testid="post-composer-prompt-bar"] > div {
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    padding: 16px 16px !important;
    box-sizing: border-box !important;
    width: 100% !important;
  }

  /* 4. Improve Readability, Visibility & Font-Size on Android / Mobile */
  .post-card-content-text p,
  .post-card-content-text span,
  [data-testid^="post-card-"] [data-astryx-text="body"] {
    font-size: 15.5px !important;
    line-height: 1.55 !important;
    color: #f1f5f9 !important;
    letter-spacing: -0.01em !important;
    word-break: break-word !important;
  }

  [data-testid^="post-author-"] span {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #ffffff !important;
  }

  [data-testid^="post-card-"] time,
  [data-testid^="post-card-"] [data-astryx-text="supporting"] {
    font-size: 13px !important;
    color: #94a3b8 !important;
  }

  /* 5. Mobile / Android: Icon-only post actions with 44px tap targets */
  .post-card-action-bar {
    width: 100% !important;
    padding-top: 6px !important;
  }
  .post-card-action-bar button > span:first-child > span:nth-child(2) {
    display: none !important;
  }
  .post-card-action-bar button {
    padding-left: 12px !important;
    padding-right: 12px !important;
    min-width: 44px !important;
    min-height: 40px !important;
    justify-content: center !important;
  }

  /* Media images & videos fill full width with rounded inner corners */
  [data-testid^="post-card-"] img,
  [data-testid^="post-card-"] video {
    max-height: 380px !important;
    border-radius: 8px !important;
  }
}
@media (min-width: 768px) {
  .mobile-app-header,
  .mobile-search-dropdown,
  .mobile-bottom-nav {
    display: none !important;
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

export type AppTab = 'feed' | 'dashboard' | 'notifications' | 'profile';

interface NewsFeedPageProps {
  currentUser?: UserProfile;
  initialTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  onOpenProfile?: () => void;
  onNavigateAnalytics?: () => void;
}

export function NewsFeedPage({
  currentUser = CURRENT_USER,
  initialTab = 'feed',
  onSelectTab,
  onOpenProfile,
  onNavigateAnalytics,
}: NewsFeedPageProps) {
  const { recordLikeToggle, recordFollowToggle, recordComment } = useAnalytics();
  const { updateUser, demoUsers } = useAuth();
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [viewedUser, setViewedUser] = useState<UserProfile | User | null>(null);
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { unreadCount } = useNotificationPolling(user, demoUsers);
  const centerScrollRef = useRef<HTMLElement>(null);
  const [profileActivity, setProfileActivity] = useState(() =>
    getProfileActivity(user.id, user.username, user.followingCount)
  );
  const [posts, setPosts] = useState<Post[]>(() => getSharedPosts());
  const [suggestedCreators, setSuggestedCreators] = useState<SuggestedCreator[]>(SUGGESTED_CREATORS);
  const backendUserId = normalizeBackendUserId(user.id);

  const changeTab = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    onSelectTab?.(tab);
    centerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onSelectTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AppTab>;
      if (customEvent?.detail) {
        changeTab(customEvent.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('social:navigate-tab', handleNavEvent as EventListener);
    return () => window.removeEventListener('social:navigate-tab', handleNavEvent as EventListener);
  }, [changeTab]);

  useEffect(() => {
    const handlePostsSync = (e?: Event) => {
      const customEvent = e as CustomEvent<Post[]>;
      if (customEvent?.detail && Array.isArray(customEvent.detail)) {
        setPosts(customEvent.detail);
      } else {
        setPosts(getSharedPosts());
      }
    };
    window.addEventListener('social:posts-updated', handlePostsSync);
    window.addEventListener('storage', handlePostsSync);
    return () => {
      window.removeEventListener('social:posts-updated', handlePostsSync);
      window.removeEventListener('storage', handlePostsSync);
    };
  }, []);

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
    setPosts(getSharedPosts());
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
      changeTab('feed');
      setViewedUser(null);
      handleClearFilter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refreshFeed();
    };
    window.addEventListener('social:refresh-feed', handleRefreshEvent);
    return () => window.removeEventListener('social:refresh-feed', handleRefreshEvent);
  }, [changeTab, handleClearFilter, refreshFeed]);

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
    setViewedUser(null);
    changeTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onOpenProfile?.();
  };

  const handleSelectFeedShortcut = (type: any) => {
    changeTab('feed');
    handleSelectShortcut(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHashtagFilter = (tag: string) => {
    changeTab('feed');
    handleSelectHashtag(tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewUserProfile = (targetUser: UserProfile | User | SuggestedCreator | ProfileViewer | SearchableUser) => {
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
    changeTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    changeTab('feed');
    setViewedUser(null);
    centerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isViewingOwn =
    !viewedUser ||
    viewedUser.id === user.id ||
    (Boolean(viewedUser.username) &&
      Boolean(user.username) &&
      viewedUser.username.toLowerCase() === user.username.toLowerCase());

  const activeProfile: UserProfile = isViewingOwn
    ? user
    : {
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
      };

  const isOwnProfile = isViewingOwn;
  const filteredPosts = filterPosts(posts, activeFilter);
  const savedCount = posts.filter((p) => p.isBookmarked).length;
  const searchableUsers = useMemo(
    () => buildUserPool(demoUsers, suggestedCreators, posts, user),
    [demoUsers, suggestedCreators, posts, user]
  );

  const activeMobileNav: MobileNavItem | 'feed' = useMemo(() => {
    if (activeTab === 'dashboard') return 'analytics';
    if (activeTab === 'notifications') return 'notifications';
    if (activeTab === 'profile') return 'profile';
    if (activeTab === 'feed' && activeFilter.type === 'BOOKMARKS') return 'saved';
    return 'feed';
  }, [activeTab, activeFilter.type]);

  return (
    <Layout
      height="auto"
      content={
        <div className="newsfeed-page-wrapper">
          <style>{NEWSFEED_CSS}</style>

          <MobileAppHeader
            onOpenSearch={() => setIsMobileSearchOpen((prev) => !prev)}
            onOpenDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
            onClickLogo={() => {
              changeTab('feed');
              handleSelectFeedShortcut('ALL');
              setViewedUser(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {isMobileSearchOpen && (
            <div
              className="mobile-search-dropdown"
              data-testid="mobile-search-dropdown"
              style={{
                maxWidth: 680,
                margin: '8px auto 16px auto',
                padding: '0 12px',
              }}
            >
              <SidebarSearchBox
                users={searchableUsers}
                currentUserId={user.id}
                onSelectUser={(selectedUser) => {
                  handleViewUserProfile(selectedUser);
                  setIsMobileSearchOpen(false);
                }}
              />
            </div>
          )}

          <LayoutContent padding={6}>
            <div className="newsfeed-layout">
            <NewsFeedLeftSidebar
              user={user}
              activeFilterType={activeTab === 'feed' ? activeFilter.type : ('' as any)}
              savedCount={savedCount}
              onOpenProfile={handleOpenProfile}
              onOpenProfileViews={() => setIsViewersModalOpen(true)}
              onSelectShortcut={handleSelectFeedShortcut}
              onNavigateAnalytics={() => {
                changeTab('dashboard');
                onNavigateAnalytics?.();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateNotifications={() => {
                changeTab('notifications');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <main
              ref={centerScrollRef}
              className="newsfeed-center-scroll"
              data-testid="newsfeed-center-container"
              style={{ width: '100%', maxWidth: 680, minWidth: 0 }}
            >
              {activeTab === 'feed' && (
                <VStack gap={4}>
                  {isRefreshing && <FeedRefreshBanner />}

                  {activeFilter.type !== 'ALL' && activeFilter.type !== 'BOOKMARKS' && (
                    <FeedFilterPill
                      activeFilter={activeFilter}
                      postCount={filteredPosts.length}
                      onClearFilter={handleClearFilter}
                    />
                  )}

                  <VStack gap={0} style={{ width: '100%' }}>
                    {activeFilter.type !== 'BOOKMARKS' && (
                      <PostComposer
                        currentUser={user}
                        onOpenModal={() => setIsNewPostModalOpen(true)}
                        onCreatePost={mutations.handleCreatePost}
                      />
                    )}

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
                      hasTopComposer={activeFilter.type !== 'BOOKMARKS'}
                    />
                  </VStack>
                </VStack>
              )}

              {activeTab === 'dashboard' && (
                <Suspense fallback={null}>
                  <DashboardPage />
                </Suspense>
              )}

              {activeTab === 'notifications' && (
                <NotificationListPage />
              )}

              {activeTab === 'profile' && (
                <UserProfileView
                  user={activeProfile}
                  posts={posts.filter((p) =>
                    p.author.id === activeProfile.id ||
                    p.userId === activeProfile.id ||
                    (p.author.username && activeProfile.username && p.author.username.toLowerCase() === activeProfile.username.toLowerCase()) ||
                    (p.author.name && activeProfile.name && p.author.name.toLowerCase() === activeProfile.name.toLowerCase()) ||
                    normalizeBackendUserId(p.userId) === normalizeBackendUserId(activeProfile.id) ||
                    normalizeBackendUserId(p.author.id) === normalizeBackendUserId(activeProfile.id)
                  )}
                  isOwnProfile={isOwnProfile}
                  onBack={() => {
                    changeTab('feed');
                    setViewedUser(null);
                  }}
                  onUpdateBio={(newBio) => {
                    if (isOwnProfile) {
                      setUser((prev) => ({ ...prev, bio: newBio }));
                      setViewedUser((prev: any) => (prev ? { ...prev, bio: newBio } : null));
                      updateUser?.({ bio: newBio });
                    }
                  }}
                  onUpdateAvatar={(newAvatarUrl) => {
                    if (isOwnProfile) {
                      setUser((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
                      setViewedUser((prev: any) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
                      updateUser?.({ avatarUrl: newAvatarUrl });
                    }
                  }}
                  onUpdateBanner={(newBannerUrl) => {
                    if (isOwnProfile) {
                      setUser((prev) => ({ ...prev, coverBannerUrl: newBannerUrl }));
                      setViewedUser((prev: any) => (prev ? { ...prev, coverBannerUrl: newBannerUrl } : null));
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
              )}
            </main>

            <NewsFeedRightSidebar
              activeHashtag={activeTab === 'feed' && activeFilter.type === 'HASHTAG' ? activeFilter.value : undefined}
              suggestedCreators={suggestedCreators}
              searchableUsers={searchableUsers}
              currentUserId={user.id}
              onSelectHashtag={handleSelectHashtagFilter}
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

          <MobileBottomNav
            activeItem={activeMobileNav}
            unreadCount={unreadCount}
            onSelectSaved={() => {
              if (activeTab === 'feed' && activeFilter.type === 'BOOKMARKS') {
                handleSelectFeedShortcut('ALL');
              } else {
                changeTab('feed');
                handleSelectFeedShortcut('SAVED');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectAnalytics={() => {
              if (activeTab === 'dashboard') {
                changeTab('feed');
              } else {
                changeTab('dashboard');
                onNavigateAnalytics?.();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCreate={() => {
              setIsNewPostModalOpen(true);
            }}
            onSelectNotifications={() => {
              if (activeTab === 'notifications') {
                changeTab('feed');
              } else {
                changeTab('notifications');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProfile={() => {
              if (activeTab === 'profile') {
                changeTab('feed');
              } else {
                handleOpenProfile();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          <MobileNavigationDrawer
            isOpen={isMobileDrawerOpen}
            user={user}
            onClose={() => setIsMobileDrawerOpen(false)}
            onNavigateProfile={() => {
              handleOpenProfile();
              setIsMobileDrawerOpen(false);
            }}
          />
        </div>
      }
    />
  );
}

export default NewsFeedPage;
