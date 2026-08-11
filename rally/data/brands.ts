import type { BrandId } from '@/components/icons';

export type Brand = {
  id: BrandId;
  name: string;
};

/**
 * Four invented house brands. The comps show real manufacturers' marks; these
 * stand in for them so the category rail keeps its logo-tile texture without
 * borrowing anyone's trademarks.
 */
export const brands: Brand[] = [
  { id: 'volara', name: 'VOLARA' },
  { id: 'kestrel', name: 'KESTREL' },
  { id: 'ardent', name: 'Ardent' },
  { id: 'sable', name: 'sable' },
];
