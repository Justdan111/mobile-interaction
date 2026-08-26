import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '../ui/icons';
import { useTheme } from '../../lib/theme';

export function SettingsRow({
  icon,
  label,
  onPress,
  right,
  last = false,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className={`flex-row items-center gap-3 px-4 py-4 ${last ? '' : 'border-b border-hairline'}`}
    >
      <Icon name={icon} size={21} color={t.ink} strokeWidth={1.7} />
      <Text className="text-ink flex-1 text-[16px]">{label}</Text>
      {right ?? <Icon name="chevronRight" size={19} color={t.muted} />}
    </Pressable>
  );
}
