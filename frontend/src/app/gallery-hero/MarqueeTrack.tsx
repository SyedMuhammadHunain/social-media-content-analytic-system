// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Marquee Image Track

'use client';

import type { CSSProperties } from 'react';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import './marquee.css';

export interface ImageSlot {
  id: string;
  label: string;
  sublabel: string;
  customSrc?: string;
  alt?: string;
}

export const FOUR_IMAGE_SLOTS: ImageSlot[] = [
  {
    id: 'slot-1',
    label: 'Photo Slot 01',
    sublabel: 'Creator Analytics Dashboard',
  },
  {
    id: 'slot-2',
    label: 'Photo Slot 02',
    sublabel: 'Rich Content Composer',
  },
  {
    id: 'slot-3',
    label: 'Photo Slot 03',
    sublabel: 'Realtime Feed Telemetry',
  },
  {
    id: 'slot-4',
    label: 'Photo Slot 04',
    sublabel: 'Audience Demographics',
  },
];

const slotBoxStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-background-surface, #1a1a1a)',
  border: '1px dashed var(--color-border-subtle, #333333)',
  borderRadius: 'var(--radius-container, 12px)',
  padding: '1.5rem',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-container, 12px)',
};

export function MarqueeTrack({ slots = FOUR_IMAGE_SLOTS }: { slots?: ImageSlot[] }) {
  // Duplicate slots to ensure continuous, seamless right-to-left marquee loop
  const loopItems = [...slots, ...slots];

  return (
    <div className="marquee-container" data-testid="marquee-container">
      <div className="marquee-track" data-testid="marquee-track">
        {loopItems.map((slot, idx) => (
          <div
            key={`${slot.id}-${idx}`}
            className="marquee-item"
            data-testid={`photo-slot-${idx < slots.length ? idx + 1 : `dup-${idx - slots.length + 1}`}`}
          >
            <AspectRatio ratio={4 / 5} style={{ borderRadius: 'var(--radius-container, 12px)' }}>
              {slot.customSrc ? (
                <img
                  src={slot.customSrc}
                  alt={slot.alt || slot.label}
                  style={imageStyle}
                />
              ) : (
                <div style={slotBoxStyle}>
                  <VStack gap={3} hAlign="center">
                    <Icon icon="upload" size="lg" color="secondary" />
                    <Text type="label" color="primary" weight="medium">
                      {slot.label}
                    </Text>
                    <Text type="supporting" color="secondary" justify="center">
                      {slot.sublabel}
                    </Text>
                  </VStack>
                </div>
              )}
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
}
