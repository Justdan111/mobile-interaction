import React from 'react';
import { Text, View } from 'react-native';
import { C } from '../../theme/colors';

/** Three steps on one line: done = green dot, current = green ring, ahead = grey dot. */
export function Stepper({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <View>
      <View className="flex-row items-center" style={{ paddingHorizontal: 42 }}>
        {steps.map((_, i) => {
          const done = i < current;
          const here = i === current;
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                i <= current ? (
                  <View style={{ flex: 1, height: 1.5, backgroundColor: C.go }} />
                ) : (
                  <View className="flex-row" style={{ flex: 1, overflow: 'hidden' }}>
                    {Array.from({ length: 30 }, (_, k) => (
                      <View key={k} style={{ width: 4, height: 1.5, marginRight: 3, backgroundColor: C.node }} />
                    ))}
                  </View>
                )
              ) : null}
              {here ? (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.go, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.ink }} />
                </View>
              ) : (
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: done ? C.go : C.node }} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View className="flex-row justify-between" style={{ marginTop: 12 }}>
        {steps.map((s, i) => (
          <Text
            key={s}
            className="font-body"
            style={{ width: 120, textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center', color: C.ink, fontSize: 12.5, opacity: i <= current ? 1 : 0.85 }}
          >
            {s}
          </Text>
        ))}
      </View>
    </View>
  );
}
