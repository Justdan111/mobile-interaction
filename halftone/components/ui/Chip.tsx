import React from 'react';
import { Text, View } from 'react-native';
import { Icon, type IconName } from './icons';
import { useTheme } from '../../lib/theme';

export function Chip({ icon, label }: { icon?: IconName; label: string }) {
  const { t } = useTheme();
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-chip px-3 py-1.5">
      {icon ? <Icon name={icon} size={13} color={t.muted} strokeWidth={1.6} /> : null}
      <Text className="text-muted text-[12px] font-medium">{label}</Text>
    </View>
  );
}
