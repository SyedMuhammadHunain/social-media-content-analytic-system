// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Gallery Hero Landing Page

'use client';

import { VStack, HStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { MarqueeTrack } from './MarqueeTrack.tsx';

export interface GalleryHeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

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
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={10} hAlign="center">
            {/* Hero Copy & CTA Header */}
            <VStack gap={6} hAlign="center" style={{ maxWidth: 840, width: '100%', paddingTop: '2rem' }}>
              <VStack gap={3} hAlign="center">
                <Heading
                  level={1}
                  type="display-2"
                  justify="center"
                  textWrap="balance"
                >
                  Analyze Social Media at Scale
                </Heading>
                <Text
                  type="large"
                  color="secondary"
                  justify="center"
                  textWrap="balance"
                >
                  Instant creator metrics, post telemetry, and predictive audience analytics.
                </Text>
              </VStack>

              {/* Action Buttons */}
              <HStack gap={3} hAlign="center">
                <Button
                  label="Get started"
                  variant="primary"
                  endContent={
                    <Icon icon="chevronRight" size="sm" color="inherit" />
                  }
                  onClick={handleGetStarted}
                />
                <Button
                  label="Learn more"
                  variant="secondary"
                  onClick={handleLearnMore}
                />
              </HStack>
            </VStack>

            {/* Continuous Smooth 4-Photo Marquee Track */}
            <VStack gap={3} hAlign="center" style={{ width: '100%', overflow: 'hidden' }}>
              <MarqueeTrack />
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}

export default function GalleryHero(props: GalleryHeroProps) {
  return <GalleryHeroLandingPage {...props} />;
}
