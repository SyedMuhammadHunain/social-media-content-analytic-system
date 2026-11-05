// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Login Validation

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginIdentifier(val: string): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) return 'Email or username is required.';
  if (trimmed.includes('@') && !EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  if (!trimmed.includes('@') && trimmed.length < 3) {
    return 'Username must be at least 3 characters.';
  }
  return undefined;
}

export function validateLoginPassword(val: string): string | undefined {
  if (!val) return 'Password is required.';
  if (val.length < 6) return 'Password must be at least 6 characters.';
  return undefined;
}

export function validateLoginField(field: 'identifier' | 'password', val: string): string | undefined {
  if (field === 'identifier') return validateLoginIdentifier(val);
  return validateLoginPassword(val);
}
