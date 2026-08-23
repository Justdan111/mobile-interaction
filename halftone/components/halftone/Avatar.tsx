import React from 'react';
import { View } from 'react-native';
import { Halftone } from './Halftone';
import { FIELD_NAMES } from './fields';
import { hashSeed } from '../../lib/seed';
import { tokens } from '../../lib/tokens';
import { useTheme } from '../../lib/theme';

/** Rotating plate colours so a member list reads as varied, not uniform. */
const PLATE_COLORS = ['#6C63E8', '#E5483D', '#0A84FF', '#F0A202', '#34C759', '#8E5BE8'];

export function Avatar({ name, size }: { name: string; size: number }) {
  const { mode } = useTheme();
  const h = hashSeed(name);
  const variant = FIELD_NAMES[h % FIELD_NAMES.length];
  const plate = PLATE_COLORS[(h >> 3) % PLATE_COLORS.length];

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
      className="bg-chip"
      accessibilityLabel={`${name} avatar`}
    >
      <Halftone
        variant={variant}
        size={size}
        seed={name}
        density={Math.max(14, Math.round(size / 2.6))}
        dotColor={plate}
        background={mode === 'dark' ? tokens.dark.card : tokens.light.card}
      />
    </View>
  );
}
