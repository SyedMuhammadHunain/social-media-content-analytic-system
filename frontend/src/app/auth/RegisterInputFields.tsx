// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Register Input Fields

'use client';

import { VStack } from '@astryxdesign/core/Layout';
import { TextInput } from '@astryxdesign/core/TextInput';

interface RegisterInputFieldsProps {
  username: string;
  setUsername: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errors: { username?: string; email?: string; password?: string };
  touched: { username?: boolean; email?: boolean; password?: boolean };
  onBlur: (field: 'username' | 'email' | 'password', val: string) => void;
  onClearError: () => void;
}

export function RegisterInputFields({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  errors,
  touched,
  onBlur,
  onClearError,
}: RegisterInputFieldsProps) {
  return (
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
          onClearError();
        }}
        onBlur={() => onBlur('username', username)}
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
          onClearError();
        }}
        onBlur={() => onBlur('email', email)}
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
          onClearError();
        }}
        onBlur={() => onBlur('password', password)}
        size="lg"
      />
    </VStack>
  );
}
