// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Astryx Login Split Card Template

'use client';

import { useState, useRef, type CSSProperties, type FormEvent, type MouseEvent } from 'react';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Banner } from '@astryxdesign/core/Banner';
import { TextInput } from '@astryxdesign/core/TextInput';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Divider } from '@astryxdesign/core/Divider';
import { useAuth } from '../../context/useAuth';

// Cinematic high-resolution 3D abstract fluid artwork for creative & data analytics studio
const COVER_IMAGE_URL = '/favicon.png';

const APPLE_LOGO_URL =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20170%20170%22%20fill%3D%22white%22%3E%3Cpath%20d%3D%22M150.37%20130.25c-2.45%205.66-5.35%2010.87-8.71%2015.66-4.58%206.53-8.33%2011.05-11.22%2013.56-4.48%204.12-9.28%206.23-14.42%206.35-3.69%200-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58%200-9.49%201.05-14.75%203.17-5.26%202.13-9.5%203.24-12.74%203.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.86-12-14.45-6.96-10.65-12.28-22.75-15.96-36.31-3.69-13.56-5.53-26.31-5.53-38.26%200-14.99%203.52-27.42%2010.57-37.3%207.05-9.87%2016.32-14.9%2027.81-15.08%204.13%200%209.07%201.06%2014.83%203.17%205.76%202.12%209.61%203.23%2011.55%203.35%201.52-.12%205.56-1.28%2012.12-3.48%206.56-2.2%2012.06-3.16%2016.5-2.88%2012.59.87%2022.84%205.37%2030.74%2013.51-11.06%206.74-16.48%2016.14-16.27%2028.2.22%209.68%203.99%2017.75%2011.31%2024.2%207.32%206.45%2016.12%2010.15%2026.4%2011.11-2.28%207.18-5.18%2014.75-8.7%2022.71zM119.22%2031.84c0-7.39%202.65-14.28%207.95-20.67%205.3-6.39%2011.83-10.42%2019.59-12.09.22%201.3.33%202.5.33%203.6%200%207.39-2.8%2014.53-8.4%2021.43-5.6%206.9-12.33%2010.9-20.19%2012-0.21-1.3-.32-2.31-.32-4.27z%22%2F%3E%3C%2Fsvg%3E';

const GOOGLE_LOGO_URL =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M22.56%2012.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26%201.37-1.04%202.53-2.21%203.31v2.77h3.57c2.08-1.92%203.28-4.74%203.28-8.09z%22%2F%3E%3Cpath%20fill%3D%22%2334A853%22%20d%3D%22M12%2023c2.97%200%205.46-.98%207.28-2.66l-3.57-2.77c-.98.66-2.23%201.06-3.71%201.06-2.86%200-5.29-1.93-6.16-4.53H2.18v2.84C3.99%2020.53%207.7%2023%2012%2023z%22%2F%3E%3Cpath%20fill%3D%22%23FBBC05%22%20d%3D%22M5.84%2014.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43%208.55%201%2010.22%201%2012s.43%203.45%201.18%204.94l2.85-2.22.81-.63z%22%2F%3E%3Cpath%20fill%3D%22%23EA4335%22%20d%3D%22M12%205.38c1.62%200%203.06.56%204.21%201.64l3.15-3.15C17.45%202.09%2014.97%201%2012%201%207.7%201%203.99%203.47%202.18%207.06l3.66%202.84c.87-2.6%203.3-4.52%206.16-4.52z%22%2F%3E%3C%2Fsvg%3E';

// Grid emits minmax(MIN, 1fr) where MIN is a hard floor, so MIN plus the
// grid inset and page padding must fit the narrowest phone or the column is
// clipped. 320 − 2×24 (page) − 2×16 (stacked inset) = 240.
const COLUMN_MIN_WIDTH = 240;

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body, #111111)',
};

const cardWrap: CSSProperties = {
  width: '100%',
  maxWidth: 1000,
  marginInline: 'auto',
};

const coverImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

// Container query lives in a plain <style> tag so it needs NO CSS compiler.
// repeat:'fit' collapses the two columns to one below 511px; the query reorders
// the cover image (order:-1) and tightens the inset at that point.
const LOGIN_SPLIT_CSS = `
.login-split-grid {
  container-type: inline-size;
  container-name: login-split;
  padding: var(--spacing-8, 32px);
}
.login-split-image {
  width: 100%;
  order: 0;
}
@container login-split (max-width: 511px) {
  .login-split-grid {
    padding: var(--spacing-4, 16px);
  }
  .login-split-image {
    order: -1;
  }
}
`;

