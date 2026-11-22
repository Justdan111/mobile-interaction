import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import type { Post } from '../../data/posts';
import { masonry } from '../../lib/masonry';
import { photos, videos } from '../../lib/media';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Press } from '../ui/Press';
import { TextCard } from './TextCard';

const GAP = 12;
/** Text posts take a fixed square-ish tile, as Devon's and Mariane's do. */
const TEXT_TILE = 1.0;

export function MasonryFeed({ posts, width, bottomInset, onOpen }: { posts: Post[]; width: number; bottomInset: number; onOpen: (p: Post) => void }) {
  const col = (width - 16 * 2 - GAP) / 2;
  const { placed, height } = useMemo(
    () => masonry(posts, (p) => col * (p.kind === 'text' ? TEXT_TILE : p.tile), GAP),
    [posts, col]
  );

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: bottomInset }} showsVerticalScrollIndicator={false}>
      <View style={{ height }}>
        {placed.map(({ item: p, column, top, height: h }, i) => (
          <Animated.View
            key={p.id}
            entering={FadeIn.duration(360).delay(Math.min(i, 8) * 50)}
            style={{ position: 'absolute', top, left: column * (col + GAP), width: col, height: h }}
          >
            {p.kind === 'text' ? (
              <TextCard post={p} height={h} />
            ) : (
              <Press onPress={() => onOpen(p)} accessibilityRole="imagebutton" accessibilityLabel={p.kind === 'video' ? 'Video' : 'Photo'} style={{ flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: C.line }}>
                <Image
                  source={p.kind === 'photo' ? (photos as Record<string, { source: number }>)[p.photo]?.source : (videos as Record<string, { poster: number }>)[p.video]?.poster}
                  style={{ flex: 1 }}
                  contentFit="cover"
                  transition={200}
                />
                {p.kind === 'video' ? (
                  <View style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-right" color={C.ink} size={16} strokeWidth={2.4} />
                  </View>
                ) : null}
              </Press>
            )}
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
