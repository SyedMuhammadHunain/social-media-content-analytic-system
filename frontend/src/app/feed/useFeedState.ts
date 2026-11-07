// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Loader & Filter Hooks

'use client';

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, FeedFilter, FeedFilterType } from '../../types/social.ts';
import { feedApi } from '../../api/feedApi.ts';
import { syncSharedPosts } from '../../utils/sharedPostsStore.ts';
import { deduplicatePosts } from '../../utils/postDeduplicationUtils.ts';

const SHORTCUT_LABELS: Record<FeedFilterType, string> = {
  ALL: 'All Posts',
  MEDIA: 'Media Only',
  BOOKMARKS: 'Saved Posts',
  HASHTAG: 'Filtered Posts',
  MESSAGES: 'Messages',
};

function hasFeedItems(posts: unknown): posts is Post[] {
  return Array.isArray(posts) && posts.length > 0;
}

function isRecentPost(createdAt: string): boolean {
  if (createdAt === 'Just now') return true;
  if (createdAt.includes('now')) return true;
  return createdAt.includes('sec');
}

function parsePostDate(post: Post): number {
  if (!post.createdAt) return 0;
  if (isRecentPost(post.createdAt)) {
    return Date.now() + 10000;
  }
  const parsed = Date.parse(post.createdAt);
  return isNaN(parsed) ? Date.now() - 100000 : parsed;
}

function mergeFeedPosts(livePosts: Post[], prevPosts: Post[]): Post[] {
  const prevMap = new Map(prevPosts.map((p) => [p.id, p]));
  const liveIds = new Set(livePosts.map((p) => p.id));
  const retainedMock = prevPosts.filter((p) => !liveIds.has(p.id));
  const hydratedLive = livePosts.map((live) => {
    const prev = prevMap.get(live.id);
    return {
      ...live,
      isBookmarked: prev?.isBookmarked ?? live.isBookmarked ?? false,
    };
  });
  const combined = [...retainedMock, ...hydratedLive];
  const deduplicated = deduplicatePosts(combined);
  return deduplicated.sort((a, b) => parsePostDate(b) - parsePostDate(a));
}

export interface UseFeedLoaderResult {
  isLoading: boolean;
  isRefreshing: boolean;
  refreshFeed: () => Promise<void>;
}

async function fetchFeedBatch(backendUserId: string, isInteractive: boolean): Promise<Post[]> {
  const [feedPosts] = await Promise.all([
    feedApi.getFeedPostsUi(backendUserId, 0, 30),
    isInteractive ? new Promise((resolve) => setTimeout(resolve, 350)) : Promise.resolve(),
  ]);
  return feedPosts;
}

export function useFeedLoader(
  backendUserId: string,
  setPosts: Dispatch<SetStateAction<Post[]>>
): UseFeedLoaderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFeed = useCallback(
    async (mode: 'initial' | 'refresh' | 'background' = 'initial') => {
      if (mode === 'refresh') setIsRefreshing(true);
      if (mode === 'initial') setIsLoading(true);

      try {
        const feedPosts = await fetchFeedBatch(backendUserId, mode !== 'background');
        if (hasFeedItems(feedPosts)) {
          setPosts((prev) => {
            const merged = mergeFeedPosts(feedPosts, prev);
            syncSharedPosts(merged);
            return merged;
          });
        }
      } catch {
        // Gateway offline: retain fallback
      } finally {
        if (mode === 'initial') setIsLoading(false);
        if (mode === 'refresh') setIsRefreshing(false);
      }
    },
    [backendUserId, setPosts]
  );

  useEffect(() => {
    loadFeed('initial');
  }, [loadFeed]);

  useEffect(() => {
    const handleSync = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadFeed('background');
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);
    const interval = setInterval(handleSync, 6000);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
      clearInterval(interval);
    };
  }, [loadFeed]);

  const refreshFeed = async () => {
    await loadFeed('refresh');
  };

  return { isLoading, isRefreshing, refreshFeed };
}

export function useFeedFilter() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>({
    type: 'ALL',
    label: 'All Posts',
  });

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

  return {
    activeFilter,
    handleSelectShortcut,
    handleSelectHashtag,
    handleClearFilter,
  };
}
