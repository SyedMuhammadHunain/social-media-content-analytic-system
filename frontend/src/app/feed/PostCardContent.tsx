// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Card Content

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import type { PostType } from '../../types/social.ts';
import { PostMediaViewer } from './PostMediaViewer.tsx';

function formatTag(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`;
}

export function PostHashtags({ hashtags }: { hashtags: string[] }) {
  if (hashtags.length === 0) return null;
  return (
    <HStack gap={2} wrap="wrap">
      {hashtags.map((tag) => (
        <Badge key={tag} variant="neutral" label={formatTag(tag)} />
      ))}
    </HStack>
  );
}

interface PostCardContentProps {
  text?: string;
  description?: string;
  type: PostType;
  mediaUrls?: string[];
  mediaId?: string;
  hashtags: string[];
}

export function PostCardContent({
  text,
  description,
  type,
  mediaUrls,
  mediaId,
  hashtags,
}: PostCardContentProps) {
  const content = text || description;

  return (
    <>
      {content && <Text type="body">{content}</Text>}

      <PostMediaViewer
        mediaUrls={mediaUrls}
        type={type}
        description={description}
        mediaId={mediaId}
      />

      <PostHashtags hashtags={hashtags} />
    </>
  );
}
