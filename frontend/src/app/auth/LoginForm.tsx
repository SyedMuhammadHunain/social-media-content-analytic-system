// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - LoginForm

'use client';

import { useState, useRef } from 'react';
import type { FC, FormEvent, MouseEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';

export interface LoginFormProps {
  onToggleRegister: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm: FC<LoginFormProps> = ({ onToggleRegister }) => {
  const { login, error, isLoading, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});

  const validateField = (field: 'identifier' | 'password', val: string) => {
    const trimmed = val.trim();
    if (field === 'identifier') {
      if (!trimmed) return 'Email or username is required.';
      if (trimmed.includes('@') && !EMAIL_REGEX.test(trimmed)) {
        return 'Please enter a valid email address.';
      }
      if (!trimmed.includes('@') && trimmed.length < 3) {
        return 'Username must be at least 3 characters.';
      }
    }
    if (field === 'password') {
      if (!val) return 'Password is required.';
      if (val.length < 6) return 'Password must be at least 6 characters.';
    }
    return undefined;
  };

  const handleBlur = (field: 'identifier' | 'password', val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();

    const emailEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="email"], input[type="email"], input[placeholder*="email" i], input[type="text"]'
    );
    const passEl = formRef.current?.querySelector<HTMLInputElement>('input[type="password"]');

    const finalIdentifier = emailEl?.value ?? identifier;
    const finalPassword = passEl?.value ?? password;

    const idError = validateField('identifier', finalIdentifier);
    const passError = validateField('password', finalPassword);

    if (idError || passError) {
      setErrors({ identifier: idError, password: passError });
      setTouched({ identifier: true, password: true });
      return;
    }

    await login(finalIdentifier, finalPassword);
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onInput={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'password') {
          setPassword(target.value);
        } else {
          setIdentifier(target.value);
        }
      }}
      style={{ width: '100%' }}
    >
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
            type="text"
            htmlName="email"
            placeholder="name@example.com or @username"
            value={identifier}
            status={
              touched.identifier && errors.identifier
                ? { type: 'error', message: errors.identifier }
                : undefined
            }
            onChange={(v) => {
              setIdentifier(v);
              clearError();
              if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
            }}
            onBlur={() => handleBlur('identifier', identifier)}
            size="lg"
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            status={
              touched.password && errors.password
                ? { type: 'error', message: errors.password }
                : undefined
            }
            onChange={(v) => {
              setPassword(v);
              clearError();
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            onBlur={() => handleBlur('password', password)}
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
          onClick={handleSubmit}
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
