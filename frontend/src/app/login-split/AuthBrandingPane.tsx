// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Astryx Auth Branding Pane

import type { CSSProperties, FC } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';

const COVER_IMAGE_URL = '/favicon.png';

const coverImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

export const AuthBrandingPane: FC = () => {
  return (
    <div className="login-split-image" data-testid="auth-brand-pane">
      <Card
        variant="transparent"
        padding={0}
        width="100%"
        height="100%"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          minHeight: 460,
        }}
      >
        <img
          style={coverImageStyle}
          src={COVER_IMAGE_URL}
          alt="Social media content analysis studio"
        />
        {/* Subtle ambient gradient overlay & platform badges */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(10, 15, 29, 0.75) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 24,
            pointerEvents: 'none',
          }}
        >
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <span
                style={{
                  backgroundColor: 'rgba(1, 113, 227, 0.35)',
                  color: '#93c5fd',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 12,
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(1, 113, 227, 0.4)',
                }}
              >
                500M DAU SCALE
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.35)',
                  color: '#6ee7b7',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 12,
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                REAL-TIME TELEMETRY
              </span>
            </HStack>
            <Text
              type="display-2"
              as="h3"
              weight="bold"
              style={{ color: '#ffffff', margin: 0 }}
            >
              High-Throughput Analytics &amp; Feed
            </Text>
            <Text type="supporting" size="sm" style={{ color: '#cbd5e1' }}>
              Sub-50ms fan-out caching, event-driven metrics &amp; creator intelligence.
            </Text>
          </VStack>
        </div>
      </Card>
    </div>
  );
};
