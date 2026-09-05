/**
 * Registry of every widget and Live Activity in this app.
 *
 * Importing this module is what registers the layouts with the native side:
 * `createWidget` / `createLiveActivity` write their serialised layout into the shared
 * app group as a side effect of construction. The app imports it once, from
 * `src/app/_layout.tsx`, so the layouts are in place before any screen tries to start
 * an activity.
 *
 * To add another, drop a sibling file next to the existing ones and register it here in
 * the same guarded shape.
 */
import type { LiveActivityFactory } from 'expo-widgets';

import type { DeliveryTrackingProps } from './DeliveryTrackingActivity';
import type { FoodDeliveryProps } from './FoodDeliveryActivity';

export type { DeliveryTrackingProps } from './DeliveryTrackingActivity';
export type { FoodDeliveryProps } from './FoodDeliveryActivity';

/**
 * `expo-widgets` resolves its native module the moment it is imported, so in a client
 * that does not carry it — Expo Go, most obviously — a plain import throws while the
 * root layout is still evaluating. Expo Router then finds an undefined route module and
 * fails again reading `ErrorBoundary` off it, which buries the real cause under a stack
 * pointing at router internals.
 *
 * Requiring each one behind a guard keeps that failure legible: the app still boots, and
 * the control screen can say plainly that this needs a development build.
 */
function load<T extends object>(require_: () => { default: LiveActivityFactory<T> }): {
  activity: LiveActivityFactory<T> | null;
  unavailable: string | null;
} {
  try {
    return { activity: require_().default, unavailable: null };
  } catch (error) {
    return { activity: null, unavailable: error instanceof Error ? error.message : String(error) };
  }
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const delivery = load<DeliveryTrackingProps>(() => require('./DeliveryTrackingActivity'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const food = load<FoodDeliveryProps>(() => require('./FoodDeliveryActivity'));

/** Van-tracking Live Activity, or `null` when the native module is not in this client. */
export const DeliveryTrackingActivity = delivery.activity;

/** Foody order-tracking Live Activity, or `null` when the native module is missing. */
export const FoodDeliveryActivity = food.activity;

/**
 * Why the widgets could not be registered, or `null` when everything is in place.
 * Non-null means the app is running somewhere without the `expo-widgets` native module.
 */
export const widgetsUnavailable = delivery.unavailable ?? food.unavailable;
