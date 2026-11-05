// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Validation Utility

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateUsername(val: string): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) return 'Username is required.';
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Username must be between 3 and 20 characters.';
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  return undefined;
}

export function validateEmail(val: string): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) return 'Email is required.';
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return undefined;
}

export function validatePassword(val: string): string | undefined {
  if (!val) return 'Password is required.';
  if (val.length < 8) return 'Password must be at least 8 characters.';
  if (!PASSWORD_COMPLEXITY_REGEX.test(val)) {
    return 'Password must contain at least one letter and one number.';
  }
  return undefined;
}

export function validateField(field: 'username' | 'email' | 'password', val: string): string | undefined {
  if (field === 'username') return validateUsername(val);
  if (field === 'email') return validateEmail(val);
  if (field === 'password') return validatePassword(val);
  return undefined;
}
