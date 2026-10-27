// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card (PDF Section 4.1.ii, iii, iv, v)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';

import type { Post, UpdatePostInput, UserProfile, Comment } from '../../types/social.ts';
import { CommentSection } from './CommentSection.tsx';
import { PostEditModal } from './PostEditModal.tsx';
import { PostHeader } from './PostHeader.tsx';
import { PostMediaViewer } from './PostMediaViewer.tsx';
import { PostDeleteModal } from './PostDeleteModal.tsx';
import { PostCardActionBar } from './PostCardActionBar.tsx';
import { shouldFetchRemoteComments, fetchRemoteCommentsForPost } from './postCommentUtils.ts';

function PostHashtags({ hashtags }: { hashtags: string[] }) {
  if (hashtags.length === 0) return null;
  return (
    <HStack gap={2} wrap="wrap">
      {hashtags.map((tag) => (
        <Badge key={tag} variant="neutral" label={tag} />
      ))}
    </HStack>
  );
}

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
  onToggleBookmark?: (postId: string) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUser,
  onToggleLike,
  onToggleFollow,
  onAddComment,
  onToggleBookmark,
  onEditPost,
  onDeletePost,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [remoteComments, setRemoteComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAuthor = Boolean(currentUser?.id === post.author.id);
  const postContent = post.text || post.description;

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

  return (
    <div data-testid={`post-card-${post.id}`}>
      <Card padding={5}>
        <VStack gap={4}>
          <PostHeader
            author={post.author}
            type={post.type}
            createdAt={post.createdAt}
            isAuthor={isAuthor}
            postId={post.id}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsConfirmingDelete(true)}
            onToggleFollow={onToggleFollow}
          />

          {postContent && (
            <Text type="body">
              {postContent}
            </Text>
          )}

          <PostMediaViewer
            mediaUrls={post.mediaUrls}
            type={post.type}
            description={post.description}
          />

          <PostHashtags hashtags={post.hashtags} />

          <Divider />

          <PostCardActionBar
            postId={post.id}
            likesCount={post.likesCount}
            isLiked={post.isLiked}
            commentsCount={post.commentsCount}
            isBookmarked={post.isBookmarked}
            onToggleLike={onToggleLike}
            onToggleComments={handleToggleComments}
            onToggleBookmark={onToggleBookmark}
          />

          {showComments && (
            <CommentSection
              postId={post.id}
              comments={[...post.comments, ...remoteComments]}
              onAddComment={onAddComment}
            />
          )}
        </VStack>
      </Card>

      <PostEditModal
        post={post}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={input => onEditPost?.(post.id, input)}
      />

      <PostDeleteModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          setIsConfirmingDelete(false);
          onDeletePost?.(post.id);
        }}
      />
    </div>
  );
}

export default PostCard;
