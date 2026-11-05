// Copyright (c) Meta Platforms, Inc. and affiliates.
// Mobile Responsive Sticky Top Header

import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';

export interface MobileAppHeaderProps {
  onOpenSearch?: () => void;
  onOpenDrawer?: () => void;
  onClickLogo?: () => void;
}

export function MobileAppHeader({ onOpenSearch, onOpenDrawer, onClickLogo }: MobileAppHeaderProps) {
  return (
    <header
      className="mobile-app-header"
      data-testid="mobile-app-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backgroundColor: 'var(--color-background-body, #111111)',
        borderBottom: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
        boxSizing: 'border-box',
      }}
    >
      {/* Left spacer so title/logo remains centered */}
      <div style={{ width: 88, display: 'flex', alignItems: 'center' }} />

      {/* Centered App Logo & Title */}
      <div
        data-testid="mobile-header-logo"
        onClick={onClickLogo}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flex: 1,
          cursor: onClickLogo ? 'pointer' : 'default',
        }}
      >
        <img
          src="/logo.jpeg"
          alt="SocialPulse Logo"
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary, #FFFFFF)',
          }}
        >
          SocialPulse
        </span>
      </div>

      {/* Top Right Action Buttons: Search and Hamburger */}
      <div
        data-testid="mobile-header-actions"
        style={{
          width: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
        }}
      >
        <IconButton
          data-testid="mobile-search-btn"
          size="sm"
          variant="ghost"
          label="Search"
          icon={<Icon icon="search" size="sm" />}
          onClick={onOpenSearch}
        />
        <IconButton
          data-testid="mobile-hamburger-btn"
          size="sm"
          variant="ghost"
          label="Menu"
          icon={<Icon icon="menu" size="sm" />}
          onClick={onOpenDrawer}
        />
      </div>
    </header>
  );
}
