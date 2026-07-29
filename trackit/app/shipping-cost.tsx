import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, GUTTER } from '@/theme/colors';
import { font } from '@/theme/type';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FadeIn, PressableScale, Rise, SlideIn } from '@/components/motion';
import {
  CostHero,
  PackageShapeArt,
  RouteCube,
  RulerGlyph,
  WeightGlyph,
} from '@/components/art/ShippingArt';
import {
  DELIVERY_POINTS,
  PACKAGE_SHAPES,
  shippingQuote,
  type DeliveryPoint,
  type PackageShape,
} from '@/data/shipments';

const PANEL_PAD = 17;
const GREEN = '#41C46A';

/** How long the sheet takes to climb, and the curve it climbs on. */
const RISE = 700;
const RISE_EASING = Easing.out(Easing.cubic);
/** How far each panel section travels in from the right. */
const SECTION_TRAVEL = 72;

/**
 * Entrance choreography.
 *
 * Nothing inside moves until the sheet is most of the way up. An earlier pass
 * started the first section at 240ms, and its slide was effectively invisible —
 * a 56px horizontal drift reads as nothing while the whole sheet is still
 * travelling several hundred pixels vertically underneath it. Out-cubic puts
 * the sheet ~87% of the way up by 350ms, so from ~450ms the sections have a
 * near-stationary backdrop to slide across and each one is legible on its own.
 */
const T = {
  header: 260,
  hero: 340,
  panel: 400,
  section: (i: number) => 450 + i * 120, // 450 → 810
  cta: 900,
};

/** One labelled block of the panel, sliding out from under its right edge. */
function Section({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <SlideIn from="right" delay={T.section(index)} distance={SECTION_TRAVEL}>
      {children}
    </SlideIn>
  );
}

function SectionLabel({ children, top = 0 }: { children: string; top?: number }) {
  return (
    <Text
      style={{
        marginTop: top,
        fontSize: 16,
        lineHeight: 21,
        fontFamily: font.semibold,
        color: colors.ink,
        letterSpacing: -0.2,
      }}
    >
      {children}
    </Text>
  );
}

/** Dotted rule joining the pick-up and drop-off marks. */
function Connector() {
  return (
    <Svg width={2} height={39}>
      <Path
        d="M1 0 L1 39"
        stroke="#C9CDD2"
        strokeWidth={1.6}
        strokeDasharray="2 4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LocationRow({
  label,
  value,
  direction,
}: {
  label: string;
  value: string;
  direction: 'in' | 'out';
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <RouteCube direction={direction} color={GREEN} size={26} />
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={{ fontSize: 13, lineHeight: 17, fontFamily: font.regular, color: colors.muted }}>
          {label}
        </Text>
        <Text
          style={{
            marginTop: 1,
            fontSize: 15,
            lineHeight: 20,
            fontFamily: font.medium,
            color: colors.ink,
            letterSpacing: -0.2,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function DetailPill({
  glyph,
  value,
  unit,
}: {
  glyph: React.ReactNode;
  value: string;
  unit: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}
    >
      {glyph}
      <Text
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 15.5,
          fontFamily: font.medium,
          color: colors.ink,
          letterSpacing: -0.2,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 14.5, fontFamily: font.regular, color: colors.muted }}>{unit}</Text>
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: on ? GREEN : '#DADDE1',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {on ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: GREEN }} /> : null}
    </View>
  );
}

