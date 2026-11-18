import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures } from 'react-native-gesture-handler';
import Svg, { Path, Text as SvgText, TextPath } from 'react-native-svg';
import { buildCity, WORLD } from '../../lib/streets';
import type { Place, PlaceKind } from '../../lib/places';
import { TONES } from '../../theme/colors';
import { useColors } from '../../theme/ThemeProvider';
import { Icon } from '../ui/icons';

/** Upper zoom bound: the SVG is a bitmap once the view is scaled, so going
 *  much past 1.6× its drawn size starts to show softness. */
const MAX_SCALE = 1.6;

export const PIN_COLOUR: Record<PlaceKind, string> = { pickup: TONES.go, locker: TONES.iris, transit: TONES.sun };

export type CityMapHandle = { zoomBy: (factor: number) => void; focus: (p: Place) => void };

function Pin({ place, selected, scale, onPress }: { place: Place; selected: boolean; scale: SharedValue<number>; onPress: () => void }) {
  const C = useColors();
  const size = selected ? 46 : 18;
  // Pins live in world space so they ride the pan, but cancel the zoom so they
  // stay a constant size on screen.
  const counter = useAnimatedStyle(() => ({ transform: [{ scale: 1 / scale.value }] }));
  return (
    <Animated.View
      style={[{ position: 'absolute', left: place.x - size / 2, top: place.y - size / 2, width: size, height: size, zIndex: selected ? 2 : 1 }, counter]}
    >
      <Pressable onPress={onPress} hitSlop={14} accessibilityRole="button" accessibilityLabel={place.name} style={{ flex: 1 }}>
        {selected ? (
          <View className="flex-1 items-center justify-center rounded-full" style={{ backgroundColor: C.sun }}>
            <Icon name="dolly" color={C.night} surface={C.sun} size={22} />
          </View>
        ) : (
          <View className="flex-1 rounded-full" style={{ backgroundColor: TONES.core, borderWidth: 3.5, borderColor: PIN_COLOUR[place.kind] }} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export const CityMap = forwardRef<
  CityMapHandle,
  { places: Place[]; selectedId: string | null; onSelect: (p: Place) => void }
>(({ places, selectedId, onSelect }, ref) => {
  const C = useColors();
  const city = useMemo(() => buildCity(), []);
  const [view, setView] = useState({ w: 0, h: 0 });
  const s = useSharedValue(0.65);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const start = useSharedValue({ s: 1, tx: 0, ty: 0 });
  const bounds = useSharedValue({ w: 1, h: 1, min: 0.4 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w === view.w && h === view.h) return;
    setView({ w, h });
    const base = w / 640;
    bounds.value = { w, h, min: Math.max(w / WORLD.width, h / WORLD.height) };
    s.value = base;
    tx.value = -60 * base;
    ty.value = -100 * base;
  };

  const clampT = (x: number, y: number, scale: number) => {
    'worklet';
    const { w, h } = bounds.value;
    return {
      x: Math.min(0, Math.max(w - WORLD.width * scale, x)),
      y: Math.min(0, Math.max(h - WORLD.height * scale, y)),
    };
  };

  const zoomAbout = (factor: number, fx: number, fy: number, animate: boolean) => {
    'worklet';
    const from = start.value;
    const next = Math.min(MAX_SCALE, Math.max(bounds.value.min, from.s * factor));
    const t = clampT(fx - (fx - from.tx) * (next / from.s), fy - (fy - from.ty) * (next / from.s), next);
    if (animate) {
      s.value = withTiming(next, { duration: 260 });
      tx.value = withTiming(t.x, { duration: 260 });
      ty.value = withTiming(t.y, { duration: 260 });
    } else {
      s.value = next;
      tx.value = t.x;
      ty.value = t.y;
    }
  };

  const pan = usePanGesture({
    maxPointers: 1,
    onBegin: () => {
      'worklet';
      start.value = { s: s.value, tx: tx.value, ty: ty.value };
    },
    onUpdate: (e) => {
      'worklet';
      const t = clampT(start.value.tx + e.translationX, start.value.ty + e.translationY, s.value);
      tx.value = t.x;
      ty.value = t.y;
    },
  });
  const pinch = usePinchGesture({
    onBegin: () => {
      'worklet';
      start.value = { s: s.value, tx: tx.value, ty: ty.value };
    },
    onUpdate: (e) => {
      'worklet';
      zoomAbout(e.scale, e.focalX, e.focalY, false);
    },
  });
  const gesture = useSimultaneousGestures(pan, pinch);

  useImperativeHandle(ref, () => ({
    zoomBy: (factor) => {
      start.value = { s: s.value, tx: tx.value, ty: ty.value };
      zoomAbout(factor, view.w / 2, view.h / 2, true);
    },
    focus: (p) => {
      const t = clampT(view.w / 2 - p.x * s.value, view.h * 0.4 - p.y * s.value, s.value);
      tx.value = withTiming(t.x, { duration: 380 });
      ty.value = withTiming(t.y, { duration: 380 });
    },
  }));

  const world = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: s.value }],
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: C.map.ground, overflow: 'hidden' }} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ width: WORLD.width, height: WORLD.height, transformOrigin: 'top left' }, world]}>
          <Svg width={WORLD.width} height={WORLD.height}>
            <Path d={city.major} stroke={C.map.avenue} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d={city.minor} stroke={C.map.street} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path id="labelled" d={city.labelled} fill="none" />
            <SvgText fill={C.map.label} fontSize={17} fontWeight="500" letterSpacing={0.4}>
              <TextPath href="#labelled" startOffset="47%">
                {city.labelName}
              </TextPath>
            </SvgText>
          </Svg>
          {places.map((p) => (
            <Pin key={p.id} place={p} selected={p.id === selectedId} scale={s} onPress={() => onSelect(p)} />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});
CityMap.displayName = 'CityMap';
