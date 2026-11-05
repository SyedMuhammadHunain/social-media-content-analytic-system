// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Comment Reply Composer

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface CommentReplyComposerProps {
  commentId: string;
  replyingToUsername: string;
  replyText: string;
  isNested?: boolean;
  onReplyTextChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CommentReplyComposer({
  commentId,
  replyingToUsername,
  replyText,
  isNested = false,
  onReplyTextChange,
  onSubmit,
  onCancel,
}: CommentReplyComposerProps) {
  return (
    <div
      data-testid={`reply-composer-${commentId}`}
      style={{
        paddingLeft: isNested ? 20 : 28,
        borderLeft: '2px solid var(--astryx-color-primary, #1877F2)',
        marginLeft: isNested ? 16 : 20,
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      <VStack gap={2}>
        <HStack hAlign="between" vAlign="center">
          <HStack gap={1} vAlign="center">
            <Text type="supporting" color="secondary">
              Replying to
            </Text>
            <Badge variant="blue" label={`@${replyingToUsername}`} />
          </HStack>
          <Button
            data-testid={`cancel-reply-btn-${commentId}`}
            label="Cancel"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XMarkIcon} size="xsm" />}
            onClick={onCancel}
          />
        </HStack>

        <HStack gap={2} vAlign="center">
          <div style={{ flex: 1 }}>
            <TextInput
              data-testid={`reply-input-${commentId}`}
              label={`Reply to @${replyingToUsername}`}
              isLabelHidden
              placeholder={`Write a reply to @${replyingToUsername}...`}
              value={replyText}
              onChange={onReplyTextChange}
              onEnter={onSubmit}
            />
          </div>
          <Button
            data-testid={`reply-submit-btn-${commentId}`}
            label="Reply"
            variant="primary"
            size="sm"
            isDisabled={!replyText.trim()}
            icon={<Icon icon={PaperAirplaneIcon} size="xsm" />}
            onClick={onSubmit}
          />
        </HStack>
      </VStack>
    </div>
  );
}

export default CommentReplyComposer;
