import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { C } from '../../theme/colors';

export function Avatar({ source, size }: { source?: number; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: C.line }}>
      {source ? <Image source={source} style={{ width: size, height: size }} contentFit="cover" /> : null}
    </View>
  );
}
