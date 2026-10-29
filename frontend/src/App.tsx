// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Main App Navigation

'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from './astryx-themes';
import { AuthProvider } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useAuth } from './context/useAuth';
import LoginSplitPage from './app/login-split/page';
import AppTopNav from './components/nav/AppTopNav';
import NewsFeedPage from './app/feed/NewsFeedPage';

const DashboardTemplate = lazy(() => import('./app/dashboard/page'));

type AppTab = 'feed' | 'dashboard';
type ThemeMode = 'dark' | 'light';

function AppContent({
  mode,
  onToggleTheme,
}: {
  mode: ThemeMode;
  onToggleTheme: () => void;
}) {
  const { isAuthenticated, currentUser, logout, demoUsers, switchUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('feed');

  const handleOpenNewPost = () => {
    if (activeTab !== 'feed') {
      setActiveTab('feed');
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('social:open-create-post'));
    }, 20);
  };

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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-background-body, #111111)',
        borderBottom: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
      }}
    >
      <AppTopNav
        mode={mode}
        onToggleTheme={onToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={logout}
        demoUsers={demoUsers}
        onSwitchUser={switchUser}
        onOpenNewPost={handleOpenNewPost}
      />
</header>

      {/* Main Content Area */}
      <main>
        {activeTab === 'feed' ? (
          <NewsFeedPage
            key={currentUser?.id}
            currentUser={currentUser || undefined}
            onNavigateAnalytics={() => setActiveTab('dashboard')}
          />
        ) : (
          <Suspense fallback={null}>
            <DashboardTemplate />
          </Suspense>
        )}
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
