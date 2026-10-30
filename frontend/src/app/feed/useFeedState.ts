// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Loader & Filter Hooks

'use client';

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, FeedFilter, FeedFilterType } from '../../types/social.ts';
import { feedApi } from '../../api/feedApi.ts';
import { syncSharedPosts } from '../../utils/sharedPostsStore.ts';

const SHORTCUT_LABELS: Record<FeedFilterType, string> = {
  ALL: 'All Posts',
  MEDIA: 'Media Only',
  BOOKMARKS: 'Saved Posts',
  HASHTAG: 'Filtered Posts',
};

function hasFeedItems(posts: unknown): posts is Post[] {
  return Array.isArray(posts) && posts.length > 0;
}

function parsePostDate(post: Post): number {
  if (!post.createdAt) return 0;
  if (post.createdAt === 'Just now' || post.createdAt.includes('now') || post.createdAt.includes('sec')) {
    return Date.now() + 10000;
  }
  const parsed = Date.parse(post.createdAt);
  return isNaN(parsed) ? Date.now() - 100000 : parsed;
}

function mergeFeedPosts(livePosts: Post[], prevPosts: Post[]): Post[] {
  const liveIds = new Set(livePosts.map((p) => p.id));
  const retainedMock = prevPosts.filter((p) => !liveIds.has(p.id));
  const combined = [...retainedMock, ...livePosts];
  return combined.sort((a, b) => parsePostDate(b) - parsePostDate(a));
}

export interface UseFeedLoaderResult {
  isLoading: boolean;
  isRefreshing: boolean;
  refreshFeed: () => Promise<void>;
}

export function useFeedLoader(
  backendUserId: string,
  setPosts: Dispatch<SetStateAction<Post[]>>
): UseFeedLoaderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFeed = useCallback(
    async (mode: 'initial' | 'refresh' | 'background' = 'initial') => {
      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (mode === 'initial') {
        setIsLoading(true);
      }

      try {
        const [feedPosts] = await Promise.all([
          feedApi.getFeedPostsUi(backendUserId, 0, 30),
          mode === 'initial' || mode === 'refresh'
            ? new Promise((resolve) => setTimeout(resolve, 350))
            : Promise.resolve(),
        ]);

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

  // 1. Initial load on user or mount
  useEffect(() => {
    loadFeed('initial');
  }, [loadFeed]);

  // 2. Real-time background sync on window focus, document visibility, and interval
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadFeed('background');
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadFeed('background');
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
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
