import { useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, GUTTER } from '@/theme/colors';
import { font } from '@/theme/type';
import { tracking, type TrackingStep } from '@/data/shipments';
import { MAP_H, MAP_W, MapArt, ORIGIN, ROUTE_D, TugBoat, WAYPOINT } from './art/MapArt';
import { ClockIcon, OriginBadge, PhoneIcon, StepIcon, TargetIcon } from './art/TrackingIcons';
import { ScreenHeader } from './ScreenHeader';
import { FadeIn, PopIn, PressableScale, Rise, SlideIn, useAmbient } from './motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SHEET_INSET = 10;

/**
 * Entrance choreography, in order: the chart fades up under the header, then
 * the lane draws attention to itself, the origin pin lands, the waypoint drops
 * in and the tug finally sails in from up-lane. The ETA banner and sheet climb
 * over the bottom of the chart while all that is still playing, so the screen
 * reads as one movement rather than a queue.
 */
const T = {
  map: 0,
  header: 90,
  route: 230,
  origin: 340,
  waypoint: 440,
  boat: 540,
  banner: 250,
  sheet: 330,
  step: (i: number) => 400 + i * 70,
};

/* ─────────────────────────────── map layer ─────────────────────────────── */

/** Full-bleed overlay for SVG drawn in map coordinates. */
function mapLayer(scale: number) {
  return {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: MAP_W * scale,
    height: MAP_H * scale,
  };
}

function Route({ scale }: { scale: number }) {
  const ambient = useAmbient();
  const march = useSharedValue(0);

  useEffect(() => {
    if (!ambient) {
      march.value = 0;
      return;
    }
    // Slide the dash pattern by exactly one period so the lane appears to run
    // toward the ship without ever jumping.
    march.value = withRepeat(withTiming(-18, { duration: 1600, easing: Easing.linear }), -1, false);
  }, [ambient, march]);

  const animated = useAnimatedProps(() => ({ strokeDashoffset: march.value }));

  return (
    <Svg
      width={MAP_W * scale}
      height={MAP_H * scale}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ position: 'absolute' }}
    >
      <AnimatedPath
        d={ROUTE_D}
        stroke="#3CC46E"
        strokeWidth={3}
        fill="none"
        strokeDasharray="9 9"
        strokeLinecap="round"
        animatedProps={animated}
      />
    </Svg>
  );
}

/**
 * The stem and dot beneath the waypoint pill. Kept out of `Route` so it can
 * arrive with the pill it belongs to rather than with the lane — a line
 * pointing up at nothing reads as a mistake.
 */
function WaypointMark({ scale }: { scale: number }) {
  return (
    <Svg
      width={MAP_W * scale}
      height={MAP_H * scale}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ position: 'absolute' }}
    >
      <Path
        d={`M${WAYPOINT.x} 222 L${WAYPOINT.x} ${WAYPOINT.y - 6}`}
        stroke="#FFFFFF"
        strokeWidth={1.6}
      />
      <Circle cx={WAYPOINT.x} cy={WAYPOINT.y} r={6.5} fill="#FFFFFF" stroke="#1F1F1F" strokeWidth={2} />
    </Svg>
  );
}

function OriginPin({ scale, delay }: { scale: number; delay: number }) {
  const ambient = useAmbient();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!ambient) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, [ambient, pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return (
    <PopIn
      delay={delay}
      from={0.4}
      style={{
        position: 'absolute',
        left: ORIGIN.x * scale - 26,
        top: ORIGIN.y * scale - 26,
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: '#3CC46E',
          },
          halo,
        ]}
      />
      <View
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(60,196,110,0.22)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 35,
          height: 35,
          borderRadius: 17.5,
          backgroundColor: 'rgba(60,196,110,0.42)',
        }}
      />
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: '#3CC46E',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OriginBadge />
      </View>
    </PopIn>
  );
}

function WaypointPill({ scale, delay }: { scale: number; delay: number }) {
  return (
    <SlideIn
      from="top"
      delay={delay}
      distance={16}
      style={{
        position: 'absolute',
        left: 167 * scale,
        top: 190 * scale,
        height: 33,
        borderRadius: 17,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
      }}
    >
      <TargetIcon color={colors.white} size={17} />
      <Text
        style={{
          marginLeft: 8,
          fontSize: 14.5,
          fontFamily: font.medium,
          color: colors.white,
          letterSpacing: -0.1,
        }}
      >
        {tracking.waypoint}
      </Text>
    </SlideIn>
  );
}

/* ────────────────────────────── bottom sheet ───────────────────────────── */

