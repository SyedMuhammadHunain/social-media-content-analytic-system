// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Feed Appearance Switcher

'use client';

import { useState } from 'react';
import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Item } from '@astryxdesign/core/Item';
import {
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export interface FeedAppearanceSwitcherProps {
  onToggleTheme?: () => void;
}

export function FeedAppearanceSwitcher({ onToggleTheme }: FeedAppearanceSwitcherProps) {
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.style.colorScheme = newTheme;
    window.dispatchEvent(new CustomEvent('app:set-theme', { detail: newTheme }));
    onToggleTheme?.();
  };

  return (
    <>
      <Item
        data-testid="shortcut-appearance"
        label="Appearance"
        density="compact"
        startContent={<Icon icon={PaintBrushIcon} size="sm" />}
        onClick={() => setIsAppearanceOpen(prev => !prev)}
      />

      {isAppearanceOpen && (
        <div style={{ padding: '4px 8px' }}>
          <HStack gap={2}>
            <Button
              data-testid="theme-light-btn"
              size="sm"
              variant={currentTheme === 'light' ? 'primary' : 'secondary'}
              label="Light"
              icon={<Icon icon={SunIcon} size="xsm" />}
              onClick={() => handleThemeChange('light')}
            />
            <Button
              data-testid="theme-dark-btn"
              size="sm"
              variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
              label="Dark"
              icon={<Icon icon={MoonIcon} size="xsm" />}
              onClick={() => handleThemeChange('dark')}
            />
          </HStack>
        </div>
      )}
    </>
  );
}
