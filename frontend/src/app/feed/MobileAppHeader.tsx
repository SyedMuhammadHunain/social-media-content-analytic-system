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
    <div
      role="banner"
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
      {/* Top Left: Hamburger Menu Button */}
      <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <IconButton
          data-testid="mobile-hamburger-btn"
          size="sm"
          variant="ghost"
          label="Menu"
          icon={<Icon icon="menu" size="sm" />}
          onClick={onOpenDrawer}
        />
      </div>

      {/* Centered App Logo Only (No text title) */}
      <div
        data-testid="mobile-header-logo"
        onClick={onClickLogo}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          cursor: onClickLogo ? 'pointer' : 'default',
        }}
      >
        <img
          src="/logo.jpeg"
          alt="App Logo"
          style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Top Right: Search Action Button */}
      <div
        data-testid="mobile-header-actions"
        style={{
          width: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
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
      </div>
    </div>
  );
}

export default MobileAppHeader;
