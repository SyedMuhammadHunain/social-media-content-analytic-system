// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Bio Editor

'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Text';

export interface ProfileBioEditorProps {
  bio: string;
  onSaveBio: (newBio: string) => void;
}

export const ProfileBioEditor: FC<ProfileBioEditorProps> = ({
  bio,
  onSaveBio,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(bio);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  const handleSave = () => {
    onSaveBio(content);
    setIsEditing(false);
    setShowSavedBanner(true);
  };

  const handleCancel = () => {
    setContent(bio);
    setIsEditing(false);
  };

  return (
    <Card variant="default">
      <VStack gap={3} align="stretch">
        {showSavedBanner && (
          <Banner
            status="success"
            title="Bio updated successfully"
            description="Your public profile about section has been updated."
            isDismissable
            onDismiss={() => setShowSavedBanner(false)}
            role="status"
          />
        )}

        <HStack hAlign="between" vAlign="center">
          <Heading level={3}>About</Heading>
          {!isEditing && (
            <Button
              label="Edit Bio"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            />
          )}
        </HStack>

        {isEditing ? (
          <VStack gap={2} align="stretch">
            <Toolbar
              label="Bio formatting toolbar"
              startContent={
                <HStack gap={1}>
                  <Button
                    label="Bold"
                    size="sm"
                    variant="ghost"
                    onClick={() => setContent((c) => c + ' **bold**')}
                  />
                  <Button
                    label="Code"
                    size="sm"
                    variant="ghost"
                    onClick={() => setContent((c) => c + ' `code`')}
                  />
                </HStack>
              }
            />

            <TextArea
              label="About Bio"
              isLabelHidden
              value={content}
              onChange={setContent}
              rows={4}
            />

            <HStack gap={2} hAlign="end">
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              />
              <Button
                label="Save Changes"
                variant="primary"
                size="sm"
                onClick={handleSave}
              />
            </HStack>
          </VStack>
        ) : (
          <Markdown>{content}</Markdown>
        )}
      </VStack>
    </Card>
  );
};

export default ProfileBioEditor;
