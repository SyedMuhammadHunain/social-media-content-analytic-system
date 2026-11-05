// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Header Banner (PDF Section 4.1.i)

'use client';

import { useState, useRef, type ChangeEvent, type RefObject } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { CameraIcon } from '@heroicons/react/24/outline';
import type { UserProfile } from '../../types/social';
import { mediaApi } from '../../api/mediaApi.ts';
import { normalizeBackendUserId } from '../../mock/authSeedData.ts';

export interface ProfileHeaderBannerProps {
  user: UserProfile;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  isOwnProfile?: boolean;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateBanner?: (newBannerUrl: string) => void;
}

export function ProfileHeaderBanner({
  user,
  avatarInputRef,
  isOwnProfile = true,
  onUpdateAvatar,
  onUpdateBanner,
}: ProfileHeaderBannerProps) {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const uploadAndCallback = async (
    file: File,
    setIsUploading: (val: boolean) => void,
    callback?: (url: string) => void
  ) => {
    setIsUploading(true);
    const contentType = file.type || 'image/jpeg';
    const effectiveUserId = normalizeBackendUserId(user.id);

    try {
      const presign = await mediaApi.getPresignedUploadUrl({
        userId: effectiveUserId,
        fileName: file.name,
        contentType,
      });

      if (presign && presign.uploadUrl) {
        await mediaApi.uploadBlob(presign.uploadUrl, file, contentType);
        if (presign.publicBlobUrl) {
          callback?.(presign.publicBlobUrl);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Azure cloud upload failed, falling back to local object URL:', err);
    } finally {
      setIsUploading(false);
    }

    // Fallback: Local object URL or base64 so user is never blocked
    const localUrl = URL.createObjectURL(file);
    callback?.(localUrl);
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setIsUploading: (val: boolean) => void,
    callback?: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAndCallback(file, setIsUploading, callback);
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

        {/* Change Cover Banner Button - only for profile owner */}
        {isOwnProfile && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFileChange(e, setIsUploadingBanner, onUpdateBanner)}
            />
            <Button
              data-testid="upload-banner-trigger"
              label={isUploadingBanner ? 'Uploading...' : 'Change Banner'}
              variant="secondary"
              size="sm"
              isDisabled={isUploadingBanner}
              isLoading={isUploadingBanner}
              icon={<Icon icon={CameraIcon} size="xsm" />}
              onClick={() => bannerInputRef.current?.click()}
            />
          </div>
        )}
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
          <Avatar name={user.name} src={user.avatarUrl || undefined} size="xl" />

          {/* Hidden Avatar File Input & Trigger - only for profile owner */}
          {isOwnProfile && (
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e, setIsUploadingAvatar, onUpdateAvatar)}
              />

              <button
                data-testid="upload-avatar-trigger"
                type="button"
                title={isUploadingAvatar ? 'Uploading Profile Photo...' : 'Change Profile Photo'}
                aria-label={isUploadingAvatar ? 'Uploading Profile Photo...' : 'Change Profile Photo'}
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: isUploadingAvatar
                    ? 'var(--color-background-subtle, #404040)'
                    : 'var(--color-background-surface, #262626)',
                  border: '2px solid var(--color-background-body, #111111)',
                  color: 'var(--color-text-primary, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  opacity: isUploadingAvatar ? 0.7 : 1,
                }}
              >
                <Icon icon={CameraIcon} size="xsm" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeaderBanner;
