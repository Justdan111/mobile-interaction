import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerPanel } from '@/components/drawer/DrawerPanel';
import { colors } from '@/theme/colors';

type DrawerApi = { open: () => void; close: () => void };

const DrawerContext = createContext<DrawerApi | null>(null);

export function useDrawer(): DrawerApi {
  const api = useContext(DrawerContext);
  if (!api) throw new Error('useDrawer must be used inside <DrawerHost>');
  return api;
}

const SPRING = { damping: 18, stiffness: 140, mass: 0.7 } as const;

/** How far right the content card slides, as a fraction of screen width. */
const SLIDE = 0.62;
const SCALE = 0.78;

const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;

/**
 * Built by hand rather than with a stock drawer navigator: the comp's effect
 * is specific — the content card translates, scales, rounds its corners and
 * casts a shadow, with a second translucent sheet peeking out behind it — and
 * a stock drawer produces none of that.
 */
export function DrawerHost({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  // One value in [0, 1] drives every transform, so the button spring and the
  // pan gesture cannot fall out of step with each other.
  const progress = useSharedValue(0);

  const api = useMemo<DrawerApi>(
    () => ({
      open: () => {
        progress.value = withSpring(1, SPRING);
      },
      close: () => {
        progress.value = withSpring(0, SPRING);
      },
    }),
    [progress],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      progress.value = Math.min(1, Math.max(0, e.translationX / (width * SLIDE)));
    })
    .onEnd((e) => {
      const shouldOpen = progress.value > 0.5 || e.velocityX > 600;
      progress.value = withSpring(shouldOpen ? 1 : 0, SPRING);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * width * SLIDE },
      { scale: interpolate(progress.value, [0, 1], [1, SCALE]) },
    ],
    borderRadius: interpolate(progress.value, [0, 1], [0, 28]),
  }));

  // The pale sheet behind the card. It only appears once the drawer starts
  // opening, and trails the card slightly so an edge of it stays visible.
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0, 0.22]),
    transform: [
      { translateX: progress.value * width * (SLIDE - 0.05) },
      { scale: interpolate(progress.value, [0, 1], [1, SCALE - 0.05]) },
    ],
  }));

  // While open the card is inert, and a tap anywhere on it closes the drawer.
  const blockerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    // `none` lets touches through to the screen when closed; `auto` swallows
    // them when open, which is what makes tap-to-close work.
    pointerEvents: progress.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <DrawerContext.Provider value={api}>
      <View className="flex-1" style={{ backgroundColor: colors.tealDeep }}>
        <LinearGradient
          colors={[colors.teal, colors.tealDeep]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={FILL}
        >
          <DrawerPanel onClose={api.close} />
        </LinearGradient>

        <Animated.View
          pointerEvents="none"
          style={[
            { ...FILL, backgroundColor: colors.surface, borderRadius: 28 },
            sheetStyle,
          ]}
        />

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                flex: 1,
                overflow: 'hidden',
                backgroundColor: colors.ground,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 24,
                shadowOffset: { width: -8, height: 0 },
              },
              cardStyle,
            ]}
          >
            {children}
            <Animated.View onTouchEnd={api.close} style={[FILL, blockerStyle]} />
          </Animated.View>
        </GestureDetector>
      </View>
    </DrawerContext.Provider>
  );
}
