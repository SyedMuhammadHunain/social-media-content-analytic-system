// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Create Modal Controls

'use client';

import { HStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

export interface PostModalHeaderProps {
  onCancel: () => void;
  title?: string;
}

export function PostModalHeader({ onCancel, title = 'New Post' }: PostModalHeaderProps) {
  return (
    <HStack hAlign="between" vAlign="center">
      <Button
        data-testid="modal-cancel-btn"
        label="Cancel"
        variant="ghost"
        size="sm"
        onClick={onCancel}
      />
      <Heading level={4}>{title}</Heading>
      <div style={{ width: 64 }} aria-hidden="true" />
    </HStack>
  );
}

export interface PostModalFooterProps {
  isSubmitDisabled: boolean;
  isSubmitting?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

export function PostModalFooter({
  isSubmitDisabled,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Post',
}: PostModalFooterProps) {
  return (
    <HStack hAlign="between" vAlign="center">
      <div aria-hidden="true" />
      <Button
        data-testid="modal-post-submit-btn"
        label={submitLabel}
        variant="primary"
        size="md"
        isDisabled={isSubmitDisabled}
        isLoading={isSubmitting}
        onClick={onSubmit}
      />
    </HStack>
  );
}
