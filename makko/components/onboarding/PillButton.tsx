import React from 'react';
import { Text } from 'react-native';
import { C } from '../../theme/colors';
import { Press } from '../ui/Press';

/** The floating black "Next" pill. */
export function PillButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      style={{ width: 240, height: 58, borderRadius: 29, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
    >
      <Text className="font-semibold" style={{ color: C.white, fontSize: 16 }}>
        {label}
      </Text>
    </Press>
  );
}
