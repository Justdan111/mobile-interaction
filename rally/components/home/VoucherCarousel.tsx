import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
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
    const range = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      // The active dot stretches into a pill and colours up continuously, so
      // it tracks a half-swipe instead of snapping when the page settles.
      width: interpolate(scrollX.value, range, [8, 22, 8], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(scrollX.value, range, [
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

  // Driven on the UI thread — a JS-thread onScroll makes the dots and the
  // scale lag behind the finger under any load.
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {/* Only four panels, so they all mount — no virtualisation needed, and
            a plain ScrollView keeps the scroll handler simple. */}
        {vouchers.map((voucher, index) => (
          <Slide
            key={voucher.id}
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
