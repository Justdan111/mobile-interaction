import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { art, photos } from '../../lib/media';

type Props = {
  /** A slug from lib/media.ts — a cut-out (`art`) or a photo. */
  slug: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  /** Shown while the slug has no asset yet, so layouts hold their shape. */
  placeholder?: string;
  accessibilityLabel?: string;
};

export function mediaFor(slug: string) {
  return (art as Record<string, { source: number; aspect: number }>)[slug] ??
    (photos as Record<string, { source: number; aspect: number }>)[slug];
}

/** Renders a manifest image by slug. */
export function Media({ slug, style, contentFit = 'cover', placeholder, accessibilityLabel }: Props) {
  const m = mediaFor(slug);
  if (!m) return <View style={[style, placeholder ? { backgroundColor: placeholder } : null]} />;
  return (
    <Image
      source={m.source}
      style={style as never}
      contentFit={contentFit}
      transition={180}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
