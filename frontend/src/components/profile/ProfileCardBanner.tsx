// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Profile Card Banner & Avatar

'use client';

import { Avatar } from '@astryxdesign/core/Avatar';

interface ProfileCardBannerProps {
  name: string;
  avatarUrl?: string;
  coverBannerUrl?: string;
}

export function ProfileCardBanner({ name, avatarUrl, coverBannerUrl }: ProfileCardBannerProps) {
  return (
    <>
      <div
        style={{
          width: '100%',
          height: 64,
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface-muted, #1E293B)',
        }}
      >
        {coverBannerUrl ? (
          <img
            src={coverBannerUrl}
            alt=""
            aria-hidden="true"
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
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            }}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: -36,
          zIndex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '50%',
            border: '3px solid #FFFFFF',
            lineHeight: 0,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar name={name} src={avatarUrl || undefined} size={72} />
        </div>
      </div>
    </>
  );
}

export default ProfileCardBanner;
