import React from 'react';
import { View } from 'react-native';
import { Halftone } from './Halftone';
import { FIELD_NAMES } from './fields';
import { hashSeed } from '../../lib/seed';

/** Saturated plate grounds, echoing the app-icon tiles in the comps. */
const TILE_GROUNDS = ['#2C4BFF', '#111111', '#E8622C', '#6C63E8', '#0F8B5B', '#C41E4A'];

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
  const variant = FIELD_NAMES[(h >> 5) % FIELD_NAMES.length];

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
