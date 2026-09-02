import type { LiveActivity } from 'expo-widgets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeliveryTrackingActivity, {
  type DeliveryTrackingProps,
} from '../../widgets/DeliveryTrackingActivity';

const TRIP_MINUTES = 32;
const START_KM = 5.2;
/** How often the app refreshes the distance. The countdown does not need us. */
const REFRESH_MS = 10_000;

const DELIVERY = {
  vehiclePlate: 'RJ 4567',
  vehicleModel: 'Volvo max s23',
  fromAddress: '234, P Florida Park',
  toAddress: '21, SG Street way',
  driverName: 'Ajinder Batra',
  driverId: 'JSQRW01202',
};

type Trip = { startedAt: number; etaAt: number };

/** Distance shrinks in step with the time left, so the two figures never disagree. */
function distanceFor(trip: Trip, at: number) {
  const total = trip.etaAt - trip.startedAt;
  const remaining = Math.max(0, trip.etaAt - at);
  return Math.round(START_KM * (remaining / total) * 10) / 10;
}

function contentFor(trip: Trip, at: number): DeliveryTrackingProps {
  return { ...DELIVERY, ...trip, distanceKm: distanceFor(trip, at) };
}

export default function ControlScreen() {
  const [activity, setActivity] = useState<LiveActivity<DeliveryTrackingProps> | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [auto, setAuto] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Held in a ref so the refresh interval never restarts just because the clock ticked.
  const tripRef = useRef<Trip | null>(null);
  const activityRef = useRef<LiveActivity<DeliveryTrackingProps> | null>(null);
  tripRef.current = trip;
  activityRef.current = activity;

  // Re-attach to an activity still running from a previous launch. The handle comes back
  // but its content does not, so a resumed trip can be ended, not resumed.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const [existing] = DeliveryTrackingActivity.getInstances();
    if (existing) setActivity(existing);
  }, []);

  // Drives the preview's own countdown. The widget does not depend on this.
  useEffect(() => {
    if (!trip) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [trip]);

  const report = useCallback((error: unknown) => {
    Alert.alert('Live Activity', error instanceof Error ? error.message : String(error));
  }, []);

  // The only thing the app pushes. The ETA counts itself down inside the widget.
  useEffect(() => {
    if (!auto || !activity || !trip) return;
    const id = setInterval(() => {
      const current = tripRef.current;
      const live = activityRef.current;
      if (!current || !live) return;
      live.update(contentFor(current, Date.now())).catch(report);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [auto, activity, trip, report]);

  const start = useCallback(() => {
    const startedAt = Date.now();
    const next: Trip = { startedAt, etaAt: startedAt + TRIP_MINUTES * 60_000 };
    try {
      const started = DeliveryTrackingActivity.start(contentFor(next, startedAt));
      setTrip(next);
      setNow(startedAt);
      setAuto(true);
      setActivity(started);
    } catch (error) {
      report(error);
    }
  }, [report]);

  const end = useCallback(async () => {
    if (!activity) return;
    const current = trip;
    try {
      await activity.end(
        'immediate',
        current ? { ...contentFor(current, current.etaAt), etaAt: Date.now() } : undefined
      );
    } catch (error) {
      report(error);
    }
    setActivity(null);
    setTrip(null);
  }, [activity, trip, report]);

  const running = activity !== null;
  const resumed = running && trip === null;
  const remainingMs = trip ? Math.max(0, trip.etaAt - now) : 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>LIVE ACTIVITY</Text>
          <Text style={styles.title}>Delivery Tracking</Text>

          {resumed ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Reattached to an activity from a previous launch. Its trip times can&apos;t be
                read back, so end it to start a fresh one.
              </Text>
            </View>
          ) : (
            <Preview trip={trip} now={now} remainingMs={remainingMs} />
          )}

          <View style={styles.buttons}>
            <Button label="Start trip" onPress={start} disabled={running} primary />
            <Button
              label={`Auto-refresh distance · ${auto ? 'On' : 'Off'}`}
              onPress={() => setAuto((v) => !v)}
              disabled={!running || resumed}
              active={auto}
            />
            <Button label="End trip" onPress={end} disabled={!running} />
          </View>

          <Text style={styles.footnote}>
            {running
              ? 'Leave the app — the ETA keeps counting down in the Dynamic Island and on the Lock Screen on its own, even with the app killed. Auto-refresh only pushes the distance, which the system can’t work out by itself.'
              : 'Start the trip, then swipe up to the Home Screen. Long-press the Dynamic Island for the expanded layout.'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatRemaining(ms: number) {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** A rough RN echo of the widget layout, so the values are visible without leaving the app. */
function Preview({
  trip,
  now,
  remainingMs,
}: {
  trip: Trip | null;
  now: number;
  remainingMs: number;
}) {
  const km = trip ? distanceFor(trip, now) : START_KM;
  const eta = trip ? formatRemaining(remainingMs) : `${TRIP_MINUTES}:00`;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.plate}>{DELIVERY.vehiclePlate}</Text>
          <Text style={styles.muted}>{DELIVERY.vehicleModel}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.plate, styles.mono]}>{eta}</Text>
          <Text style={styles.muted}>{km} km</Text>
        </View>
      </View>
      <View style={styles.route}>
        <View style={styles.rail}>
          <View style={styles.dot} />
          <View style={styles.line} />
        </View>
        <View style={styles.legs}>
          <Text style={styles.legLabel}>From</Text>
          <Text style={styles.legValue}>{DELIVERY.fromAddress}</Text>
          <Text style={[styles.legLabel, styles.legSpacer]}>To</Text>
          <Text style={styles.legValue}>{DELIVERY.toAddress}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.driver}>{DELIVERY.driverName}</Text>
        <Text style={styles.muted}>ID - {DELIVERY.driverId}</Text>
      </View>
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
  primary,
  active,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        active && !primary && styles.buttonActive,
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
  kicker: { color: '#FFD60A', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: -14 },

  card: { backgroundColor: '#0E0E10', borderRadius: 28, padding: 18, gap: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
  plate: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  mono: { fontVariant: ['tabular-nums'] },
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

  notice: { backgroundColor: '#1F1F22', borderRadius: 18, padding: 16 },
  noticeText: { color: '#9E9EA3', fontSize: 14, lineHeight: 20 },

  buttons: { gap: 10 },
  button: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#1F1F22',
  },
  buttonPrimary: { backgroundColor: '#FFD60A' },
  buttonActive: { backgroundColor: '#2C2C31' },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.35 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonLabelPrimary: { color: '#000000' },

  footnote: { color: '#6E6E73', fontSize: 13, lineHeight: 19 },
});
