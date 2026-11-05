// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Skeleton Loading State

'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export function ProfileSkeleton() {
  return (
    <div data-testid="profile-skeleton-container" style={{ width: '100%' }}>
      <VStack gap={4} align="stretch">
        {/* Cover Banner Skeleton */}
        <div style={{ position: 'relative', width: '100%', marginBottom: 36 }}>
          <Skeleton width="100%" height={160} radius={3} index={0} />
          {/* Overlapping Avatar */}
          <div
            style={{
              position: 'absolute',
              bottom: -32,
              left: 24,
              borderRadius: '50%',
              padding: 4,
              backgroundColor: 'var(--color-background-surface, #1e1e1e)',
            }}
          >
            <Skeleton width={80} height={80} radius="rounded" index={1} />
          </div>
        </div>

        {/* Identity & Meta Details Skeleton */}
        <Card variant="default" padding={5}>
          <VStack gap={3} align="start" style={{ width: '100%' }}>
            <Skeleton width={200} height={22} radius={2} index={2} />
            <Skeleton width={130} height={14} radius={2} index={3} />
            <Skeleton width="80%" height={14} radius={2} index={4} />
            <HStack gap={4} style={{ paddingTop: 8 }}>
              <Skeleton width={90} height={16} radius={2} index={5} />
              <Skeleton width={90} height={16} radius={2} index={6} />
            </HStack>
          </VStack>
        </Card>

        {/* Bio Section Skeleton */}
        <Card variant="default" padding={5}>
          <VStack gap={2} align="stretch">
            <Skeleton width={100} height={18} radius={2} index={7} />
            <Skeleton width="100%" height={14} radius={2} index={8} />
            <Skeleton width="92%" height={14} radius={2} index={9} />
            <Skeleton width="60%" height={14} radius={2} index={10} />
          </VStack>
        </Card>

        {/* Post History Section Skeleton */}
        <Card variant="default" padding={5}>
          <VStack gap={4} align="stretch">
            <HStack hAlign="between" vAlign="center">
              <Skeleton width={120} height={20} radius={2} index={11} />
              <HStack gap={2}>
                <Skeleton width={70} height={28} radius={2} index={12} />
                <Skeleton width={70} height={28} radius={2} index={13} />
              </HStack>
            </HStack>
            <VStack gap={3}>
              <Skeleton width="100%" height={110} radius={3} index={14} />
              <Skeleton width="100%" height={110} radius={3} index={15} />
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

export default ProfileSkeleton;
