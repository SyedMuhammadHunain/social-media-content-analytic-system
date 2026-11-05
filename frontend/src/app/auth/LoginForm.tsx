// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - LoginForm

'use client';

import { useState, useRef } from 'react';
import type { FC, FormEvent, MouseEvent } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '../../context/useAuth';
import { LoginInputFields, type LoginInputErrors, type LoginInputTouched } from './LoginInputFields.tsx';
import { validateLoginField, validateLoginIdentifier, validateLoginPassword } from './loginValidation.ts';

export interface LoginFormProps {
  onToggleRegister: () => void;
}

function resolveInputValues(form: HTMLFormElement | null, stateId: string, statePass: string) {
  const emailEl = form?.querySelector<HTMLInputElement>(
    'input[name="email"], input[type="email"], input[placeholder*="email" i], input[type="text"]'
  );
  const passEl = form?.querySelector<HTMLInputElement>('input[type="password"]');
  return {
    finalIdentifier: emailEl?.value ?? stateId,
    finalPassword: passEl?.value ?? statePass,
  };
}

export const LoginForm: FC<LoginFormProps> = ({ onToggleRegister }) => {
  const { login, error, isLoading, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginInputErrors>({});
  const [touched, setTouched] = useState<LoginInputTouched>({});

  const handleBlur = (field: 'identifier' | 'password', val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateLoginField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleClearError = (field: 'identifier' | 'password') => {
    clearError();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();

    const { finalIdentifier, finalPassword } = resolveInputValues(formRef.current, identifier, password);
    const idError = validateLoginIdentifier(finalIdentifier);
    const passError = validateLoginPassword(finalPassword);

    if (idError || passError) {
      setErrors({ identifier: idError, password: passError });
      setTouched({ identifier: true, password: true });
      return;
    }

    await login(finalIdentifier, finalPassword);
  };

  const handleFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'password') {
      setPassword(target.value);
    } else {
      setIdentifier(target.value);
    }
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onInput={handleFormInput}
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

        <LoginInputFields
          identifier={identifier}
          setIdentifier={setIdentifier}
          password={password}
          setPassword={setPassword}
          errors={errors}
          touched={touched}
          onBlur={handleBlur}
          onClearError={handleClearError}
        />

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
