import { cutouts, photos, type PhotoKey } from './images';

export type CategoryId = 'nigiri' | 'maki' | 'sashimi' | 'special' | 'sets';

export type Category = {
  id: CategoryId;
  label: string;
  /** Shown on the menu header stamp when the category is selected. */
  jp: string;
};

export type Dish = {
  id: string;
  name: string;
  /** Vertical kana run printed down the right edge of the detail screen. */
  kana: string;
  category: CategoryId;
  price: number;
  /** One-or-two-line blurb used on the menu cards. */
  blurb: string;
  /** Longer copy for the detail screen. */
  description: string;
  /**
   * Base filename of the photograph, without extension. Both the card image
   * and its feathered hero are looked up from this — see `data/images.ts`,
   * which `tools/make-art.py` regenerates.
   */
  photo: PhotoKey;
  /**
   * The tall image-led card at the top of a category. Only one dish per
   * category should carry it.
   */
  featured?: boolean;
};

export const categories: Category[] = [
  { id: 'nigiri', label: 'Nigiri', jp: 'お品書き' },
  { id: 'maki', label: 'Maki', jp: '巻き物' },
  { id: 'sashimi', label: 'Sashimi', jp: '刺身' },
  { id: 'special', label: 'Special', jp: '特選' },
  { id: 'sets', label: 'Sets', jp: '盛合せ' },
];

/**
 * Order matters: within a category the featured dish is drawn first, then the
 * rest in the order listed here.
 */
