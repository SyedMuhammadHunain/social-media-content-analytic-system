// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - LoginForm

'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';

export interface LoginFormProps {
  onToggleRegister: () => void;
}

export const LoginForm: FC<LoginFormProps> = ({ onToggleRegister }) => {
  const { login, error, isLoading, clearError } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier || !password) {
      return;
    }
    await login(identifier, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack gap={4} hAlign="stretch" width="100%">
        <VStack gap={1}>
          <Heading level={2}>Welcome back</Heading>
          <Text type="body" color="secondary" size="sm">
            Sign in to access your social news feed and analytics dashboard
          </Text>
        </VStack>

        {error && (
          <div data-testid="auth-error-banner">
            <Banner status="error" title="Authentication Error">
              {error}
            </Banner>
          </div>
        )}

        <VStack gap={3}>
          <TextInput
            label="Email or Username"
            type="email"
            placeholder="name@example.com or @username"
            value={identifier}
            onChange={(v) => {
              setIdentifier(v);
              clearError();
            }}
            size="lg"
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              clearError();
            }}
            size="lg"
          />
        </VStack>

        <Button
          data-testid="auth-submit-btn"
          label={isLoading ? 'Signing In...' : 'Sign In'}
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isLoading}
          onClick={() => handleSubmit()}
        />

        <VStack hAlign="center" style={{ marginTop: 8 }}>
          <Text type="supporting" color="secondary">
            Don&apos;t have an account?{' '}
            <button
              data-testid="auth-toggle-mode"
              type="button"
              onClick={onToggleRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #0171E3)',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Create Account
            </button>
          </Text>
        </VStack>
      </VStack>
    </form>
  );
};

export default LoginForm;
