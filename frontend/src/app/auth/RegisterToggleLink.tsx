// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Register Form Toggle Link

'use client';

import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';

export function RegisterToggleLink({ onToggleLogin }: { onToggleLogin: () => void }) {
  return (
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
            fontSize: 'inherit',
            textDecoration: 'underline',
          }}
        >
          Log in
        </button>
      </Text>
    </VStack>
  );
}
