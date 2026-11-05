// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - RegisterForm

'use client';

import { useState, useRef } from 'react';
import type { FC, FormEvent, MouseEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';
import { RegisterInputFields } from './RegisterInputFields.tsx';
import { validateField } from './authValidation.ts';

export interface RegisterFormProps {
  onToggleLogin: () => void;
}

function extractFormValues(
  form: HTMLFormElement | null,
  current: { username: string; email: string; password: string }
) {
  const userEl = form?.querySelector<HTMLInputElement>('input[name="username"], input[placeholder*="username" i]');
  const emailEl = form?.querySelector<HTMLInputElement>('input[type="email"], input[placeholder*="email" i]');
  const passEl = form?.querySelector<HTMLInputElement>('input[type="password"]');
  return {
    username: userEl?.value ?? current.username,
    email: emailEl?.value ?? current.email,
    password: passEl?.value ?? current.password,
  };
}

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

  const handleBlur = (field: 'username' | 'email' | 'password', val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();

    const { username: finalUsername, email: finalEmail, password: finalPassword } = extractFormValues(formRef.current, {
      username,
      email,
      password,
    });

    const uErr = validateField('username', finalUsername);
    const eErr = validateField('email', finalEmail);
    const pErr = validateField('password', finalPassword);

    const hasErrors = Boolean(uErr || eErr || pErr);
    if (hasErrors) {
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

        <RegisterInputFields
          username={username}
          setUsername={(v) => {
            setUsername(v);
            clearError();
            if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
          }}
          email={email}
          setEmail={(v) => {
            setEmail(v);
            clearError();
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          password={password}
          setPassword={(v) => {
            setPassword(v);
            clearError();
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          errors={errors}
          touched={touched}
          onBlur={handleBlur}
          onClearError={clearError}
        />

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
