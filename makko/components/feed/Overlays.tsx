import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { Person } from '../../data/people';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Press } from '../ui/Press';
import { Avatar } from './Avatar';

/** The author chip pinned to a card's top-left corner. */
export function UserChip({ person }: { person: Person }) {
  return (
    <View
      className="flex-row items-center"
      style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 26, padding: 4, paddingRight: 16, gap: 10 }}
    >
      <Avatar source={person.avatar} size={36} />
      <Text className="font-medium text-ink" style={{ fontSize: 16 }}>
        {person.name}
      </Text>
    </View>
  );
}

/** A frosted round control over a photo. */
export function Glass({ children, radius, style }: { children: React.ReactNode; radius: number; style?: object }) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView intensity={28} tint="dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(120,128,138,0.28)' }} />
      {children}
    </View>
  );
}

/** Like, comment and share, on frosted glass. Like springs and fills red. */
export function ActionBar({ liked, onLike }: { liked: boolean; onLike: () => void }) {
  const pop = useSharedValue(1);
  const heart = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const like = () => {
    pop.value = withSequence(withTiming(0.7, { duration: 80 }), withSpring(1, { damping: 7, stiffness: 300 }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onLike();
  };
  return (
    <Glass radius={28}>
      <View className="flex-row items-center" style={{ height: 56, paddingHorizontal: 22, gap: 34 }}>
        <Press onPress={like} accessibilityRole="button" accessibilityLabel={liked ? 'Unlike' : 'Like'} hitSlop={8}>
          <Animated.View style={heart}>
            <Icon name="heart" color={liked ? '#FF4D61' : C.white} filled={liked} size={27} strokeWidth={1.7} />
          </Animated.View>
        </Press>
        <Press accessibilityRole="button" accessibilityLabel="Comment" hitSlop={8}>
          <Icon name="comment" color={C.white} size={26} strokeWidth={1.7} />
        </Press>
        <Press accessibilityRole="button" accessibilityLabel="Share" hitSlop={8}>
          <Icon name="send" color={C.white} size={26} strokeWidth={1.7} />
        </Press>
      </View>
    </Glass>
  );
}

/** Per-session like state shared across the feed's views of the same post. */
export function useLikes() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const toggle = (id: string, force?: boolean) =>
    setLiked((prev) => {
      const next = new Set(prev);
      const on = force ?? !next.has(id);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  return { liked, toggle };
}
