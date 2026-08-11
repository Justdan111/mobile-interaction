import { Stack } from 'expo-router';
import { DrawerHost } from '@/components/drawer/DrawerHost';
import { colors } from '@/theme/colors';

export default function ShopLayout() {
  return (
    <DrawerHost>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ground },
        }}
      />
    </DrawerHost>
  );
}
