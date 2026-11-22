import React from 'react';
import { View } from 'react-native';
import { C } from '../../theme/colors';
import { Icon } from './icons';
import { Press } from './Press';
import { GUTTER } from './Screen';
import { Wordmark } from './Wordmark';

/** Wordmark left, notifications bell with an unread dot right. */
export function Header({ unread = true }: { unread?: boolean }) {
  return (
    <View className="flex-row items-center justify-between" style={{ paddingHorizontal: GUTTER + 4, height: 64 }}>
      <Wordmark color={C.ink} size={24} />
      <Press accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={10}>
        <Icon name="bell" color={C.ink} size={28} strokeWidth={1.6} />
        {unread ? (
          <View
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: C.brand,
              borderWidth: 1.5,
              borderColor: C.page,
            }}
          />
        ) : null}
      </Press>
    </View>
  );
}
