// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Gallery Hero Landing Page

'use client';

import type { CSSProperties } from 'react';
import { VStack, HStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Grid } from '@astryxdesign/core/Grid';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';

export interface GalleryHeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

const IMAGES = [
  {
    src: '/landing/gallery-1.jpg',
    alt: 'Vibrant outdoor flower wall streetscape with cyclists',
  },
  {
    src: '/landing/gallery-2.jpg',
    alt: 'Bright yellow architectural wall with street art and walking pedestrian',
  },
  {
    src: '/landing/gallery-3.jpg',
    alt: 'Spacious Scandinavian-style living room with colorful modular sofa',
  },
];

// NOTE: The only custom styling here is image fill + corner radius. It exists
// because Astryx has no image primitive — AspectRatio exposes no objectFit or
// radius props and there's no Image. Tracked in issue #2582; replace these
// with component props once it lands.
// Fills the AspectRatio box. No objectFit prop on AspectRatio (#2582).
const galleryImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// Rounds the image corners. No radius prop on AspectRatio (#2582).
const galleryImageClip: CSSProperties = {
  borderRadius: 'var(--radius-container, 12px)',
  overflow: 'hidden',
  boxShadow: 'var(--elevation-low, 0 1px 3px rgba(0, 0, 0, 0.2))',
};

export function GalleryHeroLandingPage({
  onGetStarted,
  onLearnMore,
}: GalleryHeroProps) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        boxSizing: 'border-box',
      }}
    >
      <Layout
        content={
          <LayoutContent padding={4}>
            <div
              style={{
                maxWidth: 1200,
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box',
                overflowX: 'clip',
              }}
            >
              <VStack gap={6}>
                <VStack gap={4} hAlign="center" style={{ paddingTop: '0.5rem' }}>
                  <VStack gap={2} hAlign="center">
                    <Heading
                      level={1}
                      type="display-2"
                      justify="center"
                      textWrap="balance"
                    >
                      Analyze Social Media at Scale
                    </Heading>
                    <Text
                      type="body"
                      color="secondary"
                      justify="center"
                      textWrap="balance"
                    >
                      Instant creator metrics, post telemetry, and predictive audience analytics.
                    </Text>
                  </VStack>
                  <HStack gap={3}>
                    <Button
                      label="Get started"
                      variant="primary"
                      endContent={
                        <Icon icon="chevronRight" size="sm" color="inherit" />
                      }
                      onClick={handleGetStarted}
                      data-testid="landing-get-started-btn"
                    />
                    <Button
                      label="Learn more"
                      variant="secondary"
                      onClick={handleLearnMore}
                      data-testid="landing-learn-more-btn"
                    />
                  </HStack>
                </VStack>
                <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4} data-testid="gallery-grid">
                  {IMAGES.map((image, idx) => (
                    <AspectRatio
                      key={image.src}
                      ratio={16 / 10}
                      style={galleryImageClip}
                      data-testid={`gallery-aspect-ratio-${idx + 1}`}
                    >
                      <img
                        style={galleryImage}
                        src={image.src}
                        alt={image.alt}
                        data-testid={`gallery-image-${idx + 1}`}
                      />
                    </AspectRatio>
                  ))}
                </Grid>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

export default function GalleryHero(props: GalleryHeroProps) {
  return <GalleryHeroLandingPage {...props} />;
}
