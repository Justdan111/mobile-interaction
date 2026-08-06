import { useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PageIndicator } from '@/components/PageIndicator';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { EventsScreen } from '@/components/screens/EventsScreen';
import { GraphScreen } from '@/components/screens/GraphScreen';

/**
 * Three pages on one horizontal rail — dashboard, graph, events — with the
 * dash indicator at the foot tracking the scroll.
 */
export default function Home() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    progress.value = event.contentOffset.x / width;
  });

  return (
    <View className="flex-1 bg-void">
      <StatusBar style="light" />

      <Animated.ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
        style={{ paddingTop: insets.top }}
      >
        <DashboardScreen width={width} />
        <GraphScreen width={width} />
        <EventsScreen width={width} />
      </Animated.ScrollView>

      <View style={{ paddingBottom: Math.max(insets.bottom, 12) + 31 }}>
        <PageIndicator count={3} progress={progress} />
      </View>
    </View>
  );
}
