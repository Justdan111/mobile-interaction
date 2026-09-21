/**
 * Stages the images the widgets draw into the shared app group.
 *
 * A widget extension cannot see the app's bundle, and `Image uiImage` loads from a plain
 * `file://` URL, so every photo and illustration has to be copied somewhere both sides
 * can read — the `widgetsDirectory` `expo-widgets` exposes inside the app group. This is
 * app-side code: it is *not* a widget body, so importing modules here is fine.
 *
 * The files themselves are cut from the reference comps in `docs/screenshots/`, which is
 * what makes the driver, courier, rider and badge match the design rather than stand in
 * for it with SF Symbols.
 */
import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';

export type WidgetAssetUris = {
  /** The delivery driver's photo, already cut to a circle. */
  driverAvatar: string;
  /** The Foody courier's photo, already cut to a circle. */
  courierAvatar: string;
  /** The Foody rider-on-a-scooter illustration, background removed. */
  courier: string;
  /** Foody's burger-and-cup mark, white on transparent. */
  foodyGlyph: string;
};

const MODULES: Record<keyof WidgetAssetUris, number> = {
  driverAvatar: require('../assets/widgets/driver-avatar.png'),
  courierAvatar: require('../assets/widgets/courier-avatar.png'),
  courier: require('../assets/widgets/courier.png'),
  foodyGlyph: require('../assets/widgets/foody-glyph.png'),
};

/**
 * Copies each bundled asset into `widgetsDirectory` and returns their `file://` URIs.
 * Safe to call on every launch — an existing copy is overwritten, so a changed asset
 * shows up without clearing anything by hand.
 */
export async function stageWidgetAssets(widgetsDirectory: string): Promise<WidgetAssetUris> {
  const shared = new Directory(widgetsDirectory);
  if (!shared.exists) shared.create({ intermediates: true, idempotent: true });

  const entries = await Promise.all(
    (Object.keys(MODULES) as (keyof WidgetAssetUris)[]).map(async (key) => {
      const asset = await Asset.fromModule(MODULES[key]).downloadAsync();
      if (!asset.localUri) throw new Error(`Widget asset '${key}' has no local file.`);
      const destination = new File(shared, `${key}.png`);
      await new File(asset.localUri).copy(destination, { overwrite: true });
      return [key, destination.uri] as const;
    })
  );

  return Object.fromEntries(entries) as WidgetAssetUris;
}
