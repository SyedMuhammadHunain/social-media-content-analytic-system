// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - RegisterForm

'use client';

import { useState, useRef } from 'react';
import type { FC, FormEvent, MouseEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';

export interface RegisterFormProps {
  onToggleLogin: () => void;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const RegisterForm: FC<RegisterFormProps> = ({ onToggleLogin }) => {
  const { register, error, isLoading, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    username?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});

  const validateField = (field: 'username' | 'email' | 'password', val: string) => {
    const trimmed = val.trim();
    if (field === 'username') {
      if (!trimmed) return 'Username is required.';
      if (trimmed.length < 3 || trimmed.length > 20) {
        return 'Username must be between 3 and 20 characters.';
      }
      if (!USERNAME_REGEX.test(trimmed)) {
        return 'Username can only contain letters, numbers, and underscores.';
      }
    }
    if (field === 'email') {
      if (!trimmed) return 'Email is required.';
      if (!EMAIL_REGEX.test(trimmed)) {
        return 'Please enter a valid email address.';
      }
    }
    if (field === 'password') {
      if (!val) return 'Password is required.';
      if (val.length < 8) return 'Password must be at least 8 characters.';
      if (!PASSWORD_COMPLEXITY_REGEX.test(val)) {
        return 'Password must contain at least one letter and one number.';
      }
    }
    return undefined;
  };

  const handleBlur = (field: 'username' | 'email' | 'password', val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();

    const userEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="username"], input[placeholder*="username" i]'
    );
    const emailEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[type="email"], input[placeholder*="email" i]'
    );
    const passEl = formRef.current?.querySelector<HTMLInputElement>('input[type="password"]');

    const finalUsername = userEl?.value ?? username;
    const finalEmail = emailEl?.value ?? email;
    const finalPassword = passEl?.value ?? password;

    const uErr = validateField('username', finalUsername);
    const eErr = validateField('email', finalEmail);
    const pErr = validateField('password', finalPassword);

    if (uErr || eErr || pErr) {
      setErrors({ username: uErr, email: eErr, password: pErr });
      setTouched({ username: true, email: true, password: true });
      return;
    }

    await register(finalUsername, finalEmail, finalPassword);
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
            status={
              touched.username && errors.username
                ? { type: 'error', message: errors.username }
                : undefined
            }
            onChange={(v) => {
              setUsername(v);
              clearError();
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            onBlur={() => handleBlur('username', username)}
            size="lg"
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="alex@example.com"
            value={email}
            status={
              touched.email && errors.email
                ? { type: 'error', message: errors.email }
                : undefined
            }
            onChange={(v) => {
              setEmail(v);
              clearError();
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => handleBlur('email', email)}
            size="lg"
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
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
          label={isLoading ? 'Creating Account...' : 'Create Account'}
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isLoading}
          onClick={handleSubmit}
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
