import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C } from '../../theme/colors';

/** Points between adjacent values. */
export const UNIT = 9.6;
const MINOR_H = 37;
const MAJOR_H = 46;
const LABEL_H = 22;

export type RulerHandle = { scrollToValue: (v: number, animated?: boolean) => void };

/**
 * A horizontally scrolling tick ruler. The value under the fixed centre dot is
 * reported as the user drags; it snaps to whole units with a haptic tick.
 */
export const Ruler = forwardRef<
  RulerHandle,
  { min: number; max: number; width: number; initial: number; onChange: (v: number) => void }
>(({ min, max, width, initial, onChange }, ref) => {
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const last = useRef(initial);
  const values = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const side = width / 2 - UNIT / 2;

  useImperativeHandle(ref, () => ({
    scrollToValue: (v, animated = true) => {
      last.current = v;
      scroll.current?.scrollTo({ x: (v - min) * UNIT, animated });
    },
  }));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const v = Math.min(max, Math.max(min, Math.round(e.nativeEvent.contentOffset.x / UNIT) + min));
    if (v !== last.current) {
      last.current = v;
      Haptics.selectionAsync().catch(() => {});
      onChange(v);
    }
  };

  return (
    <View style={{ height: LABEL_H + MAJOR_H + 6 }}>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={UNIT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentOffset={{ x: (initial - min) * UNIT, y: 0 }}
        contentContainerStyle={{ paddingHorizontal: side, alignItems: 'flex-end' }}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: last.current }}
      >
        {values.map((v) => {
          const major = v % 10 === 0;
          return (
            <View key={v} style={{ width: UNIT, alignItems: 'center', justifyContent: 'flex-end', height: LABEL_H + MAJOR_H }}>
              {major ? (
                <Text className="font-medium" style={{ position: 'absolute', top: 0, width: 40, textAlign: 'center', color: '#6E6E6E', fontSize: 13 }}>
                  {v}
                </Text>
              ) : null}
              <View
                style={{
                  width: major ? 2.4 : 1.6,
                  height: major ? MAJOR_H : MINOR_H,
                  marginBottom: major ? 0 : (MAJOR_H - MINOR_H) / 2,
                  borderRadius: 1,
                  backgroundColor: major ? '#3D6FD6' : '#A9C3F5',
                }}
              />
            </View>
          );
        })}
      </ScrollView>
      {/* The fixed read-out point. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: width / 2 - 6, top: LABEL_H - 2, width: 12, height: 12, borderRadius: 6, backgroundColor: C.black }}
      />
    </View>
  );
});
Ruler.displayName = 'Ruler';
