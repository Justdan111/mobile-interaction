import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeliveryTrackingActivity, {
  type DeliveryTrackingProps,
} from '../../widgets/DeliveryTrackingActivity';
import type { LiveActivity } from 'expo-widgets';

const INITIAL: DeliveryTrackingProps = {
  vehiclePlate: 'RJ 4567',
  vehicleModel: 'Volvo max s23',
  etaMinutes: 32,
  distanceKm: 5.2,
  fromAddress: '234, P Florida Park',
  toAddress: '21, SG Street way',
  driverName: 'Ajinder Batra',
  driverId: 'JSQRW01202',
};

export default function ControlScreen() {
  const [activity, setActivity] = useState<LiveActivity<DeliveryTrackingProps> | null>(null);
  const [content, setContent] = useState<DeliveryTrackingProps>(INITIAL);

  // Re-attach to an activity that is still running from a previous launch, so the
  // buttons keep working after the app is killed and reopened.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const [existing] = DeliveryTrackingActivity.getInstances();
    if (existing) setActivity(existing);
  }, []);

  const report = useCallback((error: unknown) => {
    Alert.alert('Live Activity', error instanceof Error ? error.message : String(error));
  }, []);

  const start = useCallback(() => {
    try {
      setContent(INITIAL);
      setActivity(DeliveryTrackingActivity.start(INITIAL));
    } catch (error) {
      report(error);
    }
  }, [report]);

  // Stands in for a real location update: pull the van five minutes and a kilometre closer.
  const advance = useCallback(async () => {
    if (!activity) return;
    const next: DeliveryTrackingProps = {
      ...content,
      etaMinutes: Math.max(0, content.etaMinutes - 5),
      distanceKm: Math.max(0, Math.round((content.distanceKm - 1) * 10) / 10),
    };
    setContent(next);
    try {
      await activity.update(next);
    } catch (error) {
      report(error);
    }
  }, [activity, content, report]);

  const end = useCallback(async () => {
    if (!activity) return;
    try {
      await activity.end('immediate', { ...content, etaMinutes: 0, distanceKm: 0 });
    } catch (error) {
      report(error);
    }
    setActivity(null);
  }, [activity, content, report]);

  const running = activity !== null;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>Live Activity</Text>
          <Text style={styles.title}>Delivery Tracking</Text>

          <Preview content={content} />

          <View style={styles.buttons}>
            <Button label="Start activity" onPress={start} disabled={running} primary />
            <Button label="Advance ETA by 5 min" onPress={advance} disabled={!running} />
            <Button label="End activity" onPress={end} disabled={!running} />
          </View>

          <Text style={styles.footnote}>
            {running
              ? 'Running. Swipe up to the Home Screen and long-press the Dynamic Island to see the expanded layout.'
              : 'Start the activity, then leave the app to see it in the Dynamic Island and on the Lock Screen.'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** A rough RN echo of the widget layout, so the values are visible without leaving the app. */
function Preview({ content }: { content: DeliveryTrackingProps }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.plate}>{content.vehiclePlate}</Text>
          <Text style={styles.muted}>{content.vehicleModel}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.plate}>{content.etaMinutes} Min</Text>
          <Text style={styles.muted}>{content.distanceKm} km</Text>
        </View>
      </View>
      <View style={styles.route}>
        <View style={styles.rail}>
          <View style={styles.dot} />
          <View style={styles.line} />
        </View>
        <View style={styles.legs}>
          <Text style={styles.legLabel}>From</Text>
          <Text style={styles.legValue}>{content.fromAddress}</Text>
          <Text style={[styles.legLabel, styles.legSpacer]}>To</Text>
          <Text style={styles.legValue}>{content.toAddress}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.driver}>{content.driverName}</Text>
        <Text style={styles.muted}>ID - {content.driverId}</Text>
      </View>
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
  primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      <Text style={[styles.buttonLabel, primary && styles.buttonLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 20 },
  kicker: { color: '#FFD60A', fontSize: 13, fontWeight: '600', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: -12 },

  card: { backgroundColor: '#0E0E10', borderRadius: 28, padding: 18, gap: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
  plate: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  muted: { color: '#8E8E93', fontSize: 14 },
  route: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', paddingTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD60A' },
  line: { width: 2, flex: 1, backgroundColor: '#48484C' },
  legs: { flex: 1 },
  legLabel: { color: '#6E6E73', fontSize: 12 },
  legValue: { color: '#9E9EA3', fontSize: 16 },
  legSpacer: { marginTop: 14 },
  cardBottom: { alignItems: 'flex-end' },
  driver: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  buttons: { gap: 10 },
  button: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#1F1F22',
  },
  buttonPrimary: { backgroundColor: '#FFD60A' },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.35 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonLabelPrimary: { color: '#000000' },

  footnote: { color: '#6E6E73', fontSize: 13, lineHeight: 19 },
});
