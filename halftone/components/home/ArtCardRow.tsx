import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Halftone } from '../halftone/Halftone';
import type { FieldName } from '../halftone/fields';

export const ART_CARDS: Array<{ id: string; title: string; variant: FieldName; ground: string; dot: string }> = [
  { id: 'inspiration', title: 'Find your\nInspiration', variant: 'wave', ground: '#8E88F0', dot: '#FFFFFF' },
  { id: 'unite', title: 'Find.Unite.\nCreate.', variant: 'blob', ground: '#C9C9C9', dot: '#141414' },
  { id: 'match', title: 'Find your\nPerfect Match', variant: 'orbit', ground: '#D6D6D6', dot: '#141414' },
];

const CARD = 150;

export function ArtCardRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
    >
      {ART_CARDS.map((c) => (
        <View key={c.id} style={{ width: CARD, height: CARD, borderRadius: 18, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', inset: 0 }}>
            <Halftone variant={c.variant} size={CARD} seed={c.id} density={44} dotColor={c.dot} background={c.ground} />
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
            <Text style={{ color: c.dot, fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 18 }}>
              {c.title}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
