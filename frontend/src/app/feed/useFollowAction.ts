// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Follow/Unfollow Graph Action Hook

'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Post, UserProfile, SuggestedCreator } from '../../types/social.ts';
import { socialApi } from '../../api/socialApi.ts';
import { notificationsApi } from '../../api/notificationsApi.ts';
import { recordConnectionChange } from '../../utils/profileActivityStore.ts';

interface UseFollowActionParams {
  user?: UserProfile;
  backendUserId: string;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  suggestedCreators: SuggestedCreator[];
  setSuggestedCreators: Dispatch<SetStateAction<SuggestedCreator[]>>;
  setUser: Dispatch<SetStateAction<UserProfile>>;
  recordFollowToggle: (isFollowed: boolean) => void;
}

interface FollowIdentityBundle {
  targetUserId: string;
  backendUserId: string;
  user?: UserProfile;
}

interface FollowUiDispatchers {
  setSuggestedCreators: Dispatch<SetStateAction<SuggestedCreator[]>>;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  setUser: Dispatch<SetStateAction<UserProfile>>;
}

function resolveNextFollowState(creator?: SuggestedCreator, post?: Post): boolean {
  if (creator) return !creator.isFollowed;
  if (post) return !post.author.isFollowed;
  return true;
}

function shouldNotifyFollowedUser(nextIsFollowed: boolean, bundle: FollowIdentityBundle): boolean {
  if (!nextIsFollowed) return false;
  if (bundle.targetUserId === bundle.backendUserId) return false;
  return bundle.targetUserId !== bundle.user?.id;
}

function notifyFollowedUser(bundle: FollowIdentityBundle) {
  const actorName = bundle.user?.name || 'A creator';
  notificationsApi
    .triggerNotification({
      recipientUserId: bundle.targetUserId,
      actorUserId: bundle.backendUserId,
      actorName,
      actorAvatar: bundle.user?.avatarUrl,
      type: 'FOLLOW',
      message: `${actorName} started following you.`,
    })
    .catch(() => {});

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('social:new-notification', {
        detail: {
          recipientUserId: bundle.targetUserId,
          actorName,
          type: 'FOLLOW',
        },
      })
    );
  }
}

async function syncFollowApi(nextIsFollowed: boolean, backendUserId: string, targetUserId: string) {
  try {
    if (nextIsFollowed) {
      await socialApi.followUser(backendUserId, targetUserId);
    } else {
      await socialApi.unfollowUser(backendUserId, targetUserId);
    }
  } catch {
    // Offline fallback
  }
}

function updateFollowUiCollections(
  targetUserId: string,
  nextIsFollowed: boolean,
  dispatchers: FollowUiDispatchers
) {
  const { setSuggestedCreators, setPosts, setUser } = dispatchers;

  setSuggestedCreators((prev) =>
    prev.map((c) => (c.id === targetUserId ? { ...c, isFollowed: nextIsFollowed } : c))
  );

  setPosts((prev) =>
    prev.map((p) =>
      p.author.id === targetUserId ? { ...p, author: { ...p.author, isFollowed: nextIsFollowed } } : p
    )
  );

  setUser((prev) => ({
    ...prev,
    followingCount: nextIsFollowed ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
  }));
}

function updateConnectionRecords(targetUserId: string, nextIsFollowed: boolean, user?: UserProfile) {
  const delta = nextIsFollowed ? 1 : -1;
  if (user?.id) {
    recordConnectionChange(user.id, delta, user.username);
  }
  recordConnectionChange(targetUserId, delta);
}

export function useFollowAction({
  user,
  backendUserId,
  posts,
  setPosts,
  suggestedCreators,
  setSuggestedCreators,
  setUser,
  recordFollowToggle,
}: UseFollowActionParams) {
  const handleToggleFollow = useCallback(async (targetUserId: string) => {
    const creator = suggestedCreators.find((c) => c.id === targetUserId);
    const post = posts.find((p) => p.author.id === targetUserId);
    const nextIsFollowed = resolveNextFollowState(creator, post);

    updateFollowUiCollections(targetUserId, nextIsFollowed, { setSuggestedCreators, setPosts, setUser });
    updateConnectionRecords(targetUserId, nextIsFollowed, user);
    recordFollowToggle(nextIsFollowed);

    const identityBundle: FollowIdentityBundle = { targetUserId, backendUserId, user };
    if (shouldNotifyFollowedUser(nextIsFollowed, identityBundle)) {
      notifyFollowedUser(identityBundle);
    }

    await syncFollowApi(nextIsFollowed, backendUserId, targetUserId);
  }, [suggestedCreators, posts, backendUserId, user, setSuggestedCreators, setPosts, setUser, recordFollowToggle]);

  return { handleToggleFollow };
}
