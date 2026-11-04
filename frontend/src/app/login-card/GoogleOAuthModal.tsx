// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google Authentication Modal

'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Divider } from '@astryxdesign/core/Divider';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Icon } from '@astryxdesign/core/Icon';
import {
  XMarkIcon,
  UserPlusIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const GOOGLE_LOGO_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export interface GoogleAccountOption {
  name: string;
  email: string;
  avatarUrl: string;
  headline?: string;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: 'Syed Muhammad Hunain',
    email: 'hunain.creator@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'Current Active Account',
  },
  {
    name: 'Afzal Khan',
    email: 'afzal.khan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Google Verified Creator',
  },
  {
    name: 'Alice Walker',
    email: 'alice.walker@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'Google Workspace Account',
  },
];

export interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string; avatarUrl?: string }) => void;
  isLoading?: boolean;
}

export const GoogleOAuthModal: FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!customEmail.trim()) return;
    const cleanName = customName.trim() || customEmail.split('@')[0];
    onSelectAccount({
      name: cleanName,
      email: customEmail.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  const handleFillDemo = (name: string, email: string) => {
    setCustomName(name);
    setCustomEmail(email);
  };

  return (
    <div
      data-testid="google-auth-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        <Card padding={6}>
          <VStack gap={4}>
            {/* Modal Header */}
            <HStack hAlign="between" vAlign="center">
              <HStack gap={3} vAlign="center">
                {GOOGLE_LOGO_SVG}
                <VStack gap={0}>
                  <Heading level={3}>Sign in with Google</Heading>
                  <Text type="supporting" color="secondary">
                    to continue to Social Media Content Analysis
                  </Text>
                </VStack>
              </HStack>
              <Button
                label="Close"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<Icon icon={XMarkIcon} size="sm" />}
                onClick={onClose}
                isDisabled={isLoading}
              />
            </HStack>

            <Divider />

            {/* Account Selection */}
            {!showCustomInput ? (
              <VStack gap={2}>
                <Text type="label" color="secondary">
                  Choose an account
                </Text>

                {PRESET_GOOGLE_ACCOUNTS.map((acc, index) => (
                  <button
                    key={acc.email}
                    type="button"
                    data-testid={`google-account-option-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
                      backgroundColor: 'var(--color-surface-subtle, rgba(255, 255, 255, 0.04))',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    }}
                    disabled={isLoading}
                    onClick={() => onSelectAccount(acc)}
                  >
                    <HStack gap={3} vAlign="center">
                      <Avatar name={acc.name} src={acc.avatarUrl} size="md" />
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          {acc.name}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {acc.email}
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon icon={ArrowRightIcon} size="xsm" color="secondary" />
                  </button>
                ))}

                <button
                  type="button"
                  data-testid="google-use-custom-account-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px dashed var(--color-border, rgba(255, 255, 255, 0.2))',
                    backgroundColor: 'transparent',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    marginTop: 4,
                  }}
                  disabled={isLoading}
                  onClick={() => setShowCustomInput(true)}
                >
                  <Icon icon={UserPlusIcon} size="sm" color="primary" />
                  <VStack gap={0}>
                    <Text type="body" color="primary">
                      Use another Google account
                    </Text>
                    <Text type="supporting" color="secondary">
                      Sign in with your custom email
                    </Text>
                  </VStack>
                </button>
              </VStack>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} style={{ width: '100%' }}>
                <VStack gap={3}>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="label" color="secondary">
                      Enter Google Account Details
                    </Text>
                    <Button
                      label="Back to saved accounts"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomInput(false)}
                    />
                  </HStack>

                  {/* Quick Fill Suggestions */}
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="supporting" color="secondary" size="sm">
                      Quick Fill:
                    </Text>
                    <button
                      type="button"
                      style={{
                        background: 'rgba(66, 133, 244, 0.15)',
                        border: '1px solid rgba(66, 133, 244, 0.4)',
                        color: '#8ab4f8',
                        padding: '4px 10px',
                        borderRadius: 16,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleFillDemo('Afzal Khan', 'afzal.khan@gmail.com')}
                    >
                      Afzal Khan
                    </button>
                    <button
                      type="button"
                      style={{
                        background: 'rgba(52, 168, 83, 0.15)',
                        border: '1px solid rgba(52, 168, 83, 0.4)',
                        color: '#81c995',
                        padding: '4px 10px',
                        borderRadius: 16,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleFillDemo('Syed Muhammad Hunain', 'hunain.creator@gmail.com')}
                    >
                      Hunain
                    </button>
                  </HStack>

                  <TextInput
                    data-testid="google-custom-name-input"
                    label="Full Name"
                    placeholder="e.g. Syed Muhammad Hunain"
                    value={customName}
                    onChange={(v) => setCustomName(v)}
                    size="md"
                  />

                  <TextInput
                    data-testid="google-custom-email-input"
                    label="Google Email"
                    placeholder="name@gmail.com"
                    type="email"
                    value={customEmail}
                    onChange={(v) => setCustomEmail(v)}
                    size="md"
                  />

                  <Button
                    data-testid="google-custom-submit-btn"
                    label={isLoading ? 'Signing In with Google...' : 'Continue with this Google Account'}
                    variant="primary"
                    size="lg"
                    type="submit"
                    isDisabled={!customEmail.trim() || isLoading}
                    isLoading={isLoading}
                    onClick={handleCustomSubmit}
                  />
                </VStack>
              </form>
            )}

            <Divider />

            {/* Google Cloud Credentials Guide Accordion */}
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

            {/* Google OAuth Security Disclaimer */}
            <HStack gap={2} vAlign="start">
              <Icon icon={InformationCircleIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary" size="sm">
                Google will verify your account and share your name, email, and avatar with the Social Media Content
                Analysis System.
              </Text>
            </HStack>
          </VStack>
        </Card>
      </div>
    </div>
  );
};

export default GoogleOAuthModal;
