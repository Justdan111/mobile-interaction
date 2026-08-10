import { HeartFilledIcon, HeartIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

/**
 * Presentational. The caller owns whether this product is favourited, which
 * keeps the button usable from the grid and the detail screen without either
 * of them reaching into the other's state.
 */
export function HeartButton({
  active,
  onPress,
  size = 34,
}: {
  active: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <IconButton
      onPress={onPress}
      accessibilityLabel={active ? 'Remove from favourites' : 'Add to favourites'}
      className="rounded-full bg-surface"
      // Circle geometry is a style rather than a class so one `size` prop
      // drives both the 34pt grid button and the 56pt detail button.
      style={{ width: size, height: size }}
    >
      {active ? (
        <HeartFilledIcon size={size * 0.55} />
      ) : (
        <HeartIcon size={size * 0.55} />
      )}
    </IconButton>
  );
}
