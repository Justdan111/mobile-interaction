import React from 'react';
import { Text, View } from 'react-native';
import { greeting } from '../../lib/format';

export function GreetingHeader() {
  return (
    <View className="px-5 pb-2 pt-1">
      <Text className="font-display text-ink text-[30px]">
        {greeting(new Date().getHours())} <Text className="text-[26px]">⚡</Text>
      </Text>
    </View>
  );
}
