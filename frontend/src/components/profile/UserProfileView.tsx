// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - User Profile Full View

'use client';

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { Layout, LayoutContent, HStack, VStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Divider } from '@astryxdesign/core/Divider';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import type { UserProfile, Post } from '../../types/social';
import { ProfileBioEditor } from './ProfileBioEditor';
import { PostCard } from '../../app/feed/PostCard';

export interface UserProfileViewProps {
  user: UserProfile;
  posts: Post[];
  onBack: () => void;
  onUpdateBio?: (newBio: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleFollow?: (userId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
}

export const UserProfileView: FC<UserProfileViewProps> = ({
  user,
  posts,
  onBack,
  onUpdateBio,
  onToggleLike = () => {},
  onToggleFollow = () => {},
  onAddComment = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bio, setBio] = useState<string>(user.bio);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

                {/* Profile Cover Banner */}
                <div
                  data-testid="profile-cover-banner"
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
                  }}
                >
                  <AspectRatio ratio={4 / 1} fit="cover">
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(135deg, #1877F2 0%, #7B1FA2 50%, #E91E63 100%)',
                      }}
                    />
                  </AspectRatio>
                </div>

                {/* Identity Header Card */}
                <Card variant="default">
                  <VStack gap={4} align="stretch">
                    <HStack gap={5} vAlign="start" wrap="wrap">
                      <div style={{ marginTop: -40 }}>
                        <Avatar
                          name={user.name}
                          src={user.avatarUrl}
                          size="xl"
                        />
                      </div>
                      <VStack gap={1} align="stretch" style={{ flex: '1 1 300px' }}>
                        <Heading level={2}>{user.name}</Heading>
                        <Text type="supporting" color="secondary">
                          @{user.username}
                        </Text>
                        <Text type="body" color="primary">
                          {user.headline}
                        </Text>

                        <HStack gap={2} wrap="wrap" style={{ marginTop: 8 }}>
                          {user.tags.map((tag) => (
                            <Badge key={tag} label={tag} variant="neutral" />
                          ))}
                        </HStack>

                        <Divider />

                        <HStack gap={6} vAlign="center">
                          <Text type="supporting" color="secondary">
                            Followers:{' '}
                            <strong
                              style={{
                                color: 'var(--color-text-primary, #FFFFFF)',
                              }}
                            >
                              {user.followerCount.toLocaleString()}
                            </strong>
                          </Text>
                          <Text type="supporting" color="secondary">
                            Following:{' '}
                            <strong
                              style={{
                                color: 'var(--color-text-primary, #FFFFFF)',
                              }}
                            >
                              {user.followingCount.toLocaleString()}
                            </strong>
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </VStack>
                </Card>

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
                            onToggleLike={onToggleLike}
                            onToggleFollow={onToggleFollow}
                            onAddComment={onAddComment}
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
