import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>Widget Lab</Text>
        <Text style={styles.title}>No widgets yet</Text>
        <Text style={styles.body}>
          Widgets and Live Activities only run in a development build — Expo Go has no
          widget extension to load them into. Build one with the `development` profile:
        </Text>
        <Text style={styles.code}>eas build --profile development --platform ios</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  kicker: { color: '#FFD60A', fontSize: 13, fontWeight: '600', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '700' },
  body: { color: '#8E8E93', fontSize: 15, lineHeight: 22 },
  code: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Menlo',
    backgroundColor: '#1F1F22',
    padding: 12,
    borderRadius: 10,
  },
});