function TimelineRow({ step, next, delay }: { step: TrackingStep; next?: TrackingStep; delay: number }) {
  const tint = step.done ? '#3CB566' : '#B7BDC3';
  return (
    <Rise delay={delay}>
      <View style={{ flexDirection: 'row', minHeight: 60 }}>
        <View style={{ width: 32, alignItems: 'center' }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: step.done ? colors.mint : '#F2F3F5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StepIcon name={step.icon} color={tint} size={17} />
          </View>
          {next ? (
            <Svg width={2} height={28} style={{ marginTop: 2 }}>
              <Path
                d="M1 0 L1 28"
                stroke={step.done && next.done ? '#7FD79B' : '#D6DADE'}
                strokeWidth={2}
                strokeDasharray="3 4"
                strokeLinecap="round"
              />
            </Svg>
          ) : null}
        </View>

        <View style={{ flex: 1, marginLeft: 18, paddingTop: 1 }}>
          <Text style={{ fontSize: 14, lineHeight: 18, fontFamily: font.semibold, color: colors.ink }}>
            {step.title}
          </Text>
          <Text
            style={{ marginTop: 2, fontSize: 12, lineHeight: 16, fontFamily: font.regular, color: colors.muted }}
          >
            {step.place}
          </Text>
        </View>

        <Text
          style={{
            marginTop: 2,
            fontSize: 12,
            fontFamily: font.regular,
            color: colors.mutedSoft,
          }}
        >
          {step.date}
        </Text>
      </View>
    </Rise>
  );
}

export function LiveTracking({ standalone = false }: { standalone?: boolean }) {
  const { width } = useWindowDimensions();
  const scale = width / MAP_W;

  return (
    <View style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
      <StatusBar style="light" />

      {/* ── chart ───────────────────────────────────────────────────────── */}
      <View style={{ position: 'absolute', left: 0, top: 0 }}>
        <FadeIn delay={T.map} duration={620}>
          <MapArt width={MAP_W * scale} height={MAP_H * scale} />
        </FadeIn>
        <FadeIn delay={T.route} duration={460} style={mapLayer(scale)}>
          <Route scale={scale} />
        </FadeIn>
        <OriginPin scale={scale} delay={T.origin} />
        <FadeIn delay={T.waypoint} duration={300} style={mapLayer(scale)}>
          <WaypointMark scale={scale} />
        </FadeIn>
        <WaypointPill scale={scale} delay={T.waypoint} />
        <SlideIn
          from="left"
          delay={T.boat}
          distance={44}
          style={{ position: 'absolute', left: 334 * scale, top: 326 * scale }}
        >
          <TugBoat width={72} height={52} />
        </SlideIn>
      </View>

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <SlideIn from="right" delay={T.header} distance={64}>
          <ScreenHeader title="Live tracking" tone="dark" />
        </SlideIn>

        <View style={{ flex: 1 }} pointerEvents="box-none" />

        {/* ── ETA banner + sheet ───────────────────────────────────────── */}
        <Rise delay={T.banner} distance={34} style={{ marginHorizontal: SHEET_INSET }}>
          <View
            style={{
              backgroundColor: colors.orange,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: 20,
              flexDirection: 'row',
            }}
          >
            <View style={{ paddingTop: 1 }}>
              <ClockIcon color={colors.white} size={21} />
            </View>
            <Text
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 14,
                lineHeight: 19.5,
                fontFamily: font.medium,
                color: colors.white,
              }}
            >
              Your package is on the way! Estimated arrival: {tracking.eta}
            </Text>
          </View>
        </Rise>

        <View
          style={{
            height: standalone ? 379 : 300,
            marginHorizontal: SHEET_INSET,
            marginTop: -18,
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 28 }}
          >
            <Rise delay={T.sheet}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 14, lineHeight: 18, fontFamily: font.regular, color: colors.muted }}
                  >
                    Tracking ID
                  </Text>
                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: 17.5,
                      lineHeight: 22,
                      fontFamily: font.semibold,
                      color: colors.ink,
                      letterSpacing: -0.3,
                    }}
                  >
                    {tracking.code}
                  </Text>
                </View>

                <PressableScale
                  to={0.94}
                  style={{
                    height: 37,
                    borderRadius: 18.5,
                    paddingHorizontal: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.dark,
                  }}
                >
                  <PhoneIcon color={colors.brandPill} size={18} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 15.5,
                      fontFamily: font.medium,
                      color: colors.brandPill,
                    }}
                  >
                    Contact
                  </Text>
                </PressableScale>
              </View>
            </Rise>

            <View style={{ height: 1, backgroundColor: '#EDEFF1', marginTop: 18, marginBottom: 20 }} />

            {tracking.steps.map((s, i) => (
              <TimelineRow key={s.id} step={s} next={tracking.steps[i + 1]} delay={T.step(i)} />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Soft green glow reused behind the origin pin on the map. */
export function Glow() {
  return (
    <Svg width={60} height={60}>
      <Defs>
        <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#3CC46E" stopOpacity={0.6} />
          <Stop offset="1" stopColor="#3CC46E" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={30} cy={30} r={30} fill="url(#glow)" />
    </Svg>
  );
}
