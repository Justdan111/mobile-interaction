import React from 'react';
import { View } from 'react-native';
import { Halftone } from './Halftone';
import { FIELD_NAMES } from './fields';
import { hashSeed } from '../../lib/seed';
import { PLATE_COLORS } from '../../lib/tokens';
import { useTheme } from '../../lib/theme';

export function Avatar({ name, size }: { name: string; size: number }) {
  const { t } = useTheme();
  const h = hashSeed(name);
  const variant = FIELD_NAMES[h % FIELD_NAMES.length];
  // Unsigned shift: hashSeed returns a uint32 via `>>> 0`, but a signed `>>`
  // reinterprets any value with the top bit set as negative (ToInt32), which
  // would make `% PLATE_COLORS.length` negative and index the array with a
  // negative number — always `undefined` — for roughly half of all names.
  const plate = PLATE_COLORS[(h >>> 3) % PLATE_COLORS.length];

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
        background={t.card}
      />
    </View>
  );
}
