// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - RegisterForm

'use client';

import type { FC } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { RegisterInputFields } from './RegisterInputFields.tsx';
import { useRegisterForm } from './useRegisterForm.ts';
import { RegisterToggleLink } from './RegisterToggleLink.tsx';

export interface RegisterFormProps {
  onToggleLogin: () => void;
}

export const RegisterForm: FC<RegisterFormProps> = ({ onToggleLogin }) => {
  const {
    formRef,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    touched,
    handleBlur,
    handleInput,
    handleSubmit,
    error,
    isLoading,
    clearError,
  } = useRegisterForm();

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onInput={handleInput}
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

        <RegisterToggleLink onToggleLogin={onToggleLogin} />
      </VStack>
    </form>
  );
};

export default RegisterForm;
