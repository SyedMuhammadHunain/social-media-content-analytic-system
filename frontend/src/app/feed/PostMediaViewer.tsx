// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Viewer (PDF Section 4.1.ii)

'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { VideoCameraSlashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { PostType } from '../../types/social.ts';

export interface PostMediaViewerProps {
  mediaUrls?: string[];
  type: PostType;
  description?: string;
}

export function PostMediaViewer({ mediaUrls, type, description }: PostMediaViewerProps) {
  const mediaUrl = mediaUrls?.[0];
  const [failedMediaUrl, setFailedMediaUrl] = useState<string | null>(null);
  const hasError = !!mediaUrl && failedMediaUrl === mediaUrl;

  if (!mediaUrl) return null;

  const isVideo =
    type === 'VIDEO' ||
    /\.(mp4|webm|ogg|mov|mkv|avi|wmv)$/i.test(mediaUrl) ||
    mediaUrl.startsWith('data:video/');

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
        width: '100%',
      }}
    >
      {type === 'IMAGE' && !isVideo ? (
        <img
          data-testid="post-media-image"
          src={mediaUrl}
          alt={description || 'Post image'}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            maxHeight: 480,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : hasError ? (
        <div style={{ width: '100%', padding: '16px' }}>
          <Card padding={4}>
            <VStack gap={3} align="center">
              <HStack gap={2} vAlign="center">
                <Icon icon={VideoCameraSlashIcon} size="md" color="accent" />
                <Text type="body" weight="semibold">
                  Video Playback Notice
                </Text>
              </HStack>
              <Text type="supporting" color="secondary">
                This browser cannot decode this video stream natively. Standard web browsers require MP4 (H.264/AAC) or WebM formats.
              </Text>
              {mediaUrl && (
                <Button
                  label="Open Video Source"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ArrowTopRightOnSquareIcon} size="xsm" />}
                  onClick={() => window.open(mediaUrl, '_blank')}
                />
              )}
            </VStack>
          </Card>
        </div>
      ) : (
        <video
          key={mediaUrl}
          data-testid="post-media-video"
          src={mediaUrl}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailedMediaUrl(mediaUrl)}
          style={{
            width: '100%',
            maxHeight: 480,
            backgroundColor: '#000000',
            display: 'block',
          }}
        >
          Your browser does not support HTML5 video playback.
        </video>
      )}
    </div>
  );
}

export default PostMediaViewer;
