import React, { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useColors } from '../../theme/ThemeProvider';
import { Icon } from '../ui/icons';

export const FIELD_HEIGHT = 64;

export function Field(props: TextInputProps) {
  const C = useColors();
  return (
    <View className="justify-center rounded-full bg-card" style={{ height: FIELD_HEIGHT, paddingHorizontal: 24 }}>
      <TextInput placeholderTextColor={C.placeholder} className="font-body text-ink" style={{ fontSize: 16.5 }} {...props} />
    </View>
  );
}

/** A pill that opens an inline list of options beneath itself. */
export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  const C = useColors();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <Animated.View layout={LinearTransition.duration(220)} className="rounded-[32px] bg-card" style={{ overflow: 'hidden' }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current}`}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between"
        style={{ height: FIELD_HEIGHT, paddingHorizontal: 24 }}
      >
        <Text className="font-body text-ink" style={{ fontSize: 16.5 }}>
          {current}
        </Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" color={C.ink} surface={C.card} size={22} />
        </View>
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={{ paddingBottom: 10 }}>
          {options
            .filter((o) => o.value !== value)
            .map((o) => (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                style={{ paddingHorizontal: 24, paddingVertical: 12 }}
              >
                <Text className="font-body" style={{ color: C.dim, fontSize: 16 }}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
