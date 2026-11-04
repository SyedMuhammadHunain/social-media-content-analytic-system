// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Application Top Navigation (Logo Only)

'use client';

import { useState, type FC } from 'react';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import type { UserProfile } from '../../types/social.ts';
import type { DemoUserSummary } from '../../context/auth-context-def.ts';

export interface AppTopNavProps {
  mode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  demoUsers?: DemoUserSummary[];
  onSwitchUser?: (userId: string) => void;
  onOpenNewPost?: () => void;
  onRefreshFeed?: () => void;
}

export const AppTopNav: FC<AppTopNavProps> = ({
  onRefreshFeed,
}) => {
  const [isBrandBouncing, setIsBrandBouncing] = useState(false);

  const handleBrandClick = () => {
    setIsBrandBouncing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onRefreshFeed) {
      onRefreshFeed();
    } else {
      window.dispatchEvent(new CustomEvent('social:refresh-feed'));
    }
    setTimeout(() => setIsBrandBouncing(false), 550);
  };

  return (
    <>
      <style>{`
        @keyframes brandBounceAnim {
          0% { transform: scale(1); }
          25% { transform: scale(0.92); }
          50% { transform: scale(1.08); }
          75% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }

        .brand-bouncing {
          animation: brandBounceAnim 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .navbar-brand-clickable {
          cursor: pointer;
          user-select: none;
          transition: opacity 0.15s ease;
          display: inline-flex;
          align-items: center;
        }
        .navbar-brand-clickable:hover {
          opacity: 0.9;
        }
        .navbar-brand-clickable:active {
          opacity: 0.75;
        }
      `}</style>

      <TopNav
        label="Navigation"
        heading={
          <div
            data-testid="navbar-brand-button"
            className={`navbar-brand-clickable ${isBrandBouncing ? 'brand-bouncing' : ''}`}
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            title="Back to top & refresh feed"
            aria-label="Back to top and refresh feed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBrandClick();
              }
            }}
          >
            <TopNavHeading
              logo={
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              }
              logoLabel="Logo"
            />
          </div>
        }
      />
    </>
  );
};

export default AppTopNav;
