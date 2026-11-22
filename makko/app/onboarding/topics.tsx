import React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '../../components/onboarding/PillButton';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { TopicTile } from '../../components/onboarding/TopicTile';
import { INTERESTS, type InterestTile } from '../../data/topics';
import { usePrefs } from '../../lib/prefs';

const GUTTER = 22;
const GAP = 12;
/** Share of a row's width for each span; a row is always wide+narrow or half+half. */
const SPAN: Record<InterestTile['span'], number> = { wide: 0.66, narrow: 0.34, half: 0.5 };

export default function Topics() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { interests, toggleInterest } = usePrefs();
  const inner = width - GUTTER * 2 - GAP;
  const tileH = inner * 0.5;

  return (
    <View className="flex-1 bg-page">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 22, paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar from={1 / 3} to={0.48} />
        <Animated.Text
          entering={FadeInDown.duration(500)}
          className="font-bold text-ink text-center"
          style={{ fontSize: 30, lineHeight: 38, letterSpacing: -0.5, marginTop: 44, marginBottom: 36 }}
        >
          Choose the topics you are interested in
        </Animated.Text>

        <View style={{ gap: GAP }}>
          {INTERESTS.map((row, r) => (
            <Animated.View key={r} entering={FadeInDown.duration(450).delay(120 + r * 80)} className="flex-row" style={{ gap: GAP }}>
              {row.map((t) => (
                <TopicTile
                  key={t.id}
                  tile={t}
                  width={inner * SPAN[t.span]}
                  height={tileH}
                  selected={interests.has(t.id)}
                  onToggle={() => toggleInterest(t.id)}
                />
              ))}
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 18 }}>
        <PillButton label="Next" onPress={() => router.push('/onboarding/notifications')} />
      </View>
    </View>
  );
}