export default function ShippingCost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const [shape, setShape] = useState<PackageShape>('cube');
  const [point, setPoint] = useState<DeliveryPoint>('To home');

  const y = useSharedValue(reduceMotion ? 0 : height);
  const scrim = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withTiming(0, { duration: RISE, easing: RISE_EASING });
    scrim.value = withTiming(1, {
      duration: Math.round(RISE * 0.7),
      easing: Easing.out(Easing.quad),
    });
  }, [reduceMotion, y, scrim]);

  // Drop the sheet back down before popping the route, so leaving mirrors
  // arriving instead of cutting straight to Home.
  const close = () => {
    if (reduceMotion) {
      router.back();
      return;
    }
    scrim.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) });
    y.value = withTiming(height, { duration: 380, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  };

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />

      {/* Dims Home showing through behind the sheet; tapping it dismisses. */}
      <Animated.View
        style={[
          { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,12,16,0.45)' },
          scrimStyle,
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>

      {/* The sheet stops short of the top so Home stays stacked behind it. */}
      <Animated.View
        style={[
          {
            flex: 1,
            marginTop: insets.top + 12,
            backgroundColor: colors.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
          },
          sheetStyle,
        ]}
      >
        <View style={{ alignItems: 'center', paddingTop: 9 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#DFE3E7' }} />
        </View>

        <SlideIn from="right" delay={T.header} distance={64} style={{ marginTop: 10 }}>
          <ScreenHeader title="Shipping cost" onBack={close} />
        </SlideIn>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 12 }}
        >
          <Rise delay={T.hero} style={{ alignItems: 'center', marginTop: 30, marginBottom: 22 }}>
            <CostHero size={104} />
          </Rise>

          <FadeIn delay={T.panel} duration={420}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 22,
                padding: PANEL_PAD,
                // Clips the sections while they travel so each one appears to
                // slide out from behind the panel's edge rather than over the
                // screen gutter.
                overflow: 'hidden',
              }}
            >
              <Section index={0}>
                <SectionLabel>Location</SectionLabel>

                <View
                  style={{
                    marginTop: 14,
                    backgroundColor: colors.white,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <LocationRow label="Pick-up" value={shippingQuote.pickup} direction="in" />
                  <View style={{ height: 1, backgroundColor: '#EEF0F2', marginVertical: 14 }} />
                  <LocationRow label="Drop-off" value={shippingQuote.dropoff} direction="out" />
                  <View style={{ position: 'absolute', left: 28, top: 51 }}>
                    <Connector />
                  </View>
                </View>
              </Section>

              <Section index={1}>
                <SectionLabel top={22}>Details</SectionLabel>
                <View style={{ marginTop: 14, flexDirection: 'row', gap: 14 }}>
                  <DetailPill
                    glyph={<WeightGlyph color={GREEN} size={24} />}
                    value={shippingQuote.weightKg}
                    unit="kg"
                  />
                  <DetailPill
                    glyph={<RulerGlyph color={GREEN} size={24} />}
                    value={shippingQuote.dimensions}
                    unit="cm"
                  />
                </View>
              </Section>

              <Section index={2}>
                <SectionLabel top={24}>Package shape</SectionLabel>
                <View style={{ marginTop: 14, flexDirection: 'row', gap: 12 }}>
                  {PACKAGE_SHAPES.map((s) => {
                    const on = s === shape;
                    return (
                      <PressableScale
                        key={s}
                        to={0.94}
                        onPress={() => setShape(s)}
                        style={{
                          width: 64,
                          height: 66,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: on ? '#EFFBF5' : colors.white,
                          borderWidth: 1.4,
                          borderColor: on ? GREEN : 'transparent',
                        }}
                      >
                        <PackageShapeArt shape={s} size={48} />
                        {on ? (
                          <View
                            style={{
                              position: 'absolute',
                              top: 7,
                              right: 7,
                              width: 9,
                              height: 9,
                              borderRadius: 5,
                              backgroundColor: GREEN,
                            }}
                          />
                        ) : null}
                      </PressableScale>
                    );
                  })}
                </View>
              </Section>

              <Section index={3}>
                <SectionLabel top={24}>Delivery Point</SectionLabel>
                <View style={{ marginTop: 14, flexDirection: 'row', gap: 12 }}>
                  {DELIVERY_POINTS.map((p) => (
                    <PressableScale
                      key={p}
                      to={0.97}
                      onPress={() => setPoint(p)}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: colors.white,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 13,
                      }}
                    >
                      <Radio on={p === point} />
                      <Text
                        style={{
                          marginLeft: 11,
                          fontSize: 15,
                          fontFamily: font.medium,
                          color: colors.ink,
                          letterSpacing: -0.2,
                        }}
                      >
                        {p}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </Section>
            </View>
          </FadeIn>
        </ScrollView>

        <Rise
          delay={T.cta}
          style={{
            paddingHorizontal: GUTTER,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 14),
          }}
        >
          <PressableScale
            to={0.975}
            style={{
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17, fontFamily: font.medium, color: colors.brandPill }}>
              Continue at ${shippingQuote.price}
            </Text>
          </PressableScale>
        </Rise>
      </Animated.View>
    </View>
  );
}
