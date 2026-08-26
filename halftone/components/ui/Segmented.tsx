import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type SegmentedOption = { key: string; label: string };

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View className="flex-row rounded-2xl bg-card p-1">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${active ? 'bg-chip' : ''}`}
          >
            <Text
              className={`text-[15px] ${active ? 'text-ink font-semibold' : 'text-muted font-medium'}`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
