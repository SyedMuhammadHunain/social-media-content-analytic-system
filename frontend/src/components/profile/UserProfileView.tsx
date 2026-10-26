// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - User Profile Full View

'use client';

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { Layout, LayoutContent, HStack, VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Divider } from '@astryxdesign/core/Divider';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import type { UserProfile, Post, UpdatePostInput } from '../../types/social';
import { ProfileBioEditor } from './ProfileBioEditor';
import { ProfileHeaderBanner } from './ProfileHeaderBanner';
import { ProfileMetaDetails } from './ProfileMetaDetails';
import { PostCard } from '../../app/feed/PostCard';

export interface UserProfileViewProps {
  user: UserProfile;
  posts: Post[];
  onBack: () => void;
  onUpdateBio?: (newBio: string) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateBanner?: (newBannerUrl: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleFollow?: (userId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onEditPost?: (postId: string, input: UpdatePostInput) => void;
  onDeletePost?: (postId: string) => void;
}

export const UserProfileView: FC<UserProfileViewProps> = ({
  user,
  posts,
  onBack,
  onUpdateBio,
  onUpdateAvatar,
  onUpdateBanner,
  onToggleLike = () => {},
  onToggleFollow = () => {},
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

  return (
    <div data-testid="user-profile-view">
      <Layout
        height="fill"
        content={
          <LayoutContent padding={6}>
            <div
              style={{
                maxWidth: 960,
                margin: '0 auto',
                width: '100%',
              }}
            >
              <VStack gap={6} align="stretch">
                {/* Back to Feed Navigation Bar */}
                <HStack vAlign="center">
                  <Button
                    label="Back to Feed"
                    icon={<ArrowLeftIcon style={{ width: 16, height: 16 }} />}
                    variant="ghost"
                    onClick={onBack}
                  />
                </HStack>

                {/* Profile Cover Banner & Overlapping Avatar */}
                <ProfileHeaderBanner
                  user={user}
                  avatarInputRef={avatarInputRef}
                  onUpdateAvatar={onUpdateAvatar}
                  onUpdateBanner={onUpdateBanner}
                />

                {/* Identity Header Card */}
                <ProfileMetaDetails
                  user={user}
                  onChangePhoto={() => avatarInputRef.current?.click()}
                />

                {/* Rich Bio Section */}
                <ProfileBioEditor bio={bio} onSaveBio={handleSaveBio} />

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
                      <VStack gap={4}>
                        {displayedPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            currentUser={user}
                            onToggleLike={onToggleLike}
                            onToggleFollow={onToggleFollow}
                            onAddComment={onAddComment}
                            onEditPost={onEditPost}
                            onDeletePost={onDeletePost}
                          />
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </Card>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
};

export default UserProfileView;
