// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Login Split Card Template

'use client';

import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Section } from '@astryxdesign/core/Section';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Icon } from '@astryxdesign/core/Icon';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body, #111111)',
};

const cardWrap: CSSProperties = {
  width: '100%',
  maxWidth: 1000,
  marginInline: 'auto',
};

const LOGIN_SPLIT_CSS = `
.login-split-grid {
  container-type: inline-size;
  container-name: login-split;
  padding: var(--spacing-8, 32px);
}
.login-split-brand {
  width: 100%;
  order: 0;
}
@container login-split (max-width: 600px) {
  .login-split-grid {
    padding: var(--spacing-4, 16px);
  }
  .login-split-brand {
    order: -1;
  }
}
`;

export const AuthPage: FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <Center axis="both" padding={6} style={pageStyle}>
      <style>{LOGIN_SPLIT_CSS}</style>

      <div style={cardWrap} data-testid="auth-split-card">
        <Card padding={0} width="100%">
          <Grid
            columns={{ minWidth: 320, repeat: 'fit' }}
            gap={8}
            align="stretch"
            className="login-split-grid"
          >
            {/* Form Pane (Left) */}
            <Section
              variant="transparent"
              padding={0}
              height="100%"
              data-testid="auth-form-pane"
            >
              <VStack gap={5} height="100%" hAlign="stretch">
                {/* Branding Header */}
                <HStack gap={2} vAlign="center">
                  <Icon icon={SparklesIcon} size="md" style={{ color: '#0171E3' }} />
                  <Heading level={4}>Social Media Content Analysis</Heading>
                </HStack>

                <StackItem size="fill">
                  <Center axis="vertical" height="100%">
                    {isRegister ? (
                      <RegisterForm onToggleLogin={() => setIsRegister(false)} />
                    ) : (
                      <LoginForm onToggleRegister={() => setIsRegister(true)} />
                    )}
                  </Center>
                </StackItem>

                <VStack hAlign="center">
                  <Text type="supporting" color="secondary" size="sm">
                    Protected by Meta Astryx Design System • OOAD CT-263
                  </Text>
                </VStack>
              </VStack>
            </Section>

            {/* Brand Visual Pane (Right) */}
            <div className="login-split-brand" data-testid="auth-brand-pane">
              <Card
                variant="transparent"
                padding={6}
                width="100%"
                height="100%"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(1, 113, 227, 0.15) 0%, rgba(123, 31, 162, 0.25) 50%, rgba(233, 30, 99, 0.2) 100%)',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 380,
                }}
              >
                <VStack gap={5} align="stretch">
                  <HStack hAlign="between" vAlign="center">
                    <Badge variant="purple" label="500M DAU Scale" />
                    <Badge variant="teal" label="Real-time Telemetry" />
                  </HStack>

                  <VStack gap={2}>
                    <Heading level={2}>
                      High-Scale Social Telemetry & Creator Analytics
                    </Heading>
                    <Text type="body" color="secondary">
                      Designed for sub-second fan-out, event-driven news feeds, and live engagement metrics.
                    </Text>
                  </VStack>

                  <VStack gap={3}>
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: 'rgba(1, 113, 227, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0171E3',
                        }}
                      >
                        <Icon icon={ChartBarIcon} size="sm" />
                      </div>
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          Real-Time Dashboard Graphs
                        </Text>
                        <Text type="supporting" color="secondary">
                          Live like/unlike, follower changes, and engagement tracking.
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#10B981',
                        }}
                      >
                        <Icon icon={ArrowTrendingUpIcon} size="sm" />
                      </div>
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          Pre-computed News Feed Fan-out
                        </Text>
                        <Text type="supporting" color="secondary">
                          High throughput caching delivering chronological updates.
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: 'rgba(236, 72, 153, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#EC4899',
                        }}
                      >
                        <Icon icon={ShieldCheckIcon} size="sm" />
                      </div>
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          Microservices & NoSQL Architecture
                        </Text>
                        <Text type="supporting" color="secondary">
                          Independent write services for 2.5B daily user interactions.
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </VStack>

                <HStack hAlign="between" vAlign="center" style={{ marginTop: 24 }}>
                  <Text type="supporting" color="secondary">
                    Object Oriented Analysis & Design
                  </Text>
                  <Text type="supporting" weight="bold" color="primary">
                    CT-263
                  </Text>
                </HStack>
              </Card>
            </div>
          </Grid>
        </Card>
      </div>
    </Center>
  );
};

export default AuthPage;
