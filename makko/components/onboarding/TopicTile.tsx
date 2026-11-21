import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import type { InterestTile } from '../../data/topics';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Media, mediaFor } from '../ui/Media';
import { Press } from '../ui/Press';

/** The two-note glyph on the Music tile, in a glossy red. */
function MusicNote({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="note" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F0475C" />
          <Stop offset="1" stopColor="#A4122B" />
        </LinearGradient>
      </Defs>
      <Path d="M20 14 54 8v6L20 20z" fill="url(#note)" />
      <Rect x={18} y={14} width={5} height={36} rx={2.5} fill="url(#note)" />
      <Rect x={49} y={8} width={5} height={36} rx={2.5} fill="url(#note)" />
      <Path d="M8 50a10 7.5 0 1 0 20 0 10 7.5 0 1 0-20 0z" fill="url(#note)" />
      <Path d="M39 44a10 7.5 0 1 0 20 0 10 7.5 0 1 0-20 0z" fill="url(#note)" />
    </Svg>
  );
}

/** A loose brush-stroke shape drawn behind a hero tile's subject. */
function Shape({ color, kind, w, h }: { color: string; kind: 'swoosh' | 'arch'; w: number; h: number }) {
  if (kind === 'arch') {
    return (
      <View
        style={{
          position: 'absolute',
          left: w * 0.12,
          right: w * 0.2,
          top: h * 0.2,
          bottom: -h * 0.1,
          backgroundColor: color,
          borderTopLeftRadius: w * 0.4,
          borderTopRightRadius: w * 0.4,
        }}
      />
    );
  }
  const sw = h * 0.3;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute' }}>
      <Path
        d={`M${w * 0.16} ${h * 0.5} C ${w * 0.3} ${h * 0.24}, ${w * 0.62} ${h * 0.18}, ${w * 0.8} ${h * 0.3}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={`M${w * 0.24} ${h * 0.8} C ${w * 0.42} ${h * 0.6}, ${w * 0.66} ${h * 0.58}, ${w * 0.84} ${h * 0.68}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function TopicTile({
  tile,
  width,
  height,
  selected,
  onToggle,
}: {
  tile: InterestTile;
  width: number;
  height: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const bump = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    bump.value = withSequence(withTiming(0.95, { duration: 90 }), withSpring(1, { damping: 9, stiffness: 260 }));
  }, [selected, bump]);
  const scale = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  const subject = tile.art === 'music-note' ? null : mediaFor(tile.art);
  const heroH = height * 0.92;

  return (
    <Animated.View style={[{ width, height }, scale]}>
      <Press
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onToggle();
        }}
        accessibilityRole="checkbox"
        accessibilityLabel={tile.label}
        accessibilityState={{ checked: selected }}
        pressedStyle={{ opacity: 0.9 }}
        style={{
          flex: 1,
          borderRadius: 22,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? C.blue : C.line,
          backgroundColor: C.white,
          overflow: 'hidden',
        }}
      >
        {tile.style === 'hero' ? (
          <>
            <Shape color={tile.shape ?? C.card} kind={tile.id === 'dogs' ? 'arch' : 'swoosh'} w={width} h={height} />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: -2, alignItems: 'center' }}>
              <Media
                slug={tile.art}
                contentFit="contain"
                style={{ height: heroH, width: subject ? Math.min(heroH * subject.aspect, width * 0.95) : width * 0.6 }}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                alignSelf: 'center',
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: 'rgba(40,28,20,0.55)',
              }}
            >
              <Text className="font-medium" style={{ color: C.white, fontSize: 15 }}>
                {tile.label}
              </Text>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center" style={{ paddingTop: 14 }}>
            {tile.art === 'music-note' ? (
              <MusicNote size={height * 0.36} />
            ) : (
              <Media slug={tile.art} contentFit="contain" style={{ width: width * 0.62, height: height * 0.4 }} />
            )}
            <Text className="font-medium text-ink" style={{ fontSize: 15.5, marginTop: 14 }}>
              {tile.label}
            </Text>
          </View>
        )}

        <View style={{ position: 'absolute', top: 10, right: 10 }}>
          {selected ? (
            <Animated.View
              entering={ZoomIn.springify().damping(12)}
              style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="check" color={C.white} size={18} strokeWidth={2.4} />
            </Animated.View>
          ) : (
            <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#D3D3D3', backgroundColor: C.white }} />
          )}
        </View>
      </Press>
    </Animated.View>
  );
}
