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
 * re-export it here.
 */
export { default as DeliveryTrackingActivity } from './DeliveryTrackingActivity';
export type { DeliveryTrackingProps } from './DeliveryTrackingActivity';
