import React from 'react';
import { Pressable, Text } from 'react-native';
import { useColors } from '../../theme/ThemeProvider';

/** A selectable pill: pale grey with dark text when on, card grey with white text when off. */
export function Chip({
  label,
  active,
  onPress,
  children,
  height = 42,
}: {
  label: string;
  active: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  height?: number;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={{
        height,
        paddingHorizontal: 16,
        borderRadius: height / 2,
        backgroundColor: active ? C.pill : C.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children ?? (
        <Text className="font-medium" style={{ fontSize: 15, color: active ? C.onPill : C.ink }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
