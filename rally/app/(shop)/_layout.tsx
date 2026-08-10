import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ground },
      }}
    />
  );
}
