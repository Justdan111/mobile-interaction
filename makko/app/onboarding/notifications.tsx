import React, { useRef, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '../../components/onboarding/PillButton';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { Ruler, type RulerHandle } from '../../components/onboarding/Ruler';
import { Press } from '../../components/ui/Press';
import { NOTIFICATION_KINDS, RULER_MAX, RULER_MIN } from '../../data/notifications';
import { usePrefs } from '../../lib/prefs';
import { C } from '../../theme/colors';

/** The value read-out: a pale blue bubble pointing down at the ruler. */
function ValueBubble({ value }: { value: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ minWidth: 116, height: 74, paddingHorizontal: 22, borderRadius: 30, backgroundColor: C.mist, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="font-body text-ink" style={{ fontSize: 46, lineHeight: 56, fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
      </View>
      <Svg width={20} height={10} viewBox="0 0 20 10" style={{ marginTop: -1 }}>
        <Path d="M0 0h20L11.4 8.6a2 2 0 0 1-2.8 0z" fill={C.mist} />
      </Svg>
    </View>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { perDay, setPerDay } = usePrefs();
  const [kind, setKind] = useState(NOTIFICATION_KINDS[0].id);
  const ruler = useRef<RulerHandle>(null);
  const value = perDay[kind];

  const select = (id: string) => {
    setKind(id);
    ruler.current?.scrollToValue(perDay[id]);
  };

  return (
    <View className="flex-1 bg-page" style={{ paddingTop: insets.top + 22 }}>
      <ProgressBar from={0.48} to={0.82} />
      <Animated.Text
        entering={FadeInDown.duration(500)}
        className="font-bold text-ink text-center"
        style={{ fontSize: 30, lineHeight: 38, letterSpacing: -0.5, marginTop: 44, paddingHorizontal: 28 }}
      >
        How many notifications do you want to receive each day?
      </Animated.Text>

      <View style={{ marginTop: 'auto', marginBottom: 'auto' }}>
        <ValueBubble value={value} />
        <View style={{ height: 22 }} />
        <Ruler ref={ruler} min={RULER_MIN} max={RULER_MAX} width={width} initial={value} onChange={(v) => setPerDay(kind, v)} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 22, gap: 12 }}
      >
        {NOTIFICATION_KINDS.map((k) => {
          const on = k.id === kind;
          return (
            <Animated.View key={k.id} layout={LinearTransition}>
              <Press
                onPress={() => select(k.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${k.label.replace('\n', ' ')}, ${perDay[k.id]} per day`}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 24,
                  padding: 18,
                  backgroundColor: on ? C.blue : C.white,
                  borderWidth: on ? 0 : 1,
                  borderColor: C.line,
                  justifyContent: 'space-between',
                }}
              >
                <View className="flex-row items-start justify-between">
                  <Text style={{ fontSize: 26 }}>{k.emoji}</Text>
                  {on ? (
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text className="font-medium" style={{ color: C.white, fontSize: 16, fontVariant: ['tabular-nums'] }}>
                        {perDay[k.id]}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="font-medium" style={{ color: on ? C.white : C.ink, fontSize: 16, lineHeight: 21 }}>
                  {k.label}
                </Text>
              </Press>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={{ paddingTop: 28, paddingBottom: insets.bottom + 18 }}>
        <PillButton label="Next" onPress={() => router.replace('/feed')} />
      </View>
    </View>
  );
}
