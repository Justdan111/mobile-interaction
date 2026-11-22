import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble, EmojiBubble } from '../components/onboarding/Bubbles';
import { RingButton } from '../components/onboarding/RingButton';
import { Media, mediaFor } from '../components/ui/Media';
import { Wordmark } from '../components/ui/Wordmark';
import { C } from '../theme/colors';

/** The stage is laid out on a 393pt-wide grid and scaled to the device. */
const GRID = 393;

const pop = (delay: number) => ZoomIn.springify().damping(13).stiffness(160).delay(delay);

export default function Intro() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const k = width / GRID;
  const top = insets.top;

  const card = { left: 70 * k, top: top + 125 * k, width: 252 * k, height: 317 * k };
  const subject = mediaFor('intro-woman');
  const subjectH = 372 * k;
  // Sized by width so she stays within the card's sides. Her full height runs
  // past the card's bottom edge, which crops her at the waist and hides
  // whatever she was standing on.
  const subjectW = card.width * 1.12;
  const fitH = subject ? subjectW / subject.aspect : subjectH * 1.2;

  return (
    <View className="flex-1 bg-page">
      <View style={{ position: 'absolute', top: top + 2, left: 0, right: 0, alignItems: 'center' }}>
        <Wordmark color="#DD7A55" size={20} />
      </View>

      <Animated.View
        entering={FadeIn.duration(500)}
        style={{ position: 'absolute', ...card, borderRadius: 26 * k, backgroundColor: C.peach }}
      />

      {/* The subject stands in the card and rises above its top edge; the
          card's bottom edge crops her at the waist. */}
      <Animated.View
        entering={FadeInDown.duration(700).delay(150)}
        style={{
          position: 'absolute',
          left: card.left + card.width / 2 - subjectW / 2,
          top: card.top + card.height - subjectH,
          width: subjectW,
          height: subjectH,
          overflow: 'hidden',
          borderBottomLeftRadius: 26 * k,
          borderBottomRightRadius: 26 * k,
        }}
      >
        <Media slug="intro-woman" style={{ width: subjectW, height: fitH }} contentFit="contain" accessibilityLabel="Smiling woman holding a phone" />
      </Animated.View>

      <Animated.View entering={pop(650)} style={{ position: 'absolute', left: 42 * k, top: top + 200 * k }}>
        <EmojiBubble emoji="👋" tail="right" />
      </Animated.View>
      <Animated.View entering={pop(800)} style={{ position: 'absolute', left: 232 * k, top: top + 226 * k }}>
        <ChatBubble text="Meet new friends and connect!" width={150 * k} />
      </Animated.View>
      <Animated.View entering={pop(950)} style={{ position: 'absolute', left: 309 * k, top: top + 326 * k }}>
        <EmojiBubble emoji="😍" tail="left" />
      </Animated.View>
      <Animated.View entering={pop(1100)} style={{ position: 'absolute', left: 26 * k, top: top + 372 * k }}>
        <ChatBubble text="Share your world through photos and stories." width={156 * k} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={{ position: 'absolute', left: 24, right: 24, top: top + 478 * k }}
      >
        <Text className="font-bold text-ink text-center" style={{ fontSize: 36 * Math.min(k, 1.05), lineHeight: 44 * Math.min(k, 1.05), letterSpacing: -0.6 }}>
          Explore the best content by unique people
        </Text>
      </Animated.View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 34, alignItems: 'center' }}>
        <RingButton progress={1 / 3} onPress={() => router.push('/onboarding/topics')} />
      </View>
    </View>
  );
}
