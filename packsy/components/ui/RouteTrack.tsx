import React from 'react';
import { View } from 'react-native';
import { C } from '../../theme/colors';

/**
 * Origin · current · destination. Travelled track is solid green, the rest
 * a grey dash; the current node is a green ring with a white core. When the
 * parcel has arrived the whole track is green and the last node is current.
 */
export function RouteTrack({ stage, surface }: { stage: 0 | 1 | 2; surface: string }) {
  const node = (i: 0 | 1 | 2) => {
    const current = i === stage;
    const done = i < stage;
    if (current) {
      return (
        <View
          key={i}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: C.go,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#FFFFFF' }} />
        </View>
      );
    }
    return (
      <View
        key={i}
        style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: done ? C.go : C.node, borderWidth: 0, borderColor: surface }}
      />
    );
  };

  const segment = (travelled: boolean, key: string) => (
    <View key={key} style={{ flex: 1, height: 2, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
      {travelled ? (
        <View style={{ flex: 1, height: 1.5, backgroundColor: C.go }} />
      ) : (
        // A dashed border renders unreliably on iOS for a 1-sided View, so
        // the dash is drawn as a row of short bars.
        Array.from({ length: 40 }, (_, i) => (
          <View key={i} style={{ width: 4, height: 1.5, marginRight: 3, backgroundColor: C.track }} />
        ))
      )}
    </View>
  );

  return (
    <View className="flex-row items-center">
      {node(0)}
      {segment(stage >= 1, 'a')}
      {node(1)}
      {segment(stage >= 2, 'b')}
      {node(2)}
    </View>
  );
}
