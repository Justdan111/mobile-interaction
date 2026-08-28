import type { BrandId } from '@/components/icons';
import type { ImageKey } from '@/data/images';

export type Product = {
  id: string;
  name: string;
  brand: BrandId;
  category: string;
  price: number;
  rating: number;
  /** Pre-formatted, e.g. "23K" — the comp shows an abbreviated count. */
  sold: string;
  description: string;
  /** Exactly three: the detail screen's thumbnail rail shows three. */
  images: ImageKey[];
};

export const products: Product[] = [
  {
    id: 'kinetic-17-le',
    name: 'Volara Kinetic 17 LE',
    brand: 'volara',
    category: 'Racket',
    price: 120,
    rating: 4.5,
    sold: '23K',
    description:
      'This racket has a light weight of 78 grams so it is very easy to swing, made of Grade Carbon Fiber with Dynamic-Optimum Frame technology.',
    images: ['racket-kinetic', 'racket-arc', 'racket-blade'],
  },
  {
    id: 'a90-state',
    name: 'Volara A+ 90 State',
    brand: 'volara',
    category: 'Shuttlecock',
    price: 80,
    rating: 4.7,
    sold: '18K',
    description:
      'Tournament-grade goose feather shuttles with a cork base, tube of twelve. Consistent flight at speed 77, tested to national standard.',
    images: ['shuttle-tube', 'shuttle-feather', 'racket-storm'],
  },
  {
    id: 'arc-sabre',
    name: 'Kestrel Arc Sabre 900',
    brand: 'kestrel',
    category: 'Racket',
    price: 165,
    rating: 4.8,
    sold: '9.4K',
    description:
      'A head-heavy frame built for the back court. Stiff shaft, 4U balance, strung at 26lb on the factory rig for immediate play.',
    images: ['racket-arc', 'racket-blade', 'racket-kinetic'],
  },
  {
    id: 'blade-x2',
    name: 'Ardent Blade X2',
    brand: 'ardent',
    category: 'Racket',
    price: 98,
    rating: 4.3,
    sold: '12K',
    description:
      'An even-balance all-rounder for club play. Forgiving through the sweet spot and quick enough at the net to hold its own in doubles.',
    images: ['racket-blade', 'racket-storm', 'racket-drift'],
  },
  {
    id: 'storm-lite',
    name: 'Sable Storm Lite 4U',
    brand: 'sable',
    category: 'Racket',
    price: 74,
    rating: 4.1,
    sold: '31K',
    description:
      'The lightest frame in the range at 72 grams, aimed at players moving up from a starter racket. Flexible shaft, generous string bed.',
    images: ['racket-storm', 'racket-drift', 'racket-arc'],
  },
  {
    id: 'drift-tour',
    name: 'Kestrel Drift Tour 88',
    brand: 'kestrel',
    category: 'Racket',
    price: 56,
    rating: 4.6,
    sold: '7.8K',
    description:
      'The entry frame in the Kestrel line, strung at 22lb and balanced for control. Aluminium head on a steel shaft, forgiving on off-centre hits.',
    // A racket rather than a gear bag: every free racket-bag photograph
    // carried a legible manufacturer wordmark.
    images: ['racket-pair', 'racket-drift', 'court-action'],
  },
];

export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
