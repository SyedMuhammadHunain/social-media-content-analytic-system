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

export function useFeedLoader(backendUserId: string, setPosts: Dispatch<SetStateAction<Post[]>>) {
  useEffect(() => {
    let isMounted = true;

    feedApi
      .getFeedPostsUi(backendUserId, 0, 20)
      .then((feedPosts) => {
        if (!isMounted) return;
        if (!hasFeedItems(feedPosts)) return;
        setPosts(feedPosts);
      })
      .catch(() => {
        // Gateway offline: retain INITIAL_POSTS fallback
      });

    return () => {
      isMounted = false;
    };
  }, [backendUserId, setPosts]);
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
