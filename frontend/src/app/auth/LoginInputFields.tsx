// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Login Input Fields

'use client';

import { VStack } from '@astryxdesign/core/Layout';
import { TextInput } from '@astryxdesign/core/TextInput';

export interface LoginInputErrors {
  identifier?: string;
  password?: string;
}

export interface LoginInputTouched {
  identifier?: boolean;
  password?: boolean;
}

interface LoginInputFieldsProps {
  identifier: string;
  setIdentifier: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errors: LoginInputErrors;
  touched: LoginInputTouched;
  onBlur: (field: 'identifier' | 'password', val: string) => void;
  onClearError: (field: 'identifier' | 'password') => void;
}

export function LoginInputFields({
  identifier,
  setIdentifier,
  password,
  setPassword,
  errors,
  touched,
  onBlur,
  onClearError,
}: LoginInputFieldsProps) {
  const identifierStatus =
    touched.identifier && errors.identifier
      ? { type: 'error' as const, message: errors.identifier }
      : undefined;

  const passwordStatus =
    touched.password && errors.password
      ? { type: 'error' as const, message: errors.password }
      : undefined;

  return (
    <VStack gap={3}>
      <TextInput
        label="Email or Username"
        type="text"
        htmlName="email"
        placeholder="name@example.com or @username"
        value={identifier}
        status={identifierStatus}
        onChange={(v) => {
          setIdentifier(v);
          onClearError('identifier');
        }}
        onBlur={() => onBlur('identifier', identifier)}
        size="lg"
      />

      <TextInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        status={passwordStatus}
        onChange={(v) => {
          setPassword(v);
          onClearError('password');
        }}
        onBlur={() => onBlur('password', password)}
        size="lg"
      />
    </VStack>
  );
}

export default LoginInputFields;
