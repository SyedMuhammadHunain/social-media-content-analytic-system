// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google Credentials Guide

'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { KeyIcon } from '@heroicons/react/24/outline';

export function GoogleCredentialsGuide() {
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(false);

  return (
    <div
      style={{
        borderRadius: 8,
        padding: '10px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <HStack hAlign="between" vAlign="center">
        <HStack gap={2} vAlign="center">
          <Icon icon={KeyIcon} size="xsm" color="secondary" />
          <Text type="supporting" weight="bold">
            What Google Credentials Are Required?
          </Text>
        </HStack>
        <Button
          label={showCredentialsGuide ? 'Hide' : 'View Guide'}
          variant="ghost"
          size="sm"
          onClick={() => setShowCredentialsGuide((prev) => !prev)}
        />
      </HStack>

      {showCredentialsGuide && (
        <VStack gap={2} style={{ marginTop: 10, fontSize: 13 }}>
          <Text type="supporting" color="secondary">
            To use live Google OAuth in production, create credentials in{' '}
            <strong style={{ color: '#fff' }}>Google Cloud Console</strong>:
          </Text>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#aaa', lineHeight: 1.6 }}>
            <li>
              <strong style={{ color: '#fff' }}>Client ID:</strong> Type Web Application (e.g.{' '}
              <code>...apps.googleusercontent.com</code>)
            </li>
            <li>
              <strong style={{ color: '#fff' }}>Authorized JavaScript Origin:</strong>{' '}
              <code>http://localhost:5173</code>
            </li>
            <li>
              <strong style={{ color: '#fff' }}>Authorized Redirect URI:</strong>{' '}
              <code>http://localhost:5173</code>
            </li>
            <li>
              <strong style={{ color: '#fff' }}>Required Scopes:</strong> <code>email</code>,{' '}
              <code>profile</code>, <code>openid</code>
            </li>
            <li>
              <strong style={{ color: '#fff' }}>Setup:</strong> Put <code>VITE_GOOGLE_CLIENT_ID</code> in{' '}
              <code>frontend/.env</code>.
            </li>
          </ul>
          <Text type="supporting" color="secondary" style={{ fontStyle: 'italic', marginTop: 4 }}>
            Note: In local dev, no Google Cloud project is needed—you can click any account above to sign in
            instantly!
          </Text>
        </VStack>
      )}
    </div>
  );
}
