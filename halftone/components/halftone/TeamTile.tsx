import React from 'react';
import { View } from 'react-native';
import { Halftone } from './Halftone';
import { FIELD_NAMES } from './fields';
import { hashSeed } from '../../lib/seed';
import { TILE_GROUNDS } from '../../lib/tokens';

export function TeamTile({
  teamId,
  name,
  size,
  radius = 14,
}: {
  teamId: string;
  name: string;
  size: number;
  radius?: number;
}) {
  const h = hashSeed(teamId);
  const ground = TILE_GROUNDS[h % TILE_GROUNDS.length];
  // Unsigned shift: a signed `>>` turns uint32 hashes with the top bit set
  // negative, and a negative index is `undefined` for about half of all ids.
  const variant = FIELD_NAMES[(h >>> 5) % FIELD_NAMES.length];

  return (
    <View
      style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}
      accessibilityLabel={`${name} tile`}
    >
      <Halftone
        variant={variant}
        size={size}
        seed={teamId}
        density={Math.max(16, Math.round(size / 3))}
        dotColor="#FFFFFF"
        background={ground}
      />
    </View>
  );
}