export const dishes: Dish[] = [
  {
    id: 'premium-nigiri',
    name: 'Premium Nigiri',
    kana: '特上にぎり',
    category: 'nigiri',
    price: 24.0,
    blurb: 'Handcrafted nigiri with the freshest ingredients.',
    description:
      'Eight pieces cut to order from the morning catch, pressed over warm shari and finished with a brush of nikiri.',
    photo: 'hero-platter',
    featured: true,
  },
  {
    id: 'dragon-roll',
    name: 'Dragon Roll',
    kana: 'ドラゴンロール',
    category: 'nigiri',
    price: 16.5,
    blurb: 'Eel, avocado, cucumber topped with eel sauce and sesame.',
    description:
      'Grilled freshwater eel laid over avocado and cucumber, glazed with a slow-reduced unagi sauce and toasted sesame.',
    photo: 'dragon-roll',
  },
  {
    id: 'spicy-tuna-roll',
    name: 'Spicy Tuna Roll',
    kana: 'スパイシーツナ',
    category: 'nigiri',
    price: 9.5,
    blurb: 'Fresh tuna, spicy mayo, cucumber, scallion.',
    description:
      'Hand-chopped akami folded through chilli mayo with cucumber and scallion, rolled tight in crisp nori.',
    photo: 'spicy-tuna-roll',
  },
  {
    id: 'salmon-aburi-nigiri',
    name: 'Salmon Aburi Nigiri',
    kana: '炙りサーモン',
    category: 'nigiri',
    price: 5.8,
    blurb: 'Seared salmon with a hint of yuzu and topped with tobiko.',
    description: 'Seared salmon with a hint of yuzu and topped with tobiko.',
    photo: 'salmon-aburi',
  },
  {
    id: 'unagi-nigiri',
    name: 'Unagi Nigiri',
    kana: 'うなぎ',
    category: 'nigiri',
    price: 7.2,
    blurb: 'Grilled freshwater eel, sweet tare glaze, sansho pepper.',
    description:
      'Charcoal-grilled eel lacquered in tare, dusted with sansho pepper and bound with a ribbon of nori.',
    photo: 'unagi-nigiri',
  },

  {
    id: 'rainbow-roll',
    name: 'Rainbow Roll',
    kana: 'レインボー',
    category: 'maki',
    price: 18.0,
    blurb: 'Crab and avocado draped in five cuts of the day.',
    description:
      'A California core wrapped in overlapping slices of tuna, salmon, hamachi, snapper and avocado.',
    photo: 'rainbow-deluxe',
    featured: true,
  },
  {
    id: 'california-roll',
    name: 'California Roll',
    kana: 'カリフォルニア',
    category: 'maki',
    price: 11.0,
    blurb: 'Snow crab, avocado, cucumber, toasted sesame.',
    description:
      'The house uramaki — snow crab and avocado inside out, rolled in nutty toasted sesame.',
    photo: 'california-roll',
  },
  {
    id: 'philadelphia-roll',
    name: 'Philadelphia Roll',
    kana: 'フィラデルフィア',
    category: 'maki',
    price: 13.5,
    blurb: 'Smoked salmon, cream cheese, chive.',
    description:
      'Cold-smoked salmon and cultured cream cheese with chive, cut thick and finished with dill oil.',
    photo: 'philadelphia-roll',
  },
  {
    id: 'avocado-maki',
    name: 'Avocado Maki',
    kana: 'アボカド巻き',
    category: 'maki',
    price: 7.5,
    blurb: 'Ripe avocado, shiso, sesame. Fully plant based.',
    description:
      'Six pieces of ripe avocado and shiso rolled in nori, brushed with sesame oil and flaked salt.',
    photo: 'avocado-maki',
  },

  {
    id: 'salmon-sashimi',
    name: 'Salmon Sashimi',
    kana: 'サーモン刺身',
    category: 'sashimi',
    price: 19.0,
    blurb: 'Five thick cuts of loin, wasabi grated to order.',
    description:
      'Loin cut against the grain into five generous slices, served with freshly grated wasabi and ponzu.',
    photo: 'salmon-uramaki',
    featured: true,
  },
  {
    id: 'tobiko-selection',
    name: 'Tobiko Selection',
    kana: 'とびこ',
    category: 'sashimi',
    price: 15.0,
    blurb: 'Flying fish roe three ways — yuzu, wasabi, plain.',
    description:
      'Three spoons of tobiko cured in yuzu, wasabi and sea salt, served over shaved ice.',
    photo: 'tobiko-roll',
  },
  {
    id: 'maguro-sashimi',
    name: 'Maguro Sashimi',
    kana: 'まぐろ刺身',
    category: 'sashimi',
    price: 22.0,
    blurb: 'Bluefin akami, cut thick, aged four days.',
    description:
      'Dry-aged bluefin loin sliced thick so the grain stays soft, with nothing but soy and wasabi.',
    photo: 'premium-nigiri',
  },

  {
    id: 'chefs-selection',
    name: "Chef's Selection",
    kana: 'おまかせ',
    category: 'special',
    price: 48.0,
    blurb: 'Twelve courses chosen at the counter, nightly.',
    description:
      'Whatever the counter is proudest of that evening — twelve courses, paced by the chef, no substitutions.',
    photo: 'chef-selection',
    featured: true,
  },
  {
    id: 'toro-flight',
    name: 'Toro Flight',
    kana: 'とろ三種',
    category: 'special',
    price: 34.0,
    blurb: 'Akami, chutoro and otoro side by side.',
    description:
      'The whole bluefin loin in three pieces, from lean akami through to the marbled otoro belly.',
    photo: 'deluxe-platter',
  },
  {
    id: 'aburi-flight',
    name: 'Aburi Flight',
    kana: '炙り三種',
    category: 'special',
    price: 26.0,
    blurb: 'Three seared nigiri finished with a binchotan torch.',
    description:
      'Salmon, hamachi and scallop kissed with binchotan flame, each with its own finishing salt.',
    photo: 'rainbow-roll',
  },

  {
    id: 'omakase-boat',
    name: 'Omakase Boat',
    kana: '舟盛り',
    category: 'sets',
    price: 96.0,
    blurb: 'Forty pieces for the table, arranged on the boat.',
    description:
      'Forty pieces of nigiri and maki plated across the cedar boat — built for four, finished by two.',
    photo: 'omakase-boat',
    featured: true,
  },
  {
    id: 'maki-box',
    name: 'Maki Box',
    kana: '巻き物折',
    category: 'sets',
    price: 32.0,
    blurb: 'Twenty-four pieces across four rolls, boxed.',
    description:
      'Four of the house rolls cut into twenty-four pieces and packed with ginger, wasabi and soy.',
    photo: 'maki-grid',
  },
  {
    id: 'sushi-spread',
    name: 'Counter Spread',
    kana: '大盛り',
    category: 'sets',
    price: 64.0,
    blurb: 'The full counter — nigiri, maki, sashimi, sides.',
    description:
      'Everything the counter serves in one order: nigiri, maki, sashimi, edamame and miso.',
    photo: 'sushi-spread',
  },
];

export function dishesIn(category: CategoryId): Dish[] {
  const inCategory = dishes.filter((d) => d.category === category);
  return [
    ...inCategory.filter((d) => d.featured),
    ...inCategory.filter((d) => !d.featured),
  ];
}

export function dishById(id: string | undefined): Dish | undefined {
  return dishes.find((d) => d.id === id);
}

/** The full-bleed photograph, for cards on the dark menu screen. */
export const photoOf = (dish: Dish) => photos[dish.photo];

/**
 * The same photograph feathered onto the washi, for heroes on the paper
 * screens. Never use the raw photo there — its square edge is the difference
 * between an image that belongs on the page and one that was pasted onto it.
 */
export const cutoutOf = (dish: Dish) => cutouts[dish.photo];

/**
 * How a dish name is set as a display title. Three-word names break after the
 * first word — "Salmon / Aburi Nigiri" — which is the rhythm the printed menu
 * uses; shorter names stay on one line. Left to natural wrapping the break
 * lands wherever the measured width happens to fall, and moves between
 * devices.
 */
export function titleLines(name: string): string {
  const words = name.split(' ');
  return words.length >= 3 ? `${words[0]}\n${words.slice(1).join(' ')}` : name;
}

export const money = (value: number) => `$${value.toFixed(2)}`;
