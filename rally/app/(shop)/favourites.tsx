import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/state/store';

export default function Favourites() {
  const { favourites } = useStore();
  const n = favourites.size;
  return (
    <EmptyState
      title="Favourites"
      message={
        n
          ? `${n} product${n === 1 ? '' : 's'} saved. A list view for these isn't built yet.`
          : 'Nothing saved yet. Tap the heart on any product to keep it here.'
      }
    />
  );
}
