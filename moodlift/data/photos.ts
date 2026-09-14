import type { ImageSourcePropType } from 'react-native';
import type { PhotoKey } from './workouts';

/**
 * Workout photography, keyed the way the catalogue names it.
 *
 * `require` is resolved at bundle time, so this map has to list every key
 * literally — a computed `require(\`./\${key}.jpg\`)` silently fails under
 * Metro. Provenance for each file is in `assets/workouts/SOURCES.md`.
 */
export const PHOTOS: Record<PhotoKey, ImageSourcePropType> = {
  power: require('../assets/workouts/power.jpg'),
  relax: require('../assets/workouts/relax.jpg'),
  cycling: require('../assets/workouts/cycling.jpg'),
  balance: require('../assets/workouts/balance.jpg'),
  gym: require('../assets/workouts/gym.jpg'),
  functional: require('../assets/workouts/functional.jpg'),
  dance: require('../assets/workouts/dance.jpg'),
  tennis: require('../assets/workouts/tennis.jpg'),
  mobility: require('../assets/workouts/mobility.jpg'),
  stretch: require('../assets/workouts/stretch.jpg'),
  intervals: require('../assets/workouts/intervals.jpg'),
  recovery: require('../assets/workouts/recovery.jpg'),
  swim: require('../assets/workouts/swim.jpg'),
  circuit: require('../assets/workouts/circuit.jpg'),
  pilates: require('../assets/workouts/pilates.jpg'),
  hiit: require('../assets/workouts/hiit.jpg'),
};

export function photoFor(key: PhotoKey): ImageSourcePropType {
  return PHOTOS[key];
}
