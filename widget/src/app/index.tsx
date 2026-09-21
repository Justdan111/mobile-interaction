import { useLocalSearchParams } from 'expo-router';
import type { LiveActivity } from 'expo-widgets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DeliveryTrackingActivity,
  FoodDeliveryActivity,
  stageWidgetAssets,
  widgetsDirectory,
  widgetsUnavailable,
  type DeliveryTrackingProps,
  type FoodDeliveryProps,
  type WidgetAssetUris,
} from '../../widgets';

/**
 * The comp's artwork, cut from the reference screenshots. The widgets get the same files
 * staged into the app group (see `widgets/assets.ts`); the previews use them directly.
 */
const ART = {
  driverAvatar: require('../../assets/widgets/driver-avatar.png'),
  courierAvatar: require('../../assets/widgets/courier-avatar.png'),
  courier: require('../../assets/widgets/courier.png'),
  foodyGlyph: require('../../assets/widgets/foody-glyph.png'),
};

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

const FOODY = {
  brand: 'Foody',
  orderItem: 'Pizza Napolitana',
  amount: '25$',
  paymentMethod: 'Cash',
  courierName: 'George K.',
};
/** Minutes the Foody order starts at, counted down across the same ten-second trip. */
const FOODY_START_MINUTES = 8;

function foodyContentFor(
  trip: Trip,
  at: number,
  assets: WidgetAssetUris | null
): FoodDeliveryProps {
  const progress = progressFor(trip, at);
  return {
    ...FOODY,
    progress,
    etaMinutes: Math.ceil(FOODY_START_MINUTES * (1 - elapsedFor(trip, at))),
    courierAvatarUri: assets?.courierAvatar,
    courierImageUri: assets?.courier,
    brandGlyphUri: assets?.foodyGlyph,
  };
}

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

function contentFor(
  trip: Trip,
  at: number,
  assets: WidgetAssetUris | null
): DeliveryTrackingProps {
  return {
    ...DELIVERY,
    ...trip,
    progress: progressFor(trip, at),
    distanceKm: Math.round(START_KM * (1 - elapsedFor(trip, at)) * 10) / 10,
    driverAvatarUri: assets?.driverAvatar,
  };
}

