// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Addition Action Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, UserProfile, Comment } from '../../types/social.ts';
import { socialApi, type BackendComment } from '../../api/socialApi.ts';
import { notificationsApi } from '../../api/notificationsApi.ts';
import { updateSharedPost } from '../../utils/sharedPostsStore.ts';
import { parseCommentContent, isGifUrl } from './postCommentUtils.ts';

interface UseCommentActionParams {
  user: UserProfile;
  backendUserId: string;
  posts?: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  recordComment: () => void;
}

interface CommentNotificationContext {
  recipientId: string;
  backendUserId: string;
  user: UserProfile;
  postId: string;
}

function shouldNotifyRecipient(post: Post | undefined, backendUserId: string, userId: string): boolean {
  if (!post) return false;
  if (post.author.id === backendUserId) return false;
  return post.author.id !== userId;
}

function notifyCommentRecipient(ctx: CommentNotificationContext, text: string) {
  const { recipientId, backendUserId, user, postId } = ctx;
  const commentSnippet = text.length > 45 ? `${text.slice(0, 45)}...` : text;
  notificationsApi
    .triggerNotification({
      recipientUserId: recipientId,
      actorUserId: backendUserId,
      actorName: user.name,
      actorAvatar: user.avatarUrl,
      type: 'COMMENT',
      targetPostId: postId,
      message: `${user.name} commented: "${commentSnippet}"`,
    })
    .catch(() => {});

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('social:new-notification', {
        detail: {
          recipientUserId: recipientId,
          actorName: user.name,
          type: 'COMMENT',
        },
      })
    );
  }
}

function applyOptimisticComment(
  postId: string,
  comment: Comment,
  setPosts: Dispatch<SetStateAction<Post[]>>
) {
  const appendComment = (p: Post): Post => {
    if (p.comments.some((c) => c.id === comment.id)) return p;
    return {
      ...p,
      commentsCount: p.commentsCount + 1,
      comments: [...p.comments, comment],
    };
  };

  updateSharedPost(postId, appendComment);
  setPosts((prev) => prev.map((p) => (p.id === postId ? appendComment(p) : p)));
}

function reconcileSavedComment(
  postId: string,
  tempCommentId: string,
  saved: BackendComment,
  setPosts: Dispatch<SetStateAction<Post[]>>
) {
  const { text, mediaUrl, mediaType } = parseCommentContent(saved.content);

  const updateComment = (p: Post): Post => ({
    ...p,
    comments: p.comments.map((c) =>
      c.id === tempCommentId
        ? {
            ...c,
            id: saved.id,
            parentCommentId: saved.parentCommentId,
            text: text || c.text,
            mediaUrl: mediaUrl || c.mediaUrl,
            mediaType: mediaType || c.mediaType,
          }
        : c
    ),
  });

  updateSharedPost(postId, updateComment);
  setPosts((prev) => prev.map((p) => (p.id === postId ? updateComment(p) : p)));
}

export function useCommentAction({
  user,
  backendUserId,
  posts,
  setPosts,
  recordComment,
}: UseCommentActionParams) {
  const handleAddComment = useCallback(
    async (
      postId: string,
      text: string,
      parentCommentId?: string,
      mediaUrl?: string,
      mediaType?: 'IMAGE' | 'GIF' | 'VIDEO'
    ) => {
      const trimmedText = text.trim();
      if (!trimmedText && !mediaUrl) return;

      const tempCommentId = `c_${Date.now()}`;
      const resolvedMediaType =
        mediaType || (mediaUrl ? (isGifUrl(mediaUrl) ? 'GIF' : 'IMAGE') : undefined);

      const newComment: Comment = {
        id: tempCommentId,
        postId,
        userId: user.id,
        author: user,
        text: trimmedText,
        parentCommentId,
        mediaUrl,
        mediaType: resolvedMediaType,
        createdAt: 'Just now',
      };

      applyOptimisticComment(postId, newComment, setPosts);
      recordComment();

      const post = posts?.find((p) => p.id === postId);
      if (shouldNotifyRecipient(post, backendUserId, user.id)) {
        notifyCommentRecipient(
          { recipientId: post!.author.id, backendUserId, user, postId },
          trimmedText || 'shared an attachment'
        );
      }

      const backendContent = mediaUrl
        ? `${trimmedText} [media:${mediaUrl}]`.trim()
        : trimmedText;

      try {
        const saved = await socialApi.addComment({
          userId: backendUserId,
          postId,
          content: backendContent,
          parentCommentId,
        });

        if (saved?.id) {
          reconcileSavedComment(postId, tempCommentId, saved, setPosts);
        }
      } catch {
        // Offline fallback
      }
    },
    [user, backendUserId, posts, setPosts, recordComment]
  );

  return { handleAddComment };
}
