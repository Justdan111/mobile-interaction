import type { LiveActivity } from 'expo-widgets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DeliveryTrackingActivity,
  widgetsUnavailable,
  type DeliveryTrackingProps,
} from '../../widgets';

/** The whole trip runs in ten seconds, so a run can be watched start to finish. */
const TRIP_MS = 10_000;
/**
 * How often the app pushes the truck's position. Roughly thirty frames across the trip
 * reads as travel rather than stepping. `frequentUpdates` is on in app.json, which is
 * what buys the budget for a burst this dense.
 */
const FRAME_MS = 300;
const START_KM = 5.2;

const DELIVERY = {
  vehiclePlate: 'RJ 4567',
  vehicleModel: 'Volvo max s23',
  fromAddress: '234, P Florida Park',
  toAddress: '21, SG Street way',
  driverName: 'Ajinder Batra',
  driverId: 'JSQRW01202',
};

type Trip = { startedAt: number; etaAt: number };

/**
 * Matches the widget: the run completes at 90% of the trip so the truck is parked at the
 * drop-off before the countdown expires, rather than arriving on the same frame.
 */
const ARRIVE_EARLY = 0.9;

/** Plain fraction of the trip elapsed. Distance tracks this, not the early-arrival run. */
function elapsedFor(trip: Trip, at: number) {
  const total = trip.etaAt - trip.startedAt;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, (at - trip.startedAt) / total));
}

function progressFor(trip: Trip, at: number) {
  return Math.min(1, elapsedFor(trip, at) / ARRIVE_EARLY);
}

function contentFor(trip: Trip, at: number): DeliveryTrackingProps {
  return {
    ...DELIVERY,
    ...trip,
    progress: progressFor(trip, at),
    distanceKm: Math.round(START_KM * (1 - elapsedFor(trip, at)) * 10) / 10,
  };
}

