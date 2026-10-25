// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Main App Navigation

'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from './astryx-themes';
import { AuthProvider } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useAuth } from './context/useAuth';
import LoginSplitPage from './app/login-split/page';
import AppTopNav from './components/nav/AppTopNav';
import DashboardTemplate from './app/dashboard/page';
import NewsFeedPage from './app/feed/NewsFeedPage';

type AppTab = 'feed' | 'dashboard';
type ThemeMode = 'dark' | 'light';

function AppContent({
  mode,
  onToggleTheme,
}: {
  mode: ThemeMode;
  onToggleTheme: () => void;
}) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('feed');

  if (!isAuthenticated) {
    return <LoginSplitPage />;
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
      {/* Official Astryx Mega TopNav */}
      <AppTopNav
        mode={mode}
        onToggleTheme={onToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main>
        {activeTab === 'feed' ? <NewsFeedPage /> : <DashboardTemplate />}
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

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode}>
      <AuthProvider>
        <AnalyticsProvider>
          <AppContent
            mode={mode}
            onToggleTheme={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
          />
        </AnalyticsProvider>
      </AuthProvider>
    </Theme>
  );
}
