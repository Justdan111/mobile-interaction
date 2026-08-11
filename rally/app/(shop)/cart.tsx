import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/state/store';

export default function Cart() {
  const { cartCount } = useStore();
  return (
    <EmptyState
      title="Cart"
      message={
        cartCount
          ? `${cartCount} item${cartCount === 1 ? '' : 's'} waiting. Checkout isn't built yet.`
          : 'Your cart is empty. Add something from a product page.'
      }
    />
  );
}