export default function ControlScreen() {
  const [activity, setActivity] = useState<LiveActivity<DeliveryTrackingProps> | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [auto, setAuto] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Held in refs so the push loop never restarts just because the clock ticked.
  const tripRef = useRef<Trip | null>(null);
  const activityRef = useRef<LiveActivity<DeliveryTrackingProps> | null>(null);
  tripRef.current = trip;
  activityRef.current = activity;

  // Reattach to an activity still running from a previous launch. The handle comes back
  // but its content does not, so a resumed trip can be ended, not resumed.
  useEffect(() => {
    if (Platform.OS !== 'ios' || !DeliveryTrackingActivity) return;
    const [existing] = DeliveryTrackingActivity.getInstances();
    if (existing) setActivity(existing);
  }, []);

  const report = useCallback((error: unknown) => {
    Alert.alert('Live Activity', error instanceof Error ? error.message : String(error));
  }, []);

  /**
   * Pushes the dot along the route. The ETA does not need this — SwiftUI counts that
   * down on its own — but nothing in SwiftUI can walk a dot down a path, so position
   * and distance come from here.
   */
  useEffect(() => {
    if (!auto || !activity || !trip) return;
    const id = setInterval(() => {
      const current = tripRef.current;
      const live = activityRef.current;
      if (!current || !live) return;
      const at = Date.now();
      setNow(at);
      live.update(contentFor(current, at)).catch(report);
      if (at >= current.etaAt) clearInterval(id);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [auto, activity, trip, report]);

  // Keeps the in-app preview honest while auto-advance is switched off.
  useEffect(() => {
    if (!trip || auto) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [trip, auto]);

  const start = useCallback(() => {
    if (!DeliveryTrackingActivity) return;
    const startedAt = Date.now();
    const next: Trip = { startedAt, etaAt: startedAt + TRIP_MS };
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
      await activity.end('immediate', current ? contentFor(current, current.etaAt) : undefined);
    } catch (error) {
      report(error);
    }
    setActivity(null);
    setTrip(null);
  }, [activity, trip, report]);

  const running = activity !== null;
  const resumed = running && trip === null;
  const progress = trip ? progressFor(trip, now) : 0;
  const remainingMs = trip ? Math.max(0, trip.etaAt - now) : TRIP_MS;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>LIVE ACTIVITY</Text>
          <Text style={styles.title}>Delivery Tracking</Text>

          {widgetsUnavailable ? (
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>Needs the development build</Text>
              <Text style={styles.noticeText}>
                The `expo-widgets` native module isn&apos;t in this client, so Live
                Activities can&apos;t run. Expo Go never has it — open{' '}
                <Text style={styles.noticeStrong}>Widget Lab</Text> on the simulator
                instead, and start Metro with `npm start`.
              </Text>
              <Text style={styles.noticeDetail}>{widgetsUnavailable}</Text>
            </View>
          ) : resumed ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Reattached to an activity from a previous launch. Its trip times can&apos;t be
                read back, so end it to start a fresh one.
              </Text>
            </View>
          ) : (
              <Preview
              progress={progress}
              elapsed={trip ? elapsedFor(trip, now) : 0}
              remainingMs={remainingMs}
            />
          )}

          <View style={styles.buttons}>
            <Button
              label="Start trip"
              onPress={start}
              disabled={running || !DeliveryTrackingActivity}
              primary
            />
            <Button
              label={`Auto-advance · ${auto ? 'On' : 'Off'}`}
              onPress={() => setAuto((v) => !v)}
              disabled={!running || resumed}
              active={auto}
            />
            <Button label="End trip" onPress={end} disabled={!running} />
          </View>

          <Text style={styles.footnote}>
            {running
              ? 'The trip runs for ten seconds. The ETA counts itself down even with the app killed; the truck and the route rail are pushed from here, so keep the app open to watch them travel.'
              : 'Start the trip, then swipe up to the Home Screen. Long-press the Dynamic Island for the expanded layout.'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatRemaining(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `0:${String(total).padStart(2, '0')}`;
}

/** An RN echo of the widget layout, so a run is visible without leaving the app. */
function Preview({
  progress,
  elapsed,
  remainingMs,
}: {
  progress: number;
  elapsed: number;
  remainingMs: number;
}) {
  const km = Math.round(START_KM * (1 - elapsed) * 10) / 10;
  const arrived = remainingMs <= 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.plate}>{DELIVERY.vehiclePlate}</Text>
          <Text style={styles.muted}>{DELIVERY.vehicleModel}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.plate, styles.mono]}>
            {arrived ? 'Arrived' : formatRemaining(remainingMs)}
          </Text>
          <Text style={styles.muted}>{km} km</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.rail}>
          <View style={[styles.endDot, styles.endDotDone]} />
          <View style={[styles.railFill, { flex: Math.max(progress, 0.0001) }]} />
          <Text style={styles.truck}>🚚</Text>
          <View style={[styles.railRest, { flex: Math.max(1 - progress, 0.0001) }]} />
          <View style={[styles.endDot, progress >= 1 && styles.endDotDone]} />
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

  card: { backgroundColor: '#0E0E10', borderRadius: 26, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
  plate: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  mono: { fontVariant: ['tabular-nums'] },
  muted: { color: '#8E8E93', fontSize: 13 },
  route: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 18, paddingVertical: 4 },
  railFill: { width: 2, backgroundColor: '#FFD60A' },
  railRest: { width: 2, backgroundColor: '#48484C' },
  truck: { fontSize: 14, lineHeight: 18 },
  endDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#48484C' },
  endDotDone: { backgroundColor: '#FFD60A' },
  legs: { flex: 1 },
  legLabel: { color: '#6E6E73', fontSize: 11 },
  legValue: { color: '#9E9EA3', fontSize: 15 },
  legSpacer: { marginTop: 10 },
  cardBottom: { alignItems: 'flex-end' },
  driver: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  notice: { backgroundColor: '#1F1F22', borderRadius: 18, padding: 16, gap: 8 },
  noticeTitle: { color: '#FFD60A', fontSize: 16, fontWeight: '700' },
  noticeText: { color: '#9E9EA3', fontSize: 14, lineHeight: 20 },
  noticeStrong: { color: '#FFFFFF', fontWeight: '700' },
  noticeDetail: { color: '#6E6E73', fontSize: 12, fontFamily: 'Menlo' },

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
