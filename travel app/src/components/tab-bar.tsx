import { Feather, Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function DotsGrid({ color }: { color: string }) {
  return (
    <View className="h-[18px] w-[18px] flex-row flex-wrap justify-between"
      style={{ alignContent: 'space-between' }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className="h-[7px] w-[7px] rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </View>
  );
}

function TabIcon({ route, color }: { route: string; color: string }) {
  switch (route) {
    case 'index':
      return <Feather name="home" size={22} color={color} />;
    case 'trips':
      return <Ionicons name="reader-outline" size={23} color={color} />;
    case 'favorites':
      return <Feather name="heart" size={22} color={color} />;
    default:
      return <DotsGrid color={color} />;
  }
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInUp.duration(650)
        .delay(500)
        .springify()
        .damping(17)
        .stiffness(150)}
      style={{
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: Math.max(bottom, 20),
      }}
    >
      <View className="h-[72px] flex-row items-center justify-between rounded-full bg-[#161616] px-3">
      {state.routes.map((route, index) => {
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            hitSlop={6}
            className={`h-14 w-14 items-center justify-center rounded-full ${
              focused ? 'bg-white' : ''
            }`}
          >
            <TabIcon
              route={route.name}
              color={focused ? '#161616' : '#FFFFFF'}
            />
          </Pressable>
        );
      })}
      </View>
    </Animated.View>
  );
}
