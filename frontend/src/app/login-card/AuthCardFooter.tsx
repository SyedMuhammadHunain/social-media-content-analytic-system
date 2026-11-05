// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Auth Card Footer

'use client';

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';

interface AuthCardFooterProps {
  authMode: 'login' | 'signup';
  onToggleMode: () => void;
}

export function AuthCardFooter({ authMode, onToggleMode }: AuthCardFooterProps) {
  return (
    <>
      <HStack hAlign="center" gap={1} vAlign="center">
        <Text type="body" size="sm" color="secondary">
          {authMode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}
        </Text>
        <Link
          href="#"
          type="body"
          size="sm"
          hasUnderline
          data-testid="auth-toggle-mode-btn"
          onClick={(e) => {
            e?.preventDefault();
            onToggleMode();
          }}
        >
          {authMode === 'login' ? 'Sign up' : 'Log in'}
        </Link>
      </HStack>

      <VStack hAlign="center" width="100%">
        <Text type="supporting" color="secondary" justify="center">
          By clicking continue, you agree to our{' '}
          <Link href="#" type="supporting">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" type="supporting">
            Privacy Policy
          </Link>
          .
        </Text>
      </VStack>
    </>
  );
}
