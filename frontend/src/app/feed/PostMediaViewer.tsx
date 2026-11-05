// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Viewer (PDF Section 4.1.ii)

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { VideoCameraSlashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { PostType } from '../../types/social.ts';
import { getOrRehydrateObjectUrl } from '../../utils/mediaBlobStore.ts';
import { isGifUrl } from './postCommentUtils.ts';

export interface PostMediaViewerProps {
  mediaUrls?: string[];
  type: PostType;
  description?: string;
  mediaId?: string;
}

const VIDEO_EXT_REGEX = /\.(mp4|webm|ogg|mov|mkv|avi|wmv)$/i;

const containerStyle: React.CSSProperties = {
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  maxHeight: 480,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: 480,
  objectFit: 'cover',
  display: 'block',
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: 480,
  backgroundColor: '#000000',
  display: 'block',
};

function checkIsVideo(type: PostType, url: string): boolean {
  if (type === 'VIDEO') return true;
  if (!url) return false;
  return VIDEO_EXT_REGEX.test(url) || url.startsWith('data:video/');
}

function shouldFallbackToSample(isVideo: boolean, url: string): boolean {
  if (!isVideo || !url) return false;
  return url !== '/sample-video.mp4';
}

async function resolveMediaFallback(
  mediaId: string | undefined,
  currentUrl: string,
  isVideo: boolean
): Promise<string | null> {
  if (mediaId) {
    const fresh = await getOrRehydrateObjectUrl(mediaId);
    if (fresh && fresh !== currentUrl) {
      return fresh;
    }
  }
  if (shouldFallbackToSample(isVideo, currentUrl)) {
    return '/sample-video.mp4';
  }
  return null;
}

function VideoPlaybackFallbackNotice({ url }: { url: string }) {
  return (
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
          {Boolean(url) && (
            <Button
              label="Open Video Source"
              variant="secondary"
              size="sm"
              icon={<Icon icon={ArrowTopRightOnSquareIcon} size="xsm" />}
              onClick={() => {
                if (/^https?:\/\//i.test(url)) {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          )}
        </VStack>
      </Card>
    </div>
  );
}

function useResolvedMediaUrl(mediaId: string | undefined, initialUrl: string) {
  const [resolvedUrl, setResolvedUrl] = useState<string>(initialUrl);

  useEffect(() => {
    let isMounted = true;
    if (mediaId) {
      getOrRehydrateObjectUrl(mediaId).then((rehydrated) => {
        if (isMounted && rehydrated) {
          setResolvedUrl(rehydrated);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [mediaId]);

  return [resolvedUrl, setResolvedUrl] as const;
}

interface PostMediaContentProps {
  type: PostType;
  isVideo: boolean;
  hasError: boolean;
  resolvedUrl: string;
  description?: string;
  onError: () => void;
}

function shouldRenderVideo(type: PostType, isVideo: boolean): boolean {
  if (isVideo) return true;
  return type === 'VIDEO';
}

function PostMediaContent({
  type,
  isVideo,
  hasError,
  resolvedUrl,
  description,
  onError,
}: PostMediaContentProps) {
  if (!resolvedUrl) {
    return null;
  }

  if (type === 'IMAGE' && !isVideo) {
    const isGif = isGifUrl(resolvedUrl);

    return (
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img
          data-testid="post-media-image"
          src={resolvedUrl}
          alt={description || 'Post image'}
          loading="lazy"
          decoding="async"
          onError={onError}
          style={{
            ...imageStyle,
            aspectRatio: '16 / 9',
          }}
        />
        {isGif && (
          <div
            data-testid="post-gif-badge"
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            GIF
          </div>
        )}
      </div>
    );
  }

  if (hasError) {
    return <VideoPlaybackFallbackNotice url={resolvedUrl} />;
  }

  if (!shouldRenderVideo(type, isVideo)) {
    return null;
  }

  return (
    <video
      key={resolvedUrl}
      data-testid="post-media-video"
      src={resolvedUrl}
      controls
      playsInline
      preload="metadata"
      onError={onError}
      style={videoStyle}
    >
      Your browser does not support HTML5 video playback.
    </video>
  );
}

export function PostMediaViewer({ mediaUrls, type, description, mediaId }: PostMediaViewerProps) {
  const initialUrl = mediaUrls?.[0] || '';
  const [resolvedUrl, setResolvedUrl] = useResolvedMediaUrl(mediaId, initialUrl);
  const [failedMediaUrl, setFailedMediaUrl] = useState<string | null>(null);

  if (!resolvedUrl) {
    return null;
  }

  const isVideo = checkIsVideo(type, resolvedUrl);
  const hasError = Boolean(resolvedUrl) && failedMediaUrl === resolvedUrl;

  const handleMediaError = async () => {
    const fallback = await resolveMediaFallback(mediaId, resolvedUrl, isVideo);
    if (fallback) {
      setResolvedUrl(fallback);
      return;
    }
    setFailedMediaUrl(resolvedUrl);
  };

  return (
    <div style={containerStyle}>
      <PostMediaContent
        type={type}
        isVideo={isVideo}
        hasError={hasError}
        resolvedUrl={resolvedUrl}
        description={description}
        onError={handleMediaError}
      />
    </div>
  );
}

export default PostMediaViewer;
