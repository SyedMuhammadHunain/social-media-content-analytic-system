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

export const THREE_IMAGE_SLOTS: ImageSlot[] = [
  {
    id: 'gallery-img-1',
    label: 'Urban Florals & Motion',
    sublabel: 'Vibrant streetscape photography',
    customSrc: '/landing/gallery-1.jpg',
    alt: 'Vibrant outdoor flower wall streetscape with cyclists',
  },
  {
    id: 'gallery-img-2',
    label: 'Artistic Yellow Architecture',
    sublabel: 'Bugis Street mural and urban pedestrian',
    customSrc: '/landing/gallery-2.jpg',
    alt: 'Bright yellow architectural wall with street art and walking pedestrian',
  },
  {
    id: 'gallery-img-3',
    label: 'Modern Interior Living',
    sublabel: 'Spacious contemporary studio aesthetic',
    customSrc: '/landing/gallery-3.jpg',
    alt: 'Spacious Scandinavian-style living room with colorful modular sofa',
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
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-container, 12px)',
  display: 'block',
};

export function MarqueeTrack({ slots = THREE_IMAGE_SLOTS }: { slots?: ImageSlot[] }) {
  // Duplicate 3 slots to create seamless 6-item infinite right-to-left loop
  const loopItems = [...slots, ...slots];

  return (
    <div className="marquee-container" data-testid="marquee-container">
      <div className="marquee-track" data-testid="marquee-track">
        {loopItems.map((slot, idx) => {
          const itemIndex = idx % slots.length;
          return (
            <div
              key={`${slot.id}-${idx}`}
              className="marquee-item"
              data-testid={`photo-slot-${itemIndex + 1}`}
            >
              <AspectRatio ratio={16 / 10} style={{ borderRadius: 'var(--radius-container, 12px)', overflow: 'hidden' }}>
                {slot.customSrc ? (
                  <img
                    src={slot.customSrc}
                    alt={slot.alt || slot.label}
                    style={imageStyle}
                    data-testid={`gallery-image-${itemIndex + 1}`}
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
          );
        })}
      </div>
    </div>
  );
}