export default function ControlScreen() {
  const [activity, setActivity] = useState<LiveActivity<DeliveryTrackingProps> | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [auto, setAuto] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [assets, setAssets] = useState<WidgetAssetUris | null>(null);

  const report = useCallback((error: unknown) => {
    Alert.alert('Live Activity', error instanceof Error ? error.message : String(error));
  }, []);

  // Held in refs so the push loop never restarts just because the clock ticked.
  const tripRef = useRef<Trip | null>(null);
  const activityRef = useRef<LiveActivity<DeliveryTrackingProps> | null>(null);
  const assetsRef = useRef<WidgetAssetUris | null>(null);
  tripRef.current = trip;
  activityRef.current = activity;
  assetsRef.current = assets;

  // Copies the photos and illustrations into the app group, where the extension can read
  // them. Until this resolves an activity that starts falls back to SF Symbols.
  useEffect(() => {
    if (Platform.OS !== 'ios' || !widgetsDirectory) return;
    stageWidgetAssets(widgetsDirectory).then(setAssets).catch(report);
  }, [report]);

  // Reattach to an activity still running from a previous launch. The handle comes back
  // but its content does not, so a resumed trip can be ended, not resumed.
  useEffect(() => {
    if (Platform.OS !== 'ios' || !DeliveryTrackingActivity) return;
    const [existing] = DeliveryTrackingActivity.getInstances();
    if (existing) setActivity(existing);
    const [food] = FoodDeliveryActivity?.getInstances() ?? [];
    if (food) setFoodActivity(food);
  }, []);

  const [foodActivity, setFoodActivity] = useState<LiveActivity<FoodDeliveryProps> | null>(null);
  const [foodTrip, setFoodTrip] = useState<Trip | null>(null);
  const foodTripRef = useRef<Trip | null>(null);
  const foodActivityRef = useRef<LiveActivity<FoodDeliveryProps> | null>(null);
  foodTripRef.current = foodTrip;
  foodActivityRef.current = foodActivity;

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
      live.update(contentFor(current, at, assetsRef.current)).catch(report);
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

  // The Foody order runs on the same ten-second clock, pushing progress for the bar and
  // the scooter riding it — neither of which the system can advance on its own.
  useEffect(() => {
    if (!foodActivity || !foodTrip) return;
    const id = setInterval(() => {
      const current = foodTripRef.current;
      const live = foodActivityRef.current;
      if (!current || !live) return;
      const at = Date.now();
      live.update(foodyContentFor(current, at, assetsRef.current)).catch(report);
      if (at >= current.etaAt) clearInterval(id);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [foodActivity, foodTrip, report]);

  const startFoody = useCallback(() => {
    if (!FoodDeliveryActivity) return;
    const startedAt = Date.now();
    const next: Trip = { startedAt, etaAt: startedAt + TRIP_MS };
    try {
      const began = FoodDeliveryActivity.start(foodyContentFor(next, startedAt, assetsRef.current));
      setFoodTrip(next);
      setFoodActivity(began);
    } catch (error) {
      report(error);
    }
  }, [report]);

  const endFoody = useCallback(async () => {
    if (!foodActivity) return;
    try {
      await foodActivity.end('immediate');
    } catch (error) {
      report(error);
    }
    setFoodActivity(null);
    setFoodTrip(null);
  }, [foodActivity, report]);

  const start = useCallback(() => {
    if (!DeliveryTrackingActivity) return;
    const startedAt = Date.now();
    const next: Trip = { startedAt, etaAt: startedAt + TRIP_MS };
    try {
      const started = DeliveryTrackingActivity.start(contentFor(next, startedAt, assetsRef.current));
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
        current ? contentFor(current, current.etaAt, assetsRef.current) : undefined
      );
    } catch (error) {
      report(error);
    }
    setActivity(null);
    setTrip(null);
  }, [activity, trip, report]);

  // `widget:///?autostart=delivery|foody` starts an activity without a tap, so a run can
  // be kicked off from the terminal with `xcrun simctl openurl` and screenshotted.
  const { autostart } = useLocalSearchParams<{ autostart?: string }>();
  useEffect(() => {
    if (!assets) return;
    // One activity at a time: two running at once share the island and both collapse
    // to their minimal presentation, which is not what a screenshot run is after.
    // `end` clears every instance of both, including ones left over from earlier launches.
    const endAll = async () => {
      await Promise.all(
        [...(DeliveryTrackingActivity?.getInstances() ?? []), ...(FoodDeliveryActivity?.getInstances() ?? [])]
          .map((instance) => instance.end('immediate').catch(report))
      );
      setActivity(null);
      setTrip(null);
      setFoodActivity(null);
      setFoodTrip(null);
    };
    if (autostart === 'delivery') {
      endAll().then(start);
    } else if (autostart === 'foody') {
      endAll().then(startFoody);
    } else if (autostart === 'end') {
      endAll();
    }
    // Only the first resolution of the assets should fire this, not every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, autostart]);

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

          <View style={styles.divider} />

          <Text style={styles.kicker}>LIVE ACTIVITY</Text>
          <Text style={styles.title}>Foody order</Text>
          <FoodyPreview
            progress={foodTrip ? progressFor(foodTrip, now) : 0}
            minutes={
              foodTrip
                ? Math.ceil(FOODY_START_MINUTES * (1 - elapsedFor(foodTrip, now)))
                : FOODY_START_MINUTES
            }
          />
          <View style={styles.buttons}>
            <Button
              label="Start order"
              onPress={startFoody}
              disabled={foodActivity !== null || !FoodDeliveryActivity}
              primary
            />
            <Button label="End order" onPress={endFoody} disabled={foodActivity === null} />
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

/** A filled circle with a glyph — the truck badge and the action buttons in the previews. */
function Chip({
  size,
  fill,
  children,
}: {
  size: number;
  fill: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: fill, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

/**
 * The delivery card as the comp draws it, at the comp's own proportions — the preview has
 * the whole screen, so unlike the Live Activity it need not give up the comp's air.
 */
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
  void progress;

  return (
    <View style={d.card}>
      <View style={d.top}>
        <View style={d.identity}>
          <Chip size={54} fill="#25272D">
            <Text style={d.badgeGlyph}>🚚</Text>
          </Chip>
          <View>
            <Text style={d.plate}>{DELIVERY.vehiclePlate}</Text>
            <Text style={d.model}>{DELIVERY.vehicleModel}</Text>
          </View>
        </View>
        <View style={d.right}>
          <Text style={[d.plate, d.mono]}>{arrived ? 'Arrived' : formatRemaining(remainingMs)}</Text>
          <Text style={d.model}>{km} km</Text>
        </View>
      </View>

      <View style={d.route}>
        <View style={d.railColumn}>
          <View style={d.dot} />
          <View style={d.rail} />
        </View>
        <View style={d.legs}>
          <Text style={d.label}>From</Text>
          <Text style={d.address}>{DELIVERY.fromAddress}</Text>
          <Text style={[d.label, d.toLabel]}>To</Text>
          <Text style={d.address}>{DELIVERY.toAddress}</Text>
        </View>
      </View>

      <View style={d.bottom}>
        <Chip size={36} fill="#2D2D2F">
          <Text style={d.actionGlyph}>☏</Text>
        </Chip>
        <Chip size={36} fill="#2D2D2F">
          <Text style={d.actionGlyph}>…</Text>
        </Chip>
        <View style={d.spacer} />
        <View style={d.right}>
          <Text style={d.driver}>{DELIVERY.driverName}</Text>
          <Text style={d.driverId}>ID - {DELIVERY.driverId}</Text>
        </View>
        <Image source={ART.driverAvatar} style={d.avatar} />
      </View>
    </View>
  );
}

/** The Foody card as the comp draws it: rider on the bar, halo behind, photo and glyphs. */
function FoodyPreview({ progress, minutes }: { progress: number; minutes: number }) {
  const riderW = 39;
  return (
    <View style={f.card}>
      <View style={d.top}>
        <View style={d.identity}>
          <Chip size={44} fill="#32373C">
            <Image source={ART.foodyGlyph} style={f.badgeGlyph} />
          </Chip>
          <View>
            <Text style={f.brand}>{FOODY.brand}</Text>
            <Text style={f.item}>{FOODY.orderItem}</Text>
          </View>
        </View>
        <View style={d.right}>
          <Text style={f.amount}>{FOODY.amount}</Text>
          <Text style={f.payment}>{FOODY.paymentMethod}</Text>
        </View>
      </View>

      <View style={f.body}>
        <View style={f.riderRow}>
          <View style={{ width: `${progress * 100}%` }} />
          <View style={f.riderSlot}>
            <View style={f.halo} />
            <Image source={ART.courier} style={f.rider} />
          </View>
        </View>
        <View style={f.track}>
          <View style={[f.fill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={f.courierRow}>
        <Image source={ART.courierAvatar} style={f.avatar} />
        <View style={f.courierText}>
          <Text style={f.courier}>{FOODY.courierName}</Text>
          <Text style={f.eta}>
            Will arrive in <Text style={f.etaStrong}>{minutes} min</Text>
          </Text>
        </View>
        <View style={d.spacer} />
        <Chip size={37} fill="#32373C">
          <Text style={f.callGlyph}>☏</Text>
        </Chip>
        <Chip size={37} fill="#32373C">
          <Text style={f.messageGlyph}>…</Text>
        </Chip>
      </View>
    </View>
  );
}

const d = StyleSheet.create({
  card: { backgroundColor: '#000000', borderWidth: 1, borderColor: '#17181B', borderRadius: 44, paddingHorizontal: 22, paddingVertical: 20, gap: 22 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeGlyph: { fontSize: 24 },
  plate: { color: '#F1F1F1', fontSize: 16, fontWeight: '700' },
  model: { color: '#63676C', fontSize: 13.5, marginTop: 2 },
  mono: { fontVariant: ['tabular-nums'] },
  right: { alignItems: 'flex-end' },
  route: { flexDirection: 'row', gap: 14, paddingLeft: 26 },
  railColumn: { alignItems: 'center', paddingTop: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FCEE58' },
  rail: { width: 2, height: 54, backgroundColor: '#636A71' },
  legs: { flex: 1 },
  label: { color: '#2A2C2E', fontSize: 13.5 },
  toLabel: { marginTop: 32 },
  address: { color: '#5C5C5C', fontSize: 15.5, marginTop: 2 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 6 },
  actionGlyph: { color: '#F1F1F1', fontSize: 16 },
  spacer: { flex: 1 },
  driver: { color: '#C8C8C8', fontSize: 16, fontWeight: '700' },
  driverId: { color: '#4E5457', fontSize: 11.8, marginTop: 4 },
  avatar: { width: 35, height: 35, borderRadius: 17.5, marginLeft: 2 },
});

const f = StyleSheet.create({
  card: { backgroundColor: '#06161C', borderRadius: 40, paddingHorizontal: 18, paddingVertical: 20, gap: 14, overflow: 'hidden' },
  badgeGlyph: { width: 22, height: 22 * (60 / 69) },
  brand: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  item: { color: '#B8C3CE', fontSize: 13, marginTop: 2 },
  amount: { color: '#FFFFFF', fontSize: 19, fontWeight: '700' },
  payment: { color: '#C9D0DB', fontSize: 12, marginTop: 1 },
  body: { gap: 2, marginTop: 4 },
  riderRow: { flexDirection: 'row', height: 31, alignItems: 'flex-end', marginRight: 43 },
  riderSlot: { width: 39, height: 31, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 124, height: 124, borderRadius: 62, backgroundColor: '#77FBDA', opacity: 0.16 },
  rider: { width: 39, height: 31 },
  track: { height: 7.5, borderRadius: 4, overflow: 'hidden', backgroundColor: '#323235' },
  fill: { height: 7.5, backgroundColor: '#77FBDA' },
  courierRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 37, height: 37, borderRadius: 18.5 },
  courierText: { marginLeft: 12 },
  courier: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  eta: { color: '#B8C3CE', fontSize: 15, marginTop: 1 },
  etaStrong: { color: '#77FBDA', fontWeight: '700' },
  callGlyph: { color: '#69D6FB', fontSize: 17 },
  messageGlyph: { color: '#77FBDA', fontSize: 17, fontWeight: '700' },
});

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
  kicker: { color: '#FCEE58', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: -14 },


  notice: { backgroundColor: '#1F1F22', borderRadius: 18, padding: 16, gap: 8 },
  noticeTitle: { color: '#FCEE58', fontSize: 16, fontWeight: '700' },
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
  buttonPrimary: { backgroundColor: '#FCEE58' },
  buttonActive: { backgroundColor: '#2C2C31' },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.35 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonLabelPrimary: { color: '#000000' },

  footnote: { color: '#6E6E73', fontSize: 13, lineHeight: 19 },

  divider: { height: 1, backgroundColor: '#17181B', marginVertical: 4 },
});
