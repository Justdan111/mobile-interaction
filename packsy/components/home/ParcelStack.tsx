import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { art } from '../../lib/art';
import { formatDate } from '../../lib/format';
import { arrivalAt, shippedAt, stage, status, type Parcel } from '../../lib/packages';
import { C } from '../../theme/colors';
import { CarrierMark } from '../ui/CarrierMark';
import { StatusPill } from '../ui/StatusPill';

export const CARD_HEIGHT = 196;
/** How far each card behind peeks out below the one in front. */
const PEEK = 16;
/** How much narrower each card behind is, per side. */
const INSET = 14;
/** Dark ink used on every card tone — legible on sun, iris and coral alike. */
const INK = C.night;
const INK_SOFT = 'rgba(17,17,17,0.55)';

function CardFace({ parcel, onTone }: { parcel: Parcel; onTone: string }) {
  const box = art['parcel-hero'];
  const boxH = 150;
  const delivered = stage(parcel) === 2;
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Drawn first so the header's pill stays on top of it. The card's
          bottom edge crops the box, as in the comp. */}
      <View style={{ position: 'absolute', right: -14, bottom: -34 }} pointerEvents="none">
        <Image source={box.source} style={{ width: boxH * box.aspect, height: boxH, transform: [{ scaleX: -1 }, { rotate: '4deg' }] }} contentFit="contain" />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 14 }}>
          <CarrierMark carrier={parcel.carrier} size={46} />
          <Text className="font-semibold" style={{ color: INK, fontSize: 17.5, letterSpacing: 0.3 }}>
            {parcel.id}
          </Text>
        </View>
        <StatusPill status={status(parcel)} variant="outline" ink={INK} surface={onTone} />
      </View>

      <View className="flex-row" style={{ marginTop: 30, marginLeft: 4 }}>
        {/* Origin dot, dashed leg, destination ring. */}
        <View style={{ alignItems: 'center', width: 12, paddingTop: 22 }}>
          <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: INK }} />
          {Array.from({ length: 8 }, (_, i) => (
            <View key={i} style={{ width: 1.4, height: 3, backgroundColor: INK, marginTop: 3 }} />
          ))}
          <View
            style={{
              marginTop: 3,
              width: 13,
              height: 13,
              borderRadius: 6.5,
              backgroundColor: delivered ? INK : '#FFFFFF',
              borderWidth: 3.5,
              borderColor: INK,
            }}
          />
        </View>
        <View style={{ marginLeft: 14, gap: 16 }}>
          <View>
            <Text className="font-body" style={{ color: INK_SOFT, fontSize: 13, lineHeight: 18 }}>
              {formatDate(shippedAt(parcel))}
            </Text>
            <Text className="font-medium" style={{ color: INK, fontSize: 15.5, lineHeight: 21 }}>
              {parcel.origin.city}, {parcel.origin.country}
            </Text>
          </View>
          <View>
            <Text className="font-body" style={{ color: INK_SOFT, fontSize: 13, lineHeight: 18 }}>
              {formatDate(arrivalAt(parcel))}
            </Text>
            <Text className="font-medium" style={{ color: INK, fontSize: 15.5, lineHeight: 21 }}>
              {parcel.destination.city}, {parcel.destination.country}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function StackCard({
  parcel,
  depth,
  drag,
  width,
}: {
  parcel: Parcel;
  depth: number;
  drag: SharedValue<number>;
  width: number;
}) {
  const tone = C[parcel.tone ?? 'sun'];
  // Only the front card shows its face; the next one fades its in as it rises.
  const face = useAnimatedStyle(() => {
    if (depth === 0) return { opacity: 1 };
    if (depth > 1) return { opacity: 0 };
    return { opacity: Math.min(Math.abs(drag.value) / (width * 0.6), 1) };
  });
  const style = useAnimatedStyle(() => {
    // As the front card is dragged away, every card behind moves up one slot.
    const progress = Math.min(Math.abs(drag.value) / (width * 0.6), 1);
    const d = depth === 0 ? 0 : depth - progress;
    const scale = 1 - (d * INSET * 2) / width;
    const ty = CARD_HEIGHT / 2 + d * PEEK - (CARD_HEIGHT / 2) * scale;
    if (depth === 0) {
      return {
        transform: [
          { translateX: drag.value },
          { translateY: Math.abs(drag.value) * 0.04 },
          { rotate: `${interpolate(drag.value, [-width, width], [-9, 9])}deg` },
        ],
      };
    }
    return { transform: [{ translateY: ty }, { scale }] };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: CARD_HEIGHT,
          borderRadius: 30,
          backgroundColor: tone,
          overflow: 'hidden',
          zIndex: 10 - depth,
        },
        style,
      ]}
    >
      <Animated.View style={[{ flex: 1 }, face]}>
        <CardFace parcel={parcel} onTone={tone} />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Home's stack of active parcels. Fling the front card either way and it
 * goes to the back; the next one rises into place. Tap opens the parcel.
 */
export function ParcelStack({
  parcels,
  width,
  onFrontChange,
}: {
  parcels: Parcel[];
  width: number;
  onFrontChange: (p: Parcel) => void;
}) {
  const [order, setOrder] = useState(() => parcels.map((_, i) => i));
  const drag = useSharedValue(0);

  const cycle = useCallback(() => {
    setOrder((o) => [...o.slice(1), o[0]]);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-14, 14],
    onUpdate: (e) => {
      'worklet';
      drag.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      const flung = Math.abs(e.translationX) > width * 0.28 || Math.abs(e.velocityX) > 800;
      if (flung) {
        const dir = Math.sign(e.translationX || e.velocityX) || 1;
        drag.value = withTiming(dir * width * 1.3, { duration: 220 }, (done) => {
          if (done) scheduleOnRN(cycle);
        });
      } else {
        drag.value = withSpring(0, { damping: 16, stiffness: 180 });
      }
    },
  });

  // Reset the drag in the same commit that reorders the cards. Resetting it
  // before the reorder lands flashes the thrown card back to the centre for a
  // frame; resetting after flashes the new front card off-screen.
  useLayoutEffect(() => {
    drag.value = 0;
  }, [order, drag]);

  useEffect(() => {
    onFrontChange(parcels[order[0]]);
  }, [order, parcels, onFrontChange]);

  const front = parcels[order[0]];
  return (
    <View style={{ height: CARD_HEIGHT + PEEK * (parcels.length - 1) }}>
      {order
        .map((idx, depth) => ({ idx, depth }))
        .reverse()
        .map(({ idx, depth }) =>
          depth === 0 ? (
            <GestureDetector key={parcels[idx].id} gesture={pan}>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: CARD_HEIGHT, zIndex: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${front.id}`}
                  onPress={() => router.push(`/package/${front.id}`)}
                  style={{ flex: 1 }}
                >
                  <StackCard parcel={parcels[idx]} depth={0} drag={drag} width={width} />
                </Pressable>
              </View>
            </GestureDetector>
          ) : (
            <StackCard key={parcels[idx].id} parcel={parcels[idx]} depth={depth} drag={drag} width={width} />
          )
        )}
    </View>
  );
}
