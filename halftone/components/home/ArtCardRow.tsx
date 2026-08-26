import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Halftone } from '../halftone/Halftone';
import type { FieldName } from '../halftone/fields';
import { ART_CARD_CAPTION_COLOR, ART_CARD_CAPTION_SCRIM, ART_CARD_PALETTES } from '../../lib/tokens';

export const ART_CARDS: Array<{ id: string; title: string; variant: FieldName; ground: string; dot: string }> = [
  { id: 'inspiration', title: 'Find your\nInspiration', variant: 'wave', ...ART_CARD_PALETTES.inspiration },
  { id: 'unite', title: 'Find.Unite.\nCreate.', variant: 'blob', ...ART_CARD_PALETTES.unite },
  { id: 'match', title: 'Find your\nPerfect Match', variant: 'orbit', ...ART_CARD_PALETTES.match },
];

const CARD = 150;
/** Height of the scrim strip behind the caption — sized to the two-line
 * caption plus its padding, not the whole card, so the art stays visible
 * above it. */
const CAPTION_SCRIM_HEIGHT = 64;

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
          {/* Guaranteed-contrast plate behind the caption. The dot field is
              seeded per card, so no flat text colour reliably reads against
              both the ground and the dots — a solid scrim, independent of
              `c.dot`, is what actually fixes legibility. */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: CAPTION_SCRIM_HEIGHT,
              backgroundColor: ART_CARD_CAPTION_SCRIM,
            }}
          />
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
            <Text style={{ color: ART_CARD_CAPTION_COLOR, fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 18 }}>
              {c.title}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
