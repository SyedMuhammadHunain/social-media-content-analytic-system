// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Viewer (PDF Section 4.1.ii)

'use client';

import type { PostType } from '../../types/social';

export interface PostMediaViewerProps {
  mediaUrls?: string[];
  type: PostType;
  description?: string;
}

export function PostMediaViewer({ mediaUrls, type, description }: PostMediaViewerProps) {
  const mediaUrl = mediaUrls?.[0];
  if (!mediaUrl) return null;

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        maxHeight: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {type === 'IMAGE' ? (
        <img
          data-testid="post-media-image"
          src={mediaUrl}
          alt={description || 'Post image'}
          style={{
            width: '100%',
            maxHeight: 480,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <video
          src={mediaUrl}
          controls
          style={{
            width: '100%',
            maxHeight: 480,
            backgroundColor: '#000000',
          }}
        />
      )}
    </div>
  );
}

export default PostMediaViewer;
