import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Icon } from '../ui/icons';

export function SearchBar({
  value,
  onChange,
  onFilterPress,
}: {
  value: string;
  onChange: (next: string) => void;
  onFilterPress?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="mr-2.5 flex-1 flex-row items-center rounded-2xl border border-[#232325] bg-card px-4 py-3.5">
        <Icon name="search" color="#8E8E93" size={19} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search name or training"
          placeholderTextColor="#8E8E93"
          accessibilityLabel="Search name or training"
          returnKeyType="search"
          clearButtonMode="while-editing"
          // Without this the input renders in the platform default face and
          // colour — it does not inherit the screen's text styles.
          className="ml-2.5 flex-1 font-body text-[15px] text-ink"
        />
      </View>

      <Pressable
        onPress={onFilterPress}
        accessibilityRole="button"
        accessibilityLabel="Filters"
        className="h-[50px] w-[50px] items-center justify-center rounded-2xl border border-[#232325] bg-card"
      >
        <Icon name="filter" color="#FFFFFF" size={20} />
      </Pressable>
    </View>
  );
}
