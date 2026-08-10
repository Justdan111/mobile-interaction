import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-ground">
      <StatusBar style="dark" />
      <Text className="font-nunito-extrabold text-3xl text-ink">Rally</Text>
      <Text className="mt-2 font-nunito text-base text-muted">
        Search your rackets
      </Text>
      <View className="mt-6 h-16 w-48 rounded-[20px] bg-teal" />
    </View>
  );
}
