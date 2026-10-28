// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Header Banner (PDF Section 4.1.i)

'use client';

import { useRef, type ChangeEvent, type RefObject } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { CameraIcon } from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types/social';

export interface ProfileHeaderBannerProps {
  user: UserProfile;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateBanner?: (newBannerUrl: string) => void;
}

export function ProfileHeaderBanner({
  user,
  avatarInputRef,
  onUpdateAvatar,
  onUpdateBanner,
}: ProfileHeaderBannerProps) {
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    callback?: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback?.(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div style={{ position: 'relative', marginBottom: 40 }}>
      {/* Banner Image Container */}
      <div
        data-testid="profile-cover-banner"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
          position: 'relative',
          height: 220,
          width: '100%',
        }}
      >
        {user.coverBannerUrl ? (
          <img
            src={user.coverBannerUrl}
            alt="Profile cover banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, #1877F2 0%, #7B1FA2 50%, #E91E63 100%)',
            }}
          />
        )}

        {/* Change Cover Banner Button */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFileChange(e, onUpdateBanner)}
          />
          <Button
            data-testid="upload-banner-trigger"
            label="Change Banner"
            variant="secondary"
            size="sm"
            icon={<Icon icon={CameraIcon} size="xsm" />}
            onClick={() => bannerInputRef.current?.click()}
          />
        </div>
      </div>

      {/* Overlapping Avatar Wrapper */}
      <div
        data-testid="profile-avatar-wrapper"
        style={{
          position: 'absolute',
          bottom: -44,
          left: 32,
          zIndex: 10,
          borderRadius: 9999,
          border: '4px solid var(--color-background-body, #111111)',
          backgroundColor: 'var(--color-background-body, #111111)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />

          {/* Hidden Avatar File Input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFileChange(e, onUpdateAvatar)}
          />

          {/* Upload/Change Photo Button */}
          <button
            data-testid="upload-avatar-trigger"
            type="button"
            title="Change Profile Photo"
            aria-label="Change Profile Photo"
            onClick={() => avatarInputRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--color-background-container, #242526)',
              border: '2px solid var(--color-background-body, #111111)',
              color: 'var(--color-text-primary, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Icon icon={CameraIcon} size="xsm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeaderBanner;
