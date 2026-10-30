// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Loader & Filter Hooks

'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Post, FeedFilter, FeedFilterType } from '../../types/social.ts';
import { feedApi } from '../../api/feedApi.ts';

const SHORTCUT_LABELS: Record<FeedFilterType, string> = {
  ALL: 'All Posts',
  MEDIA: 'Media Only',
  BOOKMARKS: 'Saved Posts',
  HASHTAG: 'Filtered Posts',
};

function hasFeedItems(posts: unknown): posts is Post[] {
  return Array.isArray(posts) && posts.length > 0;
}

function mergeFeedPosts(livePosts: Post[], prevPosts: Post[]): Post[] {
  const liveIds = new Set(livePosts.map((p) => p.id));
  const retainedMock = prevPosts.filter((p) => !liveIds.has(p.id));
  return [...livePosts, ...retainedMock];
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

  const loadFeed = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [feedPosts] = await Promise.all([
        feedApi.getFeedPostsUi(backendUserId, 0, 20),
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);

      if (hasFeedItems(feedPosts)) {
        setPosts((prev) => mergeFeedPosts(feedPosts, prev));
      }
    } catch {
      // Gateway offline: retain INITIAL_POSTS fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed(false);
  }, [backendUserId]);

  const refreshFeed = async () => {
    await loadFeed(true);
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
