import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { PEOPLE } from '../../data/people';
import type { PhotoPost, VideoPost } from '../../data/posts';
import { photos, videos } from '../../lib/media';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Press } from '../ui/Press';
import { ActionBar, Glass, UserChip } from './Overlays';

const RADIUS = 34;

function Video({ slug, active, muted }: { slug: string; active: boolean; muted: boolean }) {
  const clip = (videos as Record<string, { source: number; poster: number }>)[slug];
  const player = useVideoPlayer(clip?.source ?? null, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);
  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [player, active]);
  if (!clip) return <View style={{ flex: 1, backgroundColor: C.line }} />;
  return (
    <View style={{ flex: 1 }}>
      <Image source={clip.poster} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
      <VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} />
    </View>
  );
}

/**
 * A full-width photo or video post. Double-tap anywhere likes it with a heart
 * that blooms in the middle; videos play only while `active` (in view).
 */
export function MediaCard({
  post,
  width,
  height,
  active,
  liked,
  onLike,
}: {
  post: PhotoPost | VideoPost;
  width: number;
  height: number;
  active: boolean;
  liked: boolean;
  onLike: (force?: boolean) => void;
}) {
  const [muted, setMuted] = useState(true);
  const burst = useSharedValue(0);
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value > 0 ? Math.min(1, burst.value * 1.4) : 0,
    transform: [{ scale: 0.4 + burst.value * 0.8 }],
  }));

  const likeFromTap = () => onLike(true);
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      burst.value = withSequence(withSpring(1, { damping: 8, stiffness: 220 }), withDelay(380, withTiming(0, { duration: 220 })));
      scheduleOnRN(likeFromTap);
    },
  });

  const who = PEOPLE[post.author];
  const photo = post.kind === 'photo' ? (photos as Record<string, { source: number }>)[post.photo] : undefined;

  return (
    <View style={{ width, height, borderRadius: RADIUS, overflow: 'hidden', backgroundColor: C.line }}>
      <GestureDetector gesture={doubleTap}>
        <View style={{ flex: 1 }}>
          {post.kind === 'photo' ? (
            photo ? <Image source={photo.source} style={{ flex: 1 }} contentFit="cover" transition={200} /> : null
          ) : (
            <Video slug={post.video} active={active} muted={muted} />
          )}
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', alignSelf: 'center', top: height / 2 - 48 }, burstStyle]}>
            <Icon name="heart" color={C.white} filled size={96} strokeWidth={1} />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={{ position: 'absolute', top: 16, left: 16 }} pointerEvents="box-none">
        <UserChip person={who} />
      </View>

      <View className="flex-row items-end justify-between" style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }} pointerEvents="box-none">
        {post.kind === 'video' ? (
          <Press onPress={() => setMuted((m) => !m)} accessibilityRole="button" accessibilityLabel={muted ? 'Unmute' : 'Mute'}>
            <Glass radius={28}>
              <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={muted ? 'muted' : 'sound'} color={C.white} size={26} strokeWidth={1.7} />
              </View>
            </Glass>
          </Press>
        ) : (
          <View />
        )}
        <ActionBar liked={liked} onLike={() => onLike()} />
      </View>
    </View>
  );
}
