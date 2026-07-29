import { View } from 'react-native';

const ROWS = Array.from({ length: 90 }, (_, i) => i);

/**
 * Corduroy-like horizontal ridge texture: stacked rows whose top edge
 * catches a faint highlight, with deterministic per-row variation.
 */
export function RidgeBackdrop() {
  return (
    <View className="absolute inset-0 overflow-hidden bg-ink" pointerEvents="none">
      {ROWS.map((i) => {
        const wobble = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        return (
          <View
            key={i}
            style={{
              height: 8 + wobble * 6,
              backgroundColor: wobble > 0.5 ? '#0C0F16' : '#0A0D13',
              borderTopWidth: 1,
              borderTopColor: `rgba(148, 163, 184, ${0.03 + wobble * 0.05})`,
            }}
          />
        );
      })}
    </View>
  );
}
