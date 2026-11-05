// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Comments Toggle Hook

import { useState } from 'react';
import type { Post, UserProfile, Comment } from '../../types/social.ts';
import {
  shouldFetchRemoteComments,
  fetchRemoteCommentsForPost,
} from './postCommentUtils.ts';

export function usePostCommentsToggle(post: Post, currentUser?: UserProfile) {
  const [showComments, setShowComments] = useState(false);
  const [remoteComments, setRemoteComments] = useState<Comment[]>([]);

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    const needFetch = shouldFetchRemoteComments(
      nextShow,
      post.comments.length,
      post.commentsCount,
      remoteComments.length
    );

    if (needFetch) {
      const fetched = await fetchRemoteCommentsForPost(post.id, currentUser);
      if (fetched.length > 0) {
        setRemoteComments(fetched);
      }
    }
  };

  return { showComments, remoteComments, handleToggleComments };
}
