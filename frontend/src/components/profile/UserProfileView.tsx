// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - User Profile Full View

'use client';

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Divider } from '@astryxdesign/core/Divider';

import type { UserProfile, Post, UpdatePostInput } from '../../types/social';
import { ProfileBioEditor } from './ProfileBioEditor';
import { ProfileHeaderBanner } from './ProfileHeaderBanner';
import { ProfileMetaDetails } from './ProfileMetaDetails';
import { ProfileSkeleton } from './ProfileSkeleton';
import { PostCard } from '../../app/feed/PostCard';

export interface UserProfileViewProps {
  user: UserProfile;
  posts: Post[];
  isLoading?: boolean;
  onBack?: () => void;
  isOwnProfile?: boolean;
  onUpdateBio?: (newBio: string) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateBanner?: (newBannerUrl: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleFollow?: (userId: string) => void;
  onMessageUser?: (user: UserProfile) => void;
  onAddComment?: (
    postId: string,
    text: string,
    parentCommentId?: string,
    mediaUrl?: string,
    mediaType?: 'IMAGE' | 'GIF' | 'VIDEO'
  ) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
}

export const UserProfileView: FC<UserProfileViewProps> = ({
  user,
  posts,
  isLoading = false,
  isOwnProfile = true,
  onUpdateBio,
  onUpdateAvatar,
  onUpdateBanner,
  onToggleLike = () => {},
  onToggleFollow = () => {},
  onMessageUser,
  onAddComment = () => {},
  onEditPost,
  onDeletePost,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bio, setBio] = useState<string>(user.bio);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBio(user.bio);
  }, [user.bio]);

  useEffect(() => {
    return () => {
      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
    };
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setIsTabLoading(true);
    if (tabTimerRef.current) {
      clearTimeout(tabTimerRef.current);
    }
    tabTimerRef.current = setTimeout(() => {
      setIsTabLoading(false);
    }, 250);
  };

  const handleSaveBio = (newBio: string) => {
    setBio(newBio);
    onUpdateBio?.(newBio);
  };

  const displayedPosts =
    activeTab === 'media'
      ? posts.filter((p) => p.mediaUrls && p.mediaUrls.length > 0)
      : posts;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div data-testid="user-profile-view" style={{ width: '100%' }}>
      <VStack gap={4} align="stretch">
        {/* Profile Cover Banner & Overlapping Avatar */}
        <ProfileHeaderBanner
          user={user}
          avatarInputRef={avatarInputRef}
          isOwnProfile={isOwnProfile}
          onUpdateAvatar={onUpdateAvatar}
          onUpdateBanner={onUpdateBanner}
        />

        {/* Identity Header Card */}
        <ProfileMetaDetails
          user={user}
          isOwnProfile={isOwnProfile}
          onToggleFollow={onToggleFollow}
          onMessageUser={onMessageUser}
        />

        {/* Rich Bio Section */}
        <ProfileBioEditor
          bio={bio}
          isOwnProfile={isOwnProfile}
          onSaveBio={handleSaveBio}
        />

        {/* Past Post History */}
        <Card variant="default">
          <VStack gap={4} align="stretch">
            <HStack hAlign="between" vAlign="center">
              <Heading level={3}>Post History</Heading>
              <TabList value={activeTab} onChange={handleTabChange}>
                <Tab value="all" label="All Posts" />
                <Tab value="media" label="Media" />
              </TabList>
            </HStack>

            <Divider />

            {isTabLoading ? (
              <VStack gap={3}>
                <Skeleton width="100%" height={120} radius={3} />
                <Skeleton width="100%" height={120} radius={3} />
              </VStack>
            ) : displayedPosts.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <Text type="body" color="secondary">
                  No posts found in this category.
                </Text>
              </div>
            ) : (
              <VStack gap={0}>
                {displayedPosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onToggleLike={onToggleLike}
                    onToggleFollow={onToggleFollow}
                    onAddComment={onAddComment}
                    onEditPost={onEditPost}
                    onDeletePost={onDeletePost}
                    isFirst={index === 0}
                    isLast={index === displayedPosts.length - 1}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </Card>
      </VStack>
    </div>
  );
};

export default UserProfileView;