export default function LoginSplitPage() {
  const { login, register, error, isLoading, clearError, logoutMessage, clearLogoutMessage } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();
    clearLogoutMessage();

    // Query active DOM input values for automated browser testing compatibility
    const emailEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="email"], input[type="email"], input[placeholder*="email" i], input[type="text"]'
    );
    const passEl = formRef.current?.querySelector<HTMLInputElement>('input[type="password"]');
    const userEl = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="username"], input[placeholder*="username" i]'
    );

    const finalIdentifier = emailEl?.value || email;
    const finalPassword = passEl?.value || password;

    if (isRegister) {
      const finalUsername = userEl?.value || username;

      if (!finalUsername || !finalPassword) {
        setLoginFailed(true);
        return;
      }

      setLoginFailed(false);
      const res = await register(
        finalUsername,
        finalIdentifier || `${finalUsername}@example.com`,
        finalPassword
      );
      if (res) setIsSuccess(true);
    } else {
      if (!finalIdentifier || !finalPassword) {
        setLoginFailed(true);
        return;
      }

      setLoginFailed(false);
      const res = await login(finalIdentifier, finalPassword);
      if (res) setIsSuccess(true);
    }
  };

  const handleToggleMode = (e?: MouseEvent) => {
    if (e) e.preventDefault();
    clearError();
    clearLogoutMessage();
    setLoginFailed(false);
    setIsRegister(!isRegister);
  };

  return (
    <Center axis="both" padding={6} style={pageStyle}>
      <style>{LOGIN_SPLIT_CSS}</style>

      <VStack gap={4} width="100%">
        <div style={cardWrap} data-testid="auth-split-card">
          <Card padding={0} width="100%">
            <Grid
              columns={{ minWidth: COLUMN_MIN_WIDTH, repeat: 'fit' }}
              gap={8}
              align="stretch"
              className="login-split-grid"
            >
              {/* Form Pane */}
              <Section
                variant="transparent"
                padding={0}
                height="100%"
                data-testid="auth-form-pane"
              >
                <form
                  ref={formRef}
                  noValidate
                  onSubmit={handleSubmit}
                  onInput={(ev) => {
                    const target = ev.target as HTMLInputElement;
                    if (target.type === 'password') {
                      setPassword(target.value);
                    } else if (target.name === 'username') {
                      setUsername(target.value);
                    } else {
                      setEmail(target.value);
                    }
                    setLoginFailed(false);
                    clearError();
                    clearLogoutMessage();
                  }}
                  style={{ height: '100%' }}
                >
                  <VStack gap={4} height="100%">
                    {/* Header Logo */}
                    <HStack gap={2} vAlign="center">
                      <img
                        src="/favicon.png"
                        alt="Social Media Content Analysis Logo"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <Text type="body" weight="bold">
                        Social Media Content Analysis
                      </Text>
                    </HStack>

                    <StackItem size="fill">
                      <Center axis="vertical" height="100%">
                        {isSuccess ? (
                          <EmptyState
                            title="You're signed in"
                            description="Redirecting to your dashboard…"
                            icon={<Icon icon={CheckCircleIcon} size="lg" />}
                          />
                        ) : (
                          <VStack gap={4} hAlign="stretch" width="100%">
                            {/* Title & Subtitle */}
                            <VStack gap={1}>
                              <Text type="display-1" as="h2">
                                {isRegister ? 'Create an account' : 'Welcome back'}
                              </Text>
                              <Text type="body" color="secondary" size="sm">
                                {isRegister
                                  ? 'Join the Social Media Content Analysis System'
                                  : 'Login to access your news feed and analytics'}
                              </Text>
                            </VStack>

                            {/* Quick Demo Sign In Shortcut */}
                            {!isRegister && (
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
                                  onClick={async (ev) => {
                                    ev.preventDefault();
                                    clearLogoutMessage();
                                    setEmail('hunain_creator');
                                    setPassword('password123');
                                    await login('hunain_creator', 'password123');
                                  }}
                                />
                              </div>
                            )}

                            {/* Logout Confirmation Feedback Banner (CT-263 Section 10.6) */}
                            {logoutMessage && !error && (
                              <div data-testid="auth-logout-banner">
                                <Banner
                                  status="success"
                                  title="Logged Out"
                                  description={logoutMessage}
                                  isDismissable
                                  onDismiss={clearLogoutMessage}
                                />
                              </div>
                            )}

                            {/* Authentication Error Banner */}
                            {error && (
                              <div data-testid="auth-error-banner">
                                <Banner status="error" title="Authentication Error">
                                  {error}
                                </Banner>
                              </div>
                            )}

                            {/* Input Fields */}
                            <VStack gap={2}>
                              {isRegister && (
                                <TextInput
                                  label="Username"
                                  isLabelHidden
                                  type="text"
                                  htmlName="username"
                                  placeholder="Choose a username"
                                  value={username}
                                  onChange={(v) => {
                                    setUsername(v);
                                    clearError();
                                  }}
                                  size="lg"
                                />
                              )}

                              <TextInput
                                label={isRegister ? 'Email' : 'Email or Username'}
                                isLabelHidden
                                type="text"
                                htmlName="email"
                                placeholder={
                                  isRegister
                                    ? 'name@company.com'
                                    : 'name@company.com or @username'
                                }
                                value={email}
                                onChange={(v) => {
                                  setEmail(v);
                                  setLoginFailed(false);
                                  clearError();
                                }}
                                size="lg"
                              />

                              <VStack gap={1}>
                                <TextInput
                                  label="Password"
                                  isLabelHidden
                                  placeholder={
                                    isRegister
                                      ? 'Create a secure password'
                                      : 'Enter your password'
                                  }
                                  type="password"
                                  value={password}
                                  onChange={(v: string) => {
                                    setPassword(v);
                                    setLoginFailed(false);
                                    clearError();
                                  }}
                                  size="lg"
                                  status={
                                    loginFailed
                                      ? {
                                          type: 'error',
                                          message:
                                            'Incorrect credentials. Try again.',
                                        }
                                      : undefined
                                  }
                                />

                                {!isRegister && (
                                  <VStack hAlign="end">
                                    <Link
                                      href="#"
                                      size="sm"
                                      color="secondary"
                                      type="supporting"
                                      onClick={(ev) => ev.preventDefault()}
                                    >
                                      Forgot your password?
                                    </Link>
                                  </VStack>
                                )}
                              </VStack>
                            </VStack>

                            {/* Submit Button */}
                            <Button
                              data-testid="auth-submit-btn"
                              label={
                                isLoading
                                  ? isRegister
                                    ? 'Creating Account...'
                                    : 'Signing In...'
                                  : isRegister
                                  ? 'Create Account'
                                  : 'Login'
                              }
                              variant="primary"
                              size="lg"
                              type="submit"
                              isLoading={isLoading}
                              onClick={handleSubmit}
                            />

                            {/* Divider & Social Sign In */}
                            <Divider label="Or continue with" />

                            <Grid columns={2} gap={3} justify="stretch">
                              <Button
                                label="Apple"
                                variant="secondary"
                                icon={
                                  <img
                                    src={APPLE_LOGO_URL}
                                    alt="Apple logo"
                                    width={16}
                                    height={16}
                                  />
                                }
                                size="lg"
                                onClick={(ev) => ev.preventDefault()}
                              />
                              <Button
                                label="Google"
                                variant="secondary"
                                icon={
                                  <img
                                    src={GOOGLE_LOGO_URL}
                                    alt="Google logo"
                                    width={16}
                                    height={16}
                                  />
                                }
                                size="lg"
                                onClick={(ev) => ev.preventDefault()}
                              />
                            </Grid>
                          </VStack>
                        )}
                      </Center>
                    </StackItem>

                    {/* Mode Toggle Footer */}
                    {!isSuccess && (
                      <Text type="supporting" color="secondary">
                        {isRegister
                          ? 'Already have an account? '
                          : "Don't have an account? "}
                        <Link
                          href="#"
                          type="supporting"
                          data-testid="auth-toggle-mode"
                          onClick={handleToggleMode}
                        >
                          {isRegister ? 'Sign In' : 'Create Account'}
                        </Link>
                      </Text>
                    )}
                  </VStack>
                </form>
              </Section>

              {/* Cover Image Pane */}
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
                    style={coverImage}
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
            </Grid>
          </Card>
        </div>

        {/* Terms of Service & Privacy Policy */}
        <VStack hAlign="center">
          <Text type="supporting" color="secondary">
            By clicking continue, you agree to our{' '}
            <Link
              href="#"
              type="supporting"
              onClick={(ev) => ev.preventDefault()}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="#"
              type="supporting"
              onClick={(ev) => ev.preventDefault()}
            >
              Privacy Policy
            </Link>
            .
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}

export { LoginSplitPage as LoginTwoColumn };
