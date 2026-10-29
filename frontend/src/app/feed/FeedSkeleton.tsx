// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Post Skeleton & Loading States

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export interface PostSkeletonCardProps {
  hasMedia?: boolean;
  index?: number;
}

export function PostSkeletonCard({ hasMedia = false, index = 0 }: PostSkeletonCardProps) {
  return (
    <div
      data-testid="post-skeleton-card"
      style={{
        animation: 'feedSkeletonFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <Card padding={5}>
        <VStack gap={4} align="stretch">
          {/* Header Skeleton */}
          <HStack gap={3} vAlign="center">
            <Skeleton width={40} height={40} radius="rounded" index={index * 4} />
            <VStack gap={1} align="start" style={{ flex: 1 }}>
              <Skeleton width={140} height={14} radius={2} index={index * 4 + 1} />
              <Skeleton width={90} height={12} radius={2} index={index * 4 + 2} />
            </VStack>
          </HStack>

          {/* Text Body Skeleton */}
          <VStack gap={2} align="stretch">
            <Skeleton width="100%" height={14} radius={2} index={index * 4 + 3} />
            <Skeleton width="92%" height={14} radius={2} index={index * 4 + 4} />
            <Skeleton width="55%" height={14} radius={2} index={index * 4 + 5} />
          </VStack>

          {/* Optional Media Skeleton */}
          {hasMedia && (
            <Skeleton width="100%" height={240} radius={3} index={index * 4 + 6} />
          )}

          {/* Actions Bar Skeleton */}
          <HStack hAlign="between" vAlign="center" style={{ paddingTop: 4 }}>
            <HStack gap={4}>
              <Skeleton width={56} height={28} radius={2} index={index * 4 + 7} />
              <Skeleton width={56} height={28} radius={2} index={index * 4 + 8} />
              <Skeleton width={56} height={28} radius={2} index={index * 4 + 9} />
            </HStack>
            <Skeleton width={28} height={28} radius={2} index={index * 4 + 10} />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <VStack gap={4} align="stretch" data-testid="feed-skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeletonCard key={`feed-skel-${i}`} index={i} hasMedia={i === 1} />
      ))}
    </VStack>
  );
}

export default FeedSkeleton;
