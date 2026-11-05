// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Empty State Component

'use client';

import type { FC } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Button } from '@astryxdesign/core/Button';

export interface FeedFilterState {
  isBookmarksFilter: boolean;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
}

function getEmptyStateDescription(isBookmarksFilter: boolean): string {
  if (isBookmarksFilter) {
    return 'You have not saved any posts yet. Click the bookmark icon on any post to save it here.';
  }
  return 'No posts match the active filter criteria.';
}

export const FeedEmptyState: FC<FeedFilterState> = ({
  isBookmarksFilter,
  hasActiveFilter,
  onClearFilter,
}) => {
  return (
    <Card padding={6}>
      <EmptyState
        headingLevel={3}
        title={isBookmarksFilter ? 'No Saved Posts' : 'No Posts Found'}
        description={getEmptyStateDescription(isBookmarksFilter)}
        actions={
          hasActiveFilter && !isBookmarksFilter ? (
            <Button
              size="sm"
              variant="primary"
              label="Reset to All Posts"
              onClick={onClearFilter}
            />
          ) : undefined
        }
      />
    </Card>
  );
};
