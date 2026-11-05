// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google Account List

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Icon } from '@astryxdesign/core/Icon';
import { UserPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export interface GoogleAccountOption {
  name: string;
  email: string;
  avatarUrl: string;
  headline?: string;
  googleId?: string;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: 'Syed Muhammad Hunain',
    email: 'hunain.creator@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'Current Active Account',
    googleId: 'google_hunain_creator',
  },
  {
    name: 'Afzal Khan',
    email: 'afzal.khan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Google Verified Creator',
    googleId: 'google_afzal_khan',
  },
  {
    name: 'Alice Walker',
    email: 'alice.walker@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'Google Workspace Account',
    googleId: 'google_alice_walker',
  },
];

interface GoogleAccountListProps {
  accounts?: GoogleAccountOption[];
  isLoading: boolean;
  onSelectAccount: (acc: GoogleAccountOption) => void;
  onUseCustomAccount: () => void;
}

export function GoogleAccountList({
  accounts = PRESET_GOOGLE_ACCOUNTS,
  isLoading,
  onSelectAccount,
  onUseCustomAccount,
}: GoogleAccountListProps) {
  return (
    <VStack gap={2}>
      <Text type="label" color="secondary">
        Choose an account
      </Text>

      {accounts.map((acc, index) => (
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
            <Avatar name={acc.name} src={acc.avatarUrl || undefined} size="md" />
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
        onClick={onUseCustomAccount}
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
  );
}
