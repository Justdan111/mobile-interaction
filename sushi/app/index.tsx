import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paper } from '@/components/Paper';
import { VerticalText } from '@/components/VerticalText';
import { SumiLandscape } from '@/components/art/SumiLandscape';
import { ArrowRightIcon } from '@/components/art/MenuIcons';
import { PressableScale, Slide } from '@/components/motion';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';

const inkWash = require('../assets/img/ink-wash.png');
const mountain = require('../assets/img/ink-mountain.png');
const hero = require('../assets/img/cut/deluxe-platter.png');

const PAD = 20;

/**
 * The screen assembles in four beats: the wordmark writes itself on from the
 * left, the painted scene slides in behind it, then the pitch and the button.
 * Each beat opens while the one before it is still settling, so the whole
 * thing reads as one movement rather than four.
 */
const ENTER = {
  wordmark: { delay: 0, stagger: 120, from: -24, duration: 560 },
  caption: { delay: 300, distance: 18, duration: 560 },
  scene: { delay: 420, duration: 780 },
  pitch: { delay: 760, distance: 28, duration: 620 },
  button: { delay: 1000, duration: 620 },
} as const;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  return (
    <View className="flex-1">
      <Paper />
      <StatusBar style="dark" />

      {/* ------------------------------------------------ the scene ---- */}
      <View pointerEvents="none" className="absolute inset-0">
        {/* The whole painting travels as one, so the sun keeps its place
            behind the ridge and the platter its place in front of it. */}
        <Slide
          from="right"
          distance={W * 0.16}
          delay={ENTER.scene.delay}
          duration={ENTER.scene.duration}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={inkWash}
            contentFit="contain"
            style={{
              position: 'absolute',
              left: W * 0.13,
              top: H * 0.075,
              width: W * 0.68,
              height: W * 0.68,
              opacity: 0.32,
            }}
          />

          {/* Sun, then the ridge wash over it, then the pine over that — the
              order is the depth of the scene, and it is what lets the peak
              eclipse the bottom of the disc the way the comp does. */}
          <View style={{ position: 'absolute', right: -W * 0.05, top: H * 0.05 }}>
            <SumiLandscape width={W * 0.84} height={W * 0.79} pine={false} />
          </View>
          <Image
            source={mountain}
            contentFit="contain"
            style={{
              position: 'absolute',
              left: W * 0.26,
              top: H * 0.098,
              width: W * 0.86,
              height: W * 0.65,
            }}
          />
          <View style={{ position: 'absolute', right: -W * 0.05, top: H * 0.05 }}>
            <SumiLandscape width={W * 0.84} height={W * 0.79} sun={false} />
          </View>
          <Image
            source={hero}
            contentFit="contain"
            style={{
              position: 'absolute',
              left: -W * 0.11,
              top: H * 0.262,
              width: W * 1.22,
              height: W * 0.86,
            }}
          />
        </Slide>
      </View>

      {/* ------------------------------------------- vertical wordmark ---- */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: W * 0.13, top: H * 0.085 }}
      >
        <VerticalText
          color={colors.ink}
          size={72}
          spacing={-4}
          weight="600"
          enter={ENTER.wordmark}
        >
          寿司
        </VerticalText>
      </View>

      {/* Twelve glyphs one at a time would outrun the rest of the sequence,
          so the caption arrives from the left as a single line. */}
      <Slide
        pointerEvents="none"
        from="left"
        distance={ENTER.caption.distance}
        delay={ENTER.caption.delay}
        duration={ENTER.caption.duration}
        style={{ position: 'absolute', left: W * 0.055, top: H * 0.15 }}
      >
        <VerticalText color={colors.ink} size={13} spacing={7}>
          新鮮な味わい、伝統の技
        </VerticalText>
      </Slide>

      {/* ------------------------------------------------- the pitch ---- */}
      <View
        className="flex-1 justify-end"
        style={{ paddingHorizontal: PAD, paddingBottom: Math.max(insets.bottom, 18) }}
      >
        {/* Headline and strapline rise as one block — they read as a single
            sentence, so splitting their timing pulls them apart. */}
        <Slide
          from="bottom"
          distance={ENTER.pitch.distance}
          delay={ENTER.pitch.delay}
          duration={ENTER.pitch.duration}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: font.black,
              fontSize: 35,
              lineHeight: 42,
              letterSpacing: -0.6,
              color: colors.ink,
            }}
          >
            Authentic Sushi
          </Text>

          <Text
            style={{
              marginTop: 12,
              maxWidth: W * 0.72,
              fontFamily: font.regular,
              fontSize: 13,
              lineHeight: 22,
              letterSpacing: 0.9,
              color: colors.inkSoft,
            }}
          >
            CRAFTED WITH TRADITION. SERVED WITH PASSION
          </Text>
        </Slide>

        <Slide
          from="right"
          distance={W * 0.3}
          delay={ENTER.button.delay}
          duration={ENTER.button.duration}
        >
          <PressableScale
            to={0.975}
            accessibilityLabel="Explore the menu"
            onPress={() => router.push('/menu')}
            style={{
              marginTop: 26,
              marginHorizontal: 6,
              height: 76,
              borderRadius: 38,
              backgroundColor: '#0B0B09',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 32,
              paddingRight: 11,
            }}
          >
            <Text
              style={{
                fontFamily: font.bold,
                fontSize: 17.5,
                letterSpacing: -0.2,
                color: colors.white,
              }}
            >
              Explore Menu
            </Text>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: colors.terracotta,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRightIcon size={23} color={colors.white} />
            </View>
          </PressableScale>
        </Slide>
      </View>
    </View>
  );
}
