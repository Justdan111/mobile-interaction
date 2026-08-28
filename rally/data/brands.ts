import type { BrandId } from '@/components/icons';

export type Brand = {
  id: BrandId;
  name: string;
};

/**
 * Four invented house brands, standing in for real manufacturers' marks so the
 * category rail keeps its logo-tile texture without borrowing any trademarks.
 */
export const brands: Brand[] = [
  { id: 'volara', name: 'VOLARA' },
  { id: 'kestrel', name: 'KESTREL' },
  { id: 'ardent', name: 'Ardent' },
  { id: 'sable', name: 'sable' },
];
