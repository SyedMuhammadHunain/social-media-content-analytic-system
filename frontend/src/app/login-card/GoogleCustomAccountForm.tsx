// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google Custom Account Form

'use client';

import { useState, type FormEvent } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';

interface GoogleCustomAccountFormProps {
  isLoading: boolean;
  onSubmit: (account: { name: string; email: string; avatarUrl: string; googleId: string }) => void;
  onBack: () => void;
}

export function GoogleCustomAccountForm({
  isLoading,
  onSubmit,
  onBack,
}: GoogleCustomAccountFormProps) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!customEmail.trim()) return;
    const cleanName = customName.trim() || customEmail.split('@')[0];
    const cleanEmail = customEmail.trim().toLowerCase();
    onSubmit({
      name: cleanName,
      email: cleanEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      googleId: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });
  };

  const handleFillDemo = (name: string, email: string) => {
    setCustomName(name);
    setCustomEmail(email);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack gap={3}>
        <HStack hAlign="between" vAlign="center">
          <Text type="label" color="secondary">
            Enter Google Account Details
          </Text>
          <Button
            label="Back to saved accounts"
            variant="ghost"
            size="sm"
            onClick={onBack}
          />
        </HStack>

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
          onClick={handleSubmit}
        />
      </VStack>
    </form>
  );
}
