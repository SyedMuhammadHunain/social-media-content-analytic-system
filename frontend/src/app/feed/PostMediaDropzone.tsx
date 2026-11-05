// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Media Dropzone & Preview

'use client';

import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { PostType } from '../../types/social.ts';

const CloseXIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={16}
    height={16}
    aria-hidden="true"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function getMediaBadgeLabel(mediaUrl: string, mediaType: PostType): string {
  if (mediaUrl.includes('blob.core.windows.net')) {
    return 'Uploaded to Azure Blob';
  }
  if (
    mediaUrl.toLowerCase().includes('.gif') ||
    mediaUrl.includes('giphy.com') ||
    mediaUrl.includes('tenor.com')
  ) {
    return 'GIF Attached';
  }
  return mediaType === 'VIDEO' ? 'Video Attached' : 'Photo Attached';
}

interface PostMediaDropzoneProps {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  formatWarning: string | null;
  onRemoveMedia: () => void;
}

export function PostMediaDropzone({
  mediaUrl,
  mediaType,
  formatWarning,
  onRemoveMedia,
}: PostMediaDropzoneProps) {
  return (
    <>
      {mediaUrl && (
        <div
          style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1))',
            maxHeight: 280,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          {mediaType === 'VIDEO' ? (
            <video
              src={mediaUrl}
              controls
              style={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Attached media"
              style={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
            }}
          >
            <IconButton
              label="Remove attachment"
              size="sm"
              variant="secondary"
              icon={<Icon icon={CloseXIcon} size="xsm" />}
              onClick={onRemoveMedia}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              zIndex: 2,
            }}
          >
            <Badge
              variant="info"
              label={getMediaBadgeLabel(mediaUrl, mediaType)}
            />
          </div>
        </div>
      )}

      {formatWarning && (
        <Text type="supporting" color="secondary" style={{ color: 'var(--color-warning, #f59e0b)' }}>
          {formatWarning}
        </Text>
      )}
    </>
  );
}
