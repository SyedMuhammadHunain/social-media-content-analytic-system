// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - RegisterForm

'use client';

import { useState, useRef } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const userEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="username"], input[placeholder*="username" i]'
    );
    const emailEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[type="email"], input[placeholder*="email" i]'
    );
    const passEl = formRef.current?.querySelector<HTMLInputElement>('input[type="password"]');

    const finalUsername = (userEl?.value !== undefined && userEl.value !== '') ? userEl.value : username;
    const finalEmail = (emailEl?.value !== undefined && emailEl.value !== '') ? emailEl.value : email;
    const finalPassword = (passEl?.value !== undefined && passEl.value !== '') ? passEl.value : password;

    if (!finalUsername || !finalEmail || !finalPassword) {
      return;
    }
    await register(finalUsername, finalEmail, finalPassword);
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      onInput={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'password') {
          setPassword(target.value);
        } else if (
          target.type === 'email' ||
          target.placeholder?.toLowerCase().includes('email')
        ) {
          setEmail(target.value);
        } else {
          setUsername(target.value);
        }
      }}
      style={{ width: '100%' }}
    >
      <VStack gap={4} hAlign="stretch" width="100%">
        <VStack gap={1}>
          <Heading level={2}>Create an account</Heading>
          <Text type="body" color="secondary" size="sm">
            Join the real-time social media content analysis network
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
            placeholder="Choose a username (e.g. alex_creator)"
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
            placeholder="alex@example.com"
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
          onClick={(e) => {
            e?.preventDefault?.();
            handleSubmit(e);
          }}
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
