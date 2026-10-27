// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Astryx Auth Quick Demo Sign-In Bar

import type { FC } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

export interface AuthQuickDemoBarProps {
  onQuickSignIn: () => Promise<void>;
}

export const AuthQuickDemoBar: FC<AuthQuickDemoBarProps> = ({ onQuickSignIn }) => {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderRadius: 10,
        backgroundColor: 'rgba(1, 113, 227, 0.08)',
        border: '1px dashed rgba(1, 113, 227, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text type="supporting" color="secondary" size="sm">
        Default: <strong style={{ color: '#93c5fd' }}>hunain_creator</strong>
      </Text>
      <Button
        variant="secondary"
        size="sm"
        label="One-Click Demo Sign In"
        onClick={(ev) => {
          ev.preventDefault();
          onQuickSignIn();
        }}
      />
    </div>
  );
};
