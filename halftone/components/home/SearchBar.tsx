import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Icon } from '../ui/icons';
import { useTheme } from '../../lib/theme';

export function SearchBar({
  value,
  onChange,
  onFilter,
}: {
  value: string;
  onChange: (v: string) => void;
  onFilter?: () => void;
}) {
  const { t } = useTheme();
  return (
    <View className="flex-row items-center gap-2.5 px-5 py-2">
      <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-chip px-4 py-3.5">
        <Icon name="search" size={19} color={t.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search for project"
          placeholderTextColor={t.muted}
          style={{ flex: 1, color: t.ink, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0 }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter projects"
        onPress={onFilter}
        className="items-center justify-center rounded-2xl bg-chip p-3.5"
      >
        <Icon name="filter" size={20} color={t.ink} />
      </Pressable>
    </View>
  );
}
