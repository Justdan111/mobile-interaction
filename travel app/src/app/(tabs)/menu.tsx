import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AVATAR_URI } from '@/data/destinations';

const MENU_ITEMS = [
  { icon: 'user', label: 'Profile' },
  { icon: 'credit-card', label: 'Payment methods' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'globe', label: 'Language & region' },
  { icon: 'help-circle', label: 'Help & support' },
  { icon: 'log-out', label: 'Log out' },
] as const;

const enterFrom = (order: number) =>
  FadeInDown.duration(500)
    .delay(order * 70)
    .springify()
    .damping(18)
    .stiffness(170);

export default function MenuScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Animated.View entering={enterFrom(0)}>
        <Text className="px-6 pt-3 text-[28px] font-bold text-ink">Menu</Text>
      </Animated.View>

      <Animated.View
        entering={enterFrom(1)}
        className="mx-6 mt-5 flex-row items-center rounded-[28px] bg-white p-4"
      >
        <Image
          source={{ uri: AVATAR_URI }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
          transition={200}
        />
        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-semibold text-ink">Vanessa</Text>
          <Text className="mt-0.5 text-[14px] text-muted">
            vanessa@tripglide.com
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </Animated.View>

      <View className="mx-6 mt-4 overflow-hidden rounded-[28px] bg-white">
        {MENU_ITEMS.map((item, index) => (
          <Animated.View key={item.label} entering={enterFrom(2 + index)}>
            <View
              className={`flex-row items-center px-5 py-4 ${
                index < MENU_ITEMS.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-canvas">
                <Feather
                  name={item.icon}
                  size={18}
                  color={item.label === 'Log out' ? '#FF5A5F' : '#191919'}
                />
              </View>
              <Text
                className={`ml-4 flex-1 text-[16px] ${
                  item.label === 'Log out'
                    ? 'font-medium text-[#FF5A5F]'
                    : 'text-ink'
                }`}
              >
                {item.label}
              </Text>
              <Feather name="chevron-right" size={18} color="#C4C4C4" />
            </View>
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
}
