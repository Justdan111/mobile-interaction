import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';
import { MARK_FILL, MARK_LEGEND } from './markPalette';

export function Legend() {
  const { t } = useTheme();
  return (
    <View className="flex-row flex-wrap items-center gap-x-5 gap-y-2 px-1 py-4">
      {MARK_LEGEND.map((i) => (
        <View key={i.label} className="flex-row items-center gap-2">
          {/* Colour comes from the same map MonthGrid fills its cells from, so
              the swatch cannot drift from the thing it explains. */}
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: t[MARK_FILL[i.kind]] }} />
          <Text className="text-muted text-[13px]">{i.label}</Text>
        </View>
      ))}
    </View>
  );
}
