/**
 * Registry of every widget and Live Activity in this app.
 *
 * Importing this module is what registers the layouts with the native side:
 * `createWidget` / `createLiveActivity` write their serialised layout into the shared
 * app group as a side effect of construction. The app imports it once, from
 * `src/app/_layout.tsx`, so the layouts are in place before any screen tries to start
 * an activity.
 *
 * To add widget 2, drop a sibling file next to `DeliveryTrackingActivity.tsx` and
 * re-export it here, following the same guarded shape.
 */
import type { LiveActivityFactory } from 'expo-widgets';

import type { DeliveryTrackingProps } from './DeliveryTrackingActivity';

export type { DeliveryTrackingProps } from './DeliveryTrackingActivity';

/**
 * `expo-widgets` resolves its native module the moment it is imported, so in a client
 * that does not carry it — Expo Go, most obviously — a plain import throws while the
 * root layout is still evaluating. Expo Router then finds an undefined route module and
 * fails again reading `ErrorBoundary` off it, which buries the real cause under a stack
 * pointing at router internals.
 *
 * Requiring it behind a guard keeps that failure legible: the app still boots, and the
 * control screen can say plainly that this needs a development build.
 */
function load(): {
  activity: LiveActivityFactory<DeliveryTrackingProps> | null;
  unavailable: string | null;
} {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return { activity: require('./DeliveryTrackingActivity').default, unavailable: null };
  } catch (error) {
    return { activity: null, unavailable: error instanceof Error ? error.message : String(error) };
  }
}

const loaded = load();

/** The Live Activity factory, or `null` when the native module is not in this client. */
export const DeliveryTrackingActivity = loaded.activity;

/**
 * Why the widgets could not be registered, or `null` when everything is in place.
 * Non-null means the app is running somewhere without the `expo-widgets` native module.
 */
export const widgetsUnavailable = loaded.unavailable;
