// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Astryx Social Auth Buttons

import type { FC } from 'react';
import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';

export const GOOGLE_LOGO_URL =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M22.56%2012.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26%201.37-1.04%202.53-2.21%203.31v2.77h3.57c2.08-1.92%203.28-4.74%203.28-8.09z%22%2F%3E%3Cpath%20fill%3D%22%2334A853%22%20d%3D%22M12%2023c2.97%200%205.46-.98%207.28-2.66l-3.57-2.77c-.98.66-2.23%201.06-3.71%201.06-2.86%200-5.29-1.93-6.16-4.53H2.18v2.84C3.99%2020.53%207.7%2023%2012%2023z%22%2F%3E%3Cpath%20fill%3D%22%23FBBC05%22%20d%3D%22M5.84%2014.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43%208.55%201%2010.22%201%2012s.43%203.45%201.18%204.94l2.85-2.22.81-.63z%22%2F%3E%3Cpath%20fill%3D%22%23EA4335%22%20d%3D%22M12%205.38c1.62%200%203.06.56%204.21%201.64l3.15-3.15C17.45%202.09%2014.97%201%2012%201%207.7%201%203.99%203.47%202.18%207.06l3.66%202.84c.87-2.6%203.3-4.52%206.16-4.52z%22%2F%3E%3C%2Fsvg%3E';

export interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  isLoading?: boolean;
}

export const SocialAuthButtons: FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  isLoading = false,
}) => {
  return (
    <HStack hAlign="center" width="100%">
      <div data-testid="auth-google-btn" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          data-testid="auth-continue-with-google-btn"
          label={isLoading ? 'Connecting to Google...' : 'Continue with Google'}
          variant="secondary"
          size="lg"
          width="100%"
          icon={<img src={GOOGLE_LOGO_URL} alt="Google logo" width={18} height={18} />}
          isDisabled={isLoading}
          onClick={(ev) => {
            ev.preventDefault();
            onGoogleClick?.();
          }}
        />
      </div>
    </HStack>
  );
};
