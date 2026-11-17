import React from 'react';
import { View } from 'react-native';
import { Halftone } from './Halftone';
import { FIELD_NAMES } from './fields';
import { hashSeed } from '../../lib/seed';
import { PLATE_COLORS } from '../../lib/tokens';
import { useTheme } from '../../lib/theme';

// `radius` defaults to a full circle; team detail passes one to get rounded
// squares that match the file rows beside them.
export function Avatar({ name, size, radius }: { name: string; size: number; radius?: number }) {
  const { t } = useTheme();
  const h = hashSeed(name);
  const variant = FIELD_NAMES[h % FIELD_NAMES.length];
  // Unsigned shift: a signed `>>` turns uint32 hashes with the top bit set
  // negative, and a negative index is `undefined` for about half of all names.
  const plate = PLATE_COLORS[(h >>> 3) % PLATE_COLORS.length];

  return (
    <View
      style={{ width: size, height: size, borderRadius: radius ?? size / 2, overflow: 'hidden' }}
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
