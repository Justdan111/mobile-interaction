import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export function IconButton({
  children,
  onPress,
  className = '',
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  /** For geometry a class can't carry — e.g. a circle sized by a prop. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`items-center justify-center ${className}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
