// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Section with Media, GIF & Emoji Support (PDF Section 4.1.v & Section 10.3)

'use client';

import { useState, useRef, useMemo, useEffect, type ChangeEvent } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

import type { Comment, User } from '../../types/social.ts';
import { CommentTreeItem } from './CommentTreeItem.tsx';
import { EmojiPickerPopover, GifPickerPopover } from './MediaPickerPopovers.tsx';
import { MediaIcon, GifIcon, EmojiIcon } from './postMediaIcons.tsx';
import { deduplicateComments } from './postCommentUtils.ts';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (
    postId: string,
    text: string,
    parentCommentId?: string,
    mediaUrl?: string,
    mediaType?: 'IMAGE' | 'GIF' | 'VIDEO'
  ) => void;
  onViewProfile?: (user: User) => void;
}

interface CommentTreePartition {
  rootComments: Comment[];
  repliesByParent: Map<string, Comment[]>;
}

interface AttachedMedia {
  url: string;
  type: 'IMAGE' | 'GIF' | 'VIDEO';
}

function partitionCommentTree(comments: Comment[]): CommentTreePartition {
  const allIds = new Set(comments.map((c) => c.id));
  const rootComments = comments.filter((c) => !c.parentCommentId || !allIds.has(c.parentCommentId));
  const repliesByParent = new Map<string, Comment[]>();

  for (const c of comments) {
    if (c.parentCommentId && allIds.has(c.parentCommentId)) {
      const list = repliesByParent.get(c.parentCommentId) || [];
      list.push(c);
      repliesByParent.set(c.parentCommentId, list);
    }
  }

  return { rootComments, repliesByParent };
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
  onViewProfile,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activePicker, setActivePicker] = useState<'none' | 'emoji' | 'gif'>('none');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deduplicatedComments = useMemo(() => deduplicateComments(comments), [comments]);
  const { rootComments, repliesByParent } = partitionCommentTree(deduplicatedComments);

  useEffect(() => {
    return () => {
      if (attachedMedia?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(attachedMedia.url);
      }
    };
  }, [attachedMedia]);

  const removeAttachedMedia = () => {
    if (attachedMedia?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(attachedMedia.url);
    }
    setAttachedMedia(null);
  };

  const handleMainSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed && !attachedMedia) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    onAddComment(postId, trimmed, undefined, attachedMedia?.url, attachedMedia?.type);
    setCommentText('');
    setAttachedMedia(null);
    setActivePicker('none');
    setTimeout(() => setIsSubmitting(false), 300);
  };

  const handleReplySubmit = (parentCommentId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onAddComment(postId, trimmed, parentCommentId);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleSelectReply = (targetComment: Comment) => {
    if (replyingTo?.id === targetComment.id) {
      setReplyingTo(null);
      setReplyText('');
      return;
    }
    setReplyingTo({ id: targetComment.id, username: targetComment.author.username });
    setReplyText('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (attachedMedia?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(attachedMedia.url);
      }
      const objectUrl = URL.createObjectURL(file);
      const isGif = file.type === 'image/gif';
      setAttachedMedia({
        url: objectUrl,
        type: isGif ? 'GIF' : 'IMAGE',
      });
      setActivePicker('none');
    }
  };

  const handleSelectGif = (gifUrl: string) => {
    setAttachedMedia({
      url: gifUrl,
      type: 'GIF',
    });
    setActivePicker('none');
  };

  const handleSelectEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
  };

  const togglePicker = (picker: 'emoji' | 'gif') => {
    setActivePicker((curr) => (curr === picker ? 'none' : picker));
  };

  return (
    <VStack gap={3}>
      <Divider />

      <HStack gap={2} vAlign="center">
        <Icon icon={ChatBubbleLeftIcon} size="xsm" color="secondary" />
        <Heading level={4}>Comments ({deduplicatedComments.length})</Heading>
      </HStack>

      {/* Hidden file input for photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        data-testid="comment-file-input"
        onChange={handleFileChange}
      />

      {/* Media Attachment Preview if selected */}
      {attachedMedia && (
        <div
          data-testid="comment-media-preview"
          style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: 180,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.15))',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <img
            src={attachedMedia.url}
            alt="Comment preview"
            style={{ width: '100%', maxHeight: 110, objectFit: 'contain', display: 'block' }}
          />
          <button
            type="button"
            data-testid="comment-remove-media-btn"
            onClick={removeAttachedMedia}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'rgba(0, 0, 0, 0.75)',
              border: 'none',
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Comment Input & Toolbar */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <div style={{ flex: 1 }}>
            <TextInput
              data-testid="comment-input"
              label="Write a comment"
              isLabelHidden
              placeholder="Write a comment..."
              value={commentText}
              onChange={(val: string) => setCommentText(val)}
              onEnter={handleMainSubmit}
            />
          </div>
          <Button
            data-testid="comment-submit-btn"
            label="Post"
            variant="primary"
            size="sm"
            isDisabled={(!commentText.trim() && !attachedMedia) || isSubmitting}
            icon={<Icon icon={PaperAirplaneIcon} size="xsm" />}
            onClick={handleMainSubmit}
          />
        </HStack>

        {/* Action Toolbar for Media, GIF, Emoji */}
        <HStack gap={1} vAlign="center">
          <IconButton
            data-testid="comment-media-btn"
            size="sm"
            variant="ghost"
            label="Attach photo"
            icon={<Icon icon={MediaIcon} size="xsm" />}
            onClick={() => {
              setActivePicker('none');
              fileInputRef.current?.click();
            }}
          />
          <IconButton
            data-testid="comment-gif-btn"
            size="sm"
            variant={activePicker === 'gif' ? 'secondary' : 'ghost'}
            label="Choose a GIF"
            icon={<Icon icon={GifIcon} size="xsm" />}
            onClick={() => togglePicker('gif')}
          />
          <IconButton
            data-testid="comment-emoji-btn"
            size="sm"
            variant={activePicker === 'emoji' ? 'secondary' : 'ghost'}
            label="Insert emoji"
            icon={<Icon icon={EmojiIcon} size="xsm" />}
            onClick={() => togglePicker('emoji')}
          />
        </HStack>

        {/* Popovers */}
        {activePicker === 'gif' && (
          <GifPickerPopover onSelectGif={handleSelectGif} />
        )}

        {activePicker === 'emoji' && (
          <EmojiPickerPopover onSelectEmoji={handleSelectEmoji} />
        )}
      </VStack>

      {/* Comments Hierarchy */}
      {rootComments.length > 0 && (
        <VStack gap={3}>
          {rootComments.map((root) => (
            <CommentTreeItem
              key={root.id}
              comment={root}
              replyingTo={replyingTo}
              replyText={replyText}
              repliesByParent={repliesByParent}
              onSelectReply={handleSelectReply}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              onReplyTextChange={(val) => setReplyText(val)}
              onReplySubmit={handleReplySubmit}
              onViewProfile={onViewProfile}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default CommentSection;
