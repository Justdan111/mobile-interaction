import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { DestinationCard } from '@/components/destination-card';
import type { Destination } from '@/data/destinations';

// Resting slots for the cards peeking out behind the top one.
const PEEK_RIGHT = { x: 40, scale: 0.92 };
const PEEK_LEFT = { x: -46, scale: 0.88 };

type SwipeCardProps = {
  destination: Destination;
  index: number;
  count: number;
  activeIndex: SharedValue<number>;
  topShift: SharedValue<number>;
  cardWidth: number;
  cardHeight: number;
  screenWidth: number;
  onPress: (destination: Destination) => void;
};

function SwipeCard({
  destination,
  index,
  count,
  activeIndex,
  topShift,
  cardWidth,
  cardHeight,
  screenWidth,
  onPress,
}: SwipeCardProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onTouchesDown((_event, manager) => {
      // Only the top card is swipeable.
      if (index !== activeIndex.value % count) {
        manager.fail();
      }
    })
    .onUpdate((event) => {
      // Card tracks the finger 1:1, Tinder style.
      tx.value = event.translationX;
      ty.value = event.translationY;
      topShift.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldFling =
        count > 1 &&
        (Math.abs(tx.value) > cardWidth * 0.3 ||
          Math.abs(event.velocityX) > 500);

      if (shouldFling) {
        const direction =
          (Math.abs(event.velocityX) > 500
            ? Math.sign(event.velocityX)
            : Math.sign(tx.value)) || 1;
        // The exit inherits the throw's velocity and, once the card is
        // off screen, the whole deck advances atomically on the UI thread —
        // no React round-trip, so nothing jumps or shakes.
        const exit = {
          velocity: event.velocityX,
          mass: 1,
          stiffness: 60,
          damping: 30,
          overshootClamping: true,
          restDisplacementThreshold: 60,
          restSpeedThreshold: 300,
        };
        topShift.value = withSpring(direction * screenWidth * 1.2, exit);
        ty.value = withSpring(ty.value + event.velocityY * 0.15, {
          ...exit,
          velocity: event.velocityY,
        });
        tx.value = withSpring(
          direction * screenWidth * 1.2,
          exit,
          (finished) => {
            if (finished) {
              activeIndex.value = activeIndex.value + 1;
              tx.value = 0;
              ty.value = 0;
              topShift.value = 0;
            }
          },
        );
      } else {
        const settle = {
          velocity: event.velocityX,
          mass: 0.9,
          damping: 22,
          stiffness: 200,
        };
        tx.value = withSpring(0, settle);
        ty.value = withSpring(0, { ...settle, velocity: event.velocityY });
        topShift.value = withSpring(0, settle);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rel = (((index - activeIndex.value) % count) + count) % count;

    if (rel === 0) {
      return {
        zIndex: 100,
        transform: [
          { translateX: tx.value },
          { translateY: ty.value },
          { rotate: `${(tx.value / screenWidth) * 14}deg` },
        ],
      };
    }

    // Cards behind slide toward the front in step with the top card's swipe.
    const progress = Math.min(Math.abs(topShift.value) / cardWidth, 1);
    if (rel === 1) {
      return {
        zIndex: 90,
        transform: [
          { translateX: interpolate(progress, [0, 1], [PEEK_RIGHT.x, 0]) },
          { translateY: 0 },
          { rotate: '0deg' },
          { scale: interpolate(progress, [0, 1], [PEEK_RIGHT.scale, 1]) },
        ],
      };
    }
    if (rel === 2) {
      return {
        zIndex: 80,
        transform: [
          {
            translateX: interpolate(progress, [0, 1], [PEEK_LEFT.x, PEEK_RIGHT.x]),
          },
          { translateY: 0 },
          { rotate: '0deg' },
          {
            scale: interpolate(progress, [0, 1], [PEEK_LEFT.scale, PEEK_RIGHT.scale]),
          },
        ],
      };
    }
    return {
      zIndex: 80 - rel,
      transform: [
        { translateX: PEEK_LEFT.x },
        { translateY: 0 },
        { rotate: '0deg' },
        { scale: PEEK_LEFT.scale },
      ],
    };
  });

  // First deal: back cards first, top card lands last.
  const entering = FadeInDown.duration(650)
    .delay(420 + (2 - Math.min(index, 2)) * 130)
    .springify()
    .damping(17)
    .stiffness(150);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          { position: 'absolute', left: (screenWidth - cardWidth) / 2 },
          animatedStyle,
        ]}
      >
        <Animated.View entering={entering}>
          <DestinationCard
            destination={destination}
            width={cardWidth}
            height={cardHeight}
            onPress={() => onPress(destination)}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

type Props = {
  destinations: Destination[];
  onOpenDestination: (destination: Destination) => void;
};

export function DestinationDeck({ destinations, onOpenDestination }: Props) {
  const { width, height: windowHeight } = useWindowDimensions();
  const cardWidth = width * 0.8;
  const cardHeight = Math.min(cardWidth * 1.38, windowHeight * 0.46);

  const activeIndex = useSharedValue(0);
  const topShift = useSharedValue(0);

  useEffect(() => {
    activeIndex.value = 0;
    topShift.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations]);

  return (
    <View style={{ height: cardHeight, width: '100%' }}>
      {destinations.map((destination, index) => (
        <SwipeCard
          key={destination.id}
          destination={destination}
          index={index}
          count={destinations.length}
          activeIndex={activeIndex}
          topShift={topShift}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          screenWidth={width}
          onPress={onOpenDestination}
        />
      ))}
    </View>
  );
}
