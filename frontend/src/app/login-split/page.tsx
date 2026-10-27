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
import { AuthBrandingPane } from './AuthBrandingPane';
import { AuthQuickDemoBar } from './AuthQuickDemoBar';
import { SocialAuthButtons } from './SocialAuthButtons';

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

function extractInputValue(form: HTMLFormElement | null, selector: string, fallback: string): string {
  if (!form) return fallback;
  const el = form.querySelector<HTMLInputElement>(selector);
  return el?.value || fallback;
}

export default function LoginSplitPage() {
  const { login, register, error, isLoading, clearError, logoutMessage, clearLogoutMessage } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getFormValues = () => ({
    finalIdentifier: extractInputValue(
      formRef.current,
      'input[name="email"], input[type="email"], input[placeholder*="email" i], input[type="text"]',
      email
    ),
    finalPassword: extractInputValue(formRef.current, 'input[type="password"]', password),
    finalUsername: extractInputValue(
      formRef.current,
      'input[name="username"], input[placeholder*="username" i]',
      username
    ),
  });

  const executeRegister = async (values: ReturnType<typeof getFormValues>) => {
    if (!values.finalUsername || !values.finalPassword) {
      setLoginFailed(true);
      return;
    }
    setLoginFailed(false);
    const emailToUse = values.finalIdentifier || `${values.finalUsername}@example.com`;
    const res = await register(values.finalUsername, emailToUse, values.finalPassword);
    if (res) setIsSuccess(true);
  };

  const executeLogin = async (values: ReturnType<typeof getFormValues>) => {
    if (!values.finalIdentifier || !values.finalPassword) {
      setLoginFailed(true);
      return;
    }
    setLoginFailed(false);
    const res = await login(values.finalIdentifier, values.finalPassword);
    if (res) setIsSuccess(true);
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();
    clearLogoutMessage();

    const values = getFormValues();
    if (isRegister) {
      await executeRegister(values);
    } else {
      await executeLogin(values);
    }
  };

  const handleToggleMode = (e?: MouseEvent) => {
    if (e) e.preventDefault();
    clearError();
    clearLogoutMessage();
    setLoginFailed(false);
    setIsRegister((prev) => !prev);
  };

  const handleOneClickSignIn = async () => {
    clearLogoutMessage();
    setEmail('hunain_creator');
    setPassword('password123');
    await login('hunain_creator', 'password123');
  };

  const handleInputChange = (ev: FormEvent<HTMLFormElement>) => {
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
                  onInput={handleInputChange}
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
                            {!isRegister && <AuthQuickDemoBar onQuickSignIn={handleOneClickSignIn} />}

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
                            <SocialAuthButtons />
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
              <AuthBrandingPane />
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
