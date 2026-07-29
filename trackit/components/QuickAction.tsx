import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import { PressableScale } from './motion';

const CIRCLE = 52;

export function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <PressableScale onPress={onPress} to={0.92} style={{ alignItems: 'center' }}>
      <View
        style={{
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: CIRCLE / 2,
          backgroundColor: colors.chip,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 10,
          fontSize: 13.5,
          fontFamily: font.medium,
          color: colors.ink,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
