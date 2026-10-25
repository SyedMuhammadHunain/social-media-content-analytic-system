// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - RegisterForm

'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';

export interface RegisterFormProps {
  onToggleLogin: () => void;
}

export const RegisterForm: FC<RegisterFormProps> = ({ onToggleLogin }) => {
  const { register, error, isLoading, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !email || !password) {
      return;
    }
    await register(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack gap={4} hAlign="stretch" width="100%">
        <VStack gap={1}>
          <Heading level={2}>Create an Account</Heading>
          <Text type="body" color="secondary" size="sm">
            Join the 500M DAU Social Media Content Analysis System
          </Text>
        </VStack>

        {error && (
          <div data-testid="auth-error-banner">
            <Banner status="error" title="Registration Error">
              {error}
            </Banner>
          </div>
        )}

        <VStack gap={3}>
          <TextInput
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(v) => {
              setUsername(v);
              clearError();
            }}
            size="lg"
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(v) => {
              setEmail(v);
              clearError();
            }}
            size="lg"
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
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
          label={isLoading ? 'Creating Account...' : 'Create Account'}
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isLoading}
          onClick={() => handleSubmit()}
        />

        <VStack hAlign="center" style={{ marginTop: 8 }}>
          <Text type="supporting" color="secondary">
            Already have an account?{' '}
            <button
              data-testid="auth-toggle-mode"
              type="button"
              onClick={onToggleLogin}
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
              Sign In
            </button>
          </Text>
        </VStack>
      </VStack>
    </form>
  );
};

export default RegisterForm;
