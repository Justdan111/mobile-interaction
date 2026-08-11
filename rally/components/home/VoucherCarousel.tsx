import { useCallback, useEffect, useRef } from 'react';
import {
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { VoucherCard } from '@/components/home/VoucherCard';
import { vouchers } from '@/data/vouchers';
import { colors } from '@/theme/colors';

const PAGE_PADDING = 20;

/** Neighbouring cards sit back at this scale; the centred one is at 1. */
const REST_SCALE = 0.93;
/** How far the copy lags the card, as a fraction of screen width. */
const PARALLAX = 0.18;
/** How long a panel holds before the carousel advances itself. */
const DWELL_MS = 3800;

const COUNT = vouchers.length;

/**
 * The panels are laid out twice. Advancing past the end of the first copy puts
 * an identical panel on screen, so the offset can be reset to the start
 * without animating and the loop is seamless — where scrolling back to page 0
 * would rewind visibly across every panel in between.
 */
const slides = [...vouchers, ...vouchers];

function Slide({
  index,
  scrollX,
  width,
  voucher,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
  voucher: (typeof vouchers)[number];
}) {
  // One range per slide: the offsets at which the previous, this, and the next
  // card are centred.
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollX.value,
          range,
          [REST_SCALE, 1, REST_SCALE],
          Extrapolation.CLAMP,
        ),
      },
    ],
    // Kept fairly high: a deep fade makes the incoming card read as dull
    // on arrival rather than as depth.
    opacity: interpolate(scrollX.value, range, [0.7, 1, 0.7], Extrapolation.CLAMP),
  }));

  // The copy drifts against the card's travel, so the panel reads as having
  // depth rather than sliding as one flat sheet.
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          range,
          [width * PARALLAX, 0, -width * PARALLAX],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={{ width, paddingHorizontal: PAGE_PADDING }}>
      <Animated.View style={[{ aspectRatio: 2.05 }, cardStyle]}>
        <VoucherCard voucher={voucher} contentStyle={contentStyle} />
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const style = useAnimatedStyle(() => {
    // Each dot lights up twice — once for its panel in each copy of the list —
    // so the range covers both. Input stays monotonic because the two active
    // points are COUNT pages apart.
    const range = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
      (index + COUNT - 1) * width,
      (index + COUNT) * width,
      (index + COUNT + 1) * width,
    ];
    return {
      // The active dot stretches into a pill and colours up continuously, so
      // it tracks a half-swipe instead of snapping when the page settles.
      width: interpolate(scrollX.value, range, [8, 22, 8, 8, 22, 8], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(scrollX.value, range, [
        colors.dot,
        colors.teal,
        colors.dot,
        colors.dot,
        colors.teal,
        colors.dot,
      ]),
    };
  });

  return <Animated.View style={[{ height: 8, borderRadius: 4 }, style]} />;
}

export function VoucherCarousel() {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const listRef = useAnimatedRef<Animated.ScrollView>();

  // An auto-playing banner is exactly what "reduce motion" exists for, so
  // honour it: the panels stay swipeable, they just stop moving on their own.
  const reducedMotion = useReducedMotion();

  const page = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holding = useRef(false);

  // Driven on the UI thread — a JS-thread onScroll makes the dots and the
  // scale lag behind the finger under any load.
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const advance = useCallback(() => {
    if (holding.current) return;
    page.current += 1;
    listRef.current?.scrollTo({ x: page.current * width, animated: true });
  }, [listRef, width]);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (reducedMotion) return;
    timer.current = setInterval(advance, DWELL_MS);
  }, [advance, reducedMotion]);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const landed = Math.round(e.nativeEvent.contentOffset.x / width);
    if (landed >= COUNT) {
      // Same panel, second copy — rewind silently so the loop can run on.
      const wrapped = landed - COUNT;
      page.current = wrapped;
      listRef.current?.scrollTo({ x: wrapped * width, animated: false });
    } else {
      page.current = landed;
    }
  }

  return (
    <View>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          holding.current = true;
        }}
        onScrollEndDrag={() => {
          holding.current = false;
          // Give a full dwell after a swipe rather than advancing on whatever
          // was left of the running interval.
          restart();
        }}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {slides.map((voucher, index) => (
          <Slide
            key={`${voucher.id}-${index}`}
            index={index}
            scrollX={scrollX}
            width={width}
            voucher={voucher}
          />
        ))}
      </Animated.ScrollView>

      <View className="mt-4 flex-row items-center justify-center gap-2">
        {vouchers.map((v, i) => (
          <Dot key={v.id} index={i} scrollX={scrollX} width={width} />
        ))}
      </View>
    </View>
  );
}
