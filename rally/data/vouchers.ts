import type { BrandId } from '@/components/icons';

export type Voucher = {
  id: string;
  /** First line, e.g. "Get voucher". */
  headline: string;
  /** The swoosh-underlined word opening the second line, e.g. "discount". */
  emphasis: string;
  /** Remainder of the second line, e.g. "up to 50%". */
  tail: string;
  brand: BrandId;
};

/**
 * The headline breaks across two lines with the swoosh hung under one word, so
 * the copy is split into the parts the card lays out rather than one string.
 */
export const vouchers: Voucher[] = [
  { id: 'v1', headline: 'Get voucher', emphasis: 'discount', tail: 'up to 50%', brand: 'volara' },
  { id: 'v2', headline: 'Free stringing', emphasis: 'on every', tail: 'frame this week', brand: 'kestrel' },
  { id: 'v3', headline: 'Bundle a tube', emphasis: 'and save', tail: 'a further 15%', brand: 'ardent' },
  { id: 'v4', headline: 'New season', emphasis: 'gear drops', tail: 'this Friday', brand: 'sable' },
];
