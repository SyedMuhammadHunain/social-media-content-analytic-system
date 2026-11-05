// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Post Edit Form Body

'use client';

import type { FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';

export interface PostEditFormBodyProps {
  text: string;
  setText: (val: string) => void;
  mediaUrl: string;
  setMediaUrl: (val: string) => void;
  hashtagsRaw: string;
  setHashtagsRaw: (val: string) => void;
}

export function PostEditFormBody({
  text,
  setText,
  mediaUrl,
  setMediaUrl,
  hashtagsRaw,
  setHashtagsRaw,
}: PostEditFormBodyProps) {
  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="label" color="secondary">
          Post Text Content
        </Text>
        <div data-testid="post-edit-text-input">
          <TextArea
            label="Post Text"
            isLabelHidden
            placeholder="What's happening?"
            value={text}
            onChange={setText}
            onInput={(e: FormEvent<HTMLElement>) => {
              const target = e.target as HTMLTextAreaElement;
              if (target) setText(target.value);
            }}
            rows={4}
          />
        </div>
      </VStack>

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Media URL (Optional)
        </Text>
        <div data-testid="post-edit-media-input">
          <TextInput
            label="Media URL"
            isLabelHidden
            placeholder="https://..."
            value={mediaUrl}
            onChange={setMediaUrl}
            onInput={(e: FormEvent<HTMLElement>) => {
              const target = e.target as HTMLInputElement;
              if (target) setMediaUrl(target.value);
            }}
          />
        </div>
      </VStack>

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Hashtags
        </Text>
        <div data-testid="post-edit-hashtags-input">
          <TextInput
            label="Hashtags"
            isLabelHidden
            placeholder="#metaastryx #systemarchitecture"
            value={hashtagsRaw}
            onChange={setHashtagsRaw}
            onInput={(e: FormEvent<HTMLElement>) => {
              const target = e.target as HTMLInputElement;
              if (target) setHashtagsRaw(target.value);
            }}
          />
        </div>
      </VStack>
    </VStack>
  );
}
