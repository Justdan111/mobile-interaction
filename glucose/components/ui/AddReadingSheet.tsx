import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet } from '@/components/ui/Sheet';
import { useAppState } from '@/state/app-state';
import { classify, formatValue, toUnit } from '@/lib/glucose';
import { colors } from '@/theme/colors';

/** Steps are per-unit so the control feels the same in either scale. */
const STEP = { 'mg/dL': [1, 10], 'mmol/L': [0.1, 1] } as const;

const BAND_COPY = {
  low: { text: 'Below target', tint: colors.amberCap },
  in: { text: 'In target', tint: colors.badge },
  high: { text: 'Above target', tint: colors.clayCap },
} as const;

export function AddReadingSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { unit, target, current, addReading } = useAppState();
  const [mgdl, setMgdl] = useState(current);

  // Reopening should start from wherever the trace is now, not the last edit.
  useEffect(() => {
    if (visible) setMgdl(current);
  }, [visible, current]);

  const [fine, coarse] = STEP[unit];
  const band = classify(mgdl, target);
  const { text, tint } = BAND_COPY[band];

  const nudge = (deltaInUnit: number) => {
    const deltaMgdl = unit === 'mg/dL' ? deltaInUnit : deltaInUnit * 18.0182;
    setMgdl((v) => Math.min(600, Math.max(20, v + deltaMgdl)));
    Haptics.selectionAsync();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Add information."
      subtitle="Log a fingerstick or a manual reading for right now."
    >
      <View className="items-center">
        <View className="flex-row items-baseline">
          <Text
            className="font-inter-bold text-[76px] leading-[80px] text-chalk"
            style={{ letterSpacing: -4 }}
          >
            {formatValue(mgdl, unit)}
          </Text>
          <Text className="ml-2 font-inter-medium text-[20px] text-mist">
            {unit}
          </Text>
        </View>

        <View
          className="mt-1 rounded-full px-3 py-1"
          style={{ backgroundColor: `${tint}26` }}
        >
          <Text className="font-inter-medium text-[12px]" style={{ color: tint }}>
            {text}
          </Text>
        </View>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-2.5">
        {[-coarse, -fine, fine, coarse].map((delta) => (
          <Pressable
            key={delta}
            accessibilityRole="button"
            accessibilityLabel={`${delta > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(delta)}`}
            onPress={() => nudge(delta)}
            className={`h-[54px] items-center justify-center rounded-full border border-button-edge bg-button active:opacity-70 ${
              Math.abs(delta) === coarse ? 'w-[76px]' : 'w-[62px]'
            }`}
          >
            <Text className="font-inter-medium text-[16px] text-chalk">
              {delta > 0 ? `+${delta}` : delta}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          addReading(mgdl);
          onClose();
        }}
        className="mt-4 h-[58px] items-center justify-center rounded-full bg-chip-active active:opacity-70"
      >
        <Text
          className="font-inter-medium text-[16px] text-chalk"
          style={{ letterSpacing: 0.9 }}
        >
          SAVE READING
        </Text>
      </Pressable>

      <Text className="mb-1 mt-3 text-center font-inter text-[11px] leading-[16px] text-smoke">
        Saved readings extend today's trace and update every figure.
      </Text>
    </Sheet>
  );
}
