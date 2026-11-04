// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Main App Navigation

'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from './astryx-themes';
import { AuthProvider } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useAuth } from './context/useAuth';
import LoginCardPage from './app/login-card/page';
import NewsFeedPage from './app/feed/NewsFeedPage';

type ThemeMode = 'dark' | 'light';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <LoginCardPage />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-body, #111111)',
        color: 'var(--color-text-primary, #FFFFFF)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Persistent 3-Column Shell Area */}
      <main>
        <NewsFeedPage
          key={currentUser?.id}
          currentUser={currentUser || undefined}
        />
      </main>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    const handleSetTheme = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setMode(customEvent.detail);
      } else {
        setMode((m) => (m === 'dark' ? 'light' : 'dark'));
      }
    };
    window.addEventListener('app:set-theme', handleSetTheme);
    return () => window.removeEventListener('app:set-theme', handleSetTheme);
  }, []);

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode}>
      <AuthProvider>
        <AnalyticsProvider>
          <AppContent />
        </AnalyticsProvider>
      </AuthProvider>
    </Theme>
  );
}
