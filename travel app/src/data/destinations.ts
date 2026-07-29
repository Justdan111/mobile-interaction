export type Region =
  | 'Asia'
  | 'Europe'
  | 'South America'
  | 'North America'
  | 'Africa'
  | 'Oceania';

export const REGIONS: Region[] = [
  'Asia',
  'Europe',
  'South America',
  'North America',
  'Africa',
  'Oceania',
];

export type Tour = {
  id: string;
  title: string;
  days: number;
  priceFrom: number;
  rating: number;
  reviews: number;
  image: string;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  flag: string;
  region: Region;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tours: Tour[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

type BaseDestination = Omit<Destination, 'tours'> & {
  tourImages: [string, string, string];
};

// A secondary photo for the second tour card, so each destination's
// "Upcoming tours" row isn't three copies of the hero image.
const RAW_DESTINATIONS: BaseDestination[] = [
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'South America',
    rating: 5.0,
    reviews: 143,
    image: unsplash('photo-1506905925346-21bda4d32df4'),
    description:
      "Rio de Janeiro, often simply called Rio, is one of Brazil's most iconic cities, renowned for its dramatic mountains, golden beaches and the world-famous Christ the Redeemer watching over Guanabara Bay. From the samba clubs of Lapa to the sands of Copacabana, the city pulses with energy day and night.",
    tourImages: [
      unsplash('photo-1483729558449-99ef09a8c325'),
      unsplash('photo-1544989164-31dc3c645987'),
      unsplash('photo-1516306580123-e6e52b1b7b5f'),
    ],
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    country: 'Peru',
    flag: '🇵🇪',
    region: 'South America',
    rating: 4.9,
    reviews: 212,
    image: unsplash('photo-1526392060635-9d6019884377'),
    description:
      'Machu Picchu, the lost city of the Incas, sits high in the Andes above the Sacred Valley. This 15th-century citadel of dry-stone terraces and temples is one of the most breathtaking archaeological sites on Earth, wrapped in mist and mountain silence.',
    tourImages: [
      unsplash('photo-1587595431973-160d0d94add1'),
      unsplash('photo-1531065208531-4036c0dba3ca'),
      unsplash('photo-1526392060635-9d6019884377'),
    ],
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    country: 'Argentina',
    flag: '🇦🇷',
    region: 'South America',
    rating: 4.8,
    reviews: 98,
    image: unsplash('photo-1469474968028-56623f02e42e'),
    description:
      'Patagonia is a vast wilderness of jagged peaks, turquoise glaciers and windswept steppe stretching across the southern tip of the continent. It is a paradise for trekkers, with the granite towers of Torres del Paine and the roaring Perito Moreno glacier among its wonders.',
    tourImages: [
      unsplash('photo-1478827387698-1527781a4887'),
      unsplash('photo-1454496522488-7a8e488e8606'),
      unsplash('photo-1469474968028-56623f02e42e'),
    ],
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    region: 'Asia',
    rating: 4.9,
    reviews: 321,
    image: unsplash('photo-1537996194471-e657df975ab4'),
    description:
      'Bali is the jewel of Indonesia, an island of emerald rice terraces, volcanic peaks and sacred temples fringed by warm surf. Whether you seek yoga in Ubud, sunsets in Uluwatu or the reefs off Nusa Penida, the Island of the Gods offers serenity and adventure in equal measure.',
    tourImages: [
      unsplash('photo-1518548419970-58e3b4079ab2'),
      unsplash('photo-1555400038-63f5ba517a47'),
      unsplash('photo-1537996194471-e657df975ab4'),
    ],
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia',
    rating: 4.8,
    reviews: 187,
    image: unsplash('photo-1493976040374-85c8e12f0c0e'),
    description:
      "Kyoto, Japan's ancient capital, is a city of over a thousand temples, wooden machiya houses and quiet Zen gardens. Wander the bamboo groves of Arashiyama, watch geisha slip through the lantern-lit streets of Gion, and witness the seasons turn in gold and cherry blossom.",
    tourImages: [
      unsplash('photo-1478436127897-769e1b3f0f36'),
      unsplash('photo-1545569341-9eb8b30979d9'),
      unsplash('photo-1493976040374-85c8e12f0c0e'),
    ],
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    flag: '🇬🇷',
    region: 'Europe',
    rating: 4.9,
    reviews: 264,
    image: unsplash('photo-1570077188670-e3a8d69ac5ff'),
    description:
      'Santorini rises from the Aegean as a crescent of whitewashed villages perched on volcanic cliffs. Famed for its blue-domed churches, caldera views and some of the most spectacular sunsets in the world, this Cycladic island is romance carved in stone and sea.',
    tourImages: [
      unsplash('photo-1613395877344-13d4a8e0d49e'),
      unsplash('photo-1533105079780-92b9be482077'),
      unsplash('photo-1570077188670-e3a8d69ac5ff'),
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    region: 'Europe',
    rating: 4.7,
    reviews: 402,
    image: unsplash('photo-1502602898657-3e91760cbb34'),
    description:
      'Paris, the City of Light, needs little introduction. From the Eiffel Tower and the Louvre to hidden cafés along the Seine, the French capital blends grand boulevards with intimate corners, world-class art with the simple pleasure of a morning croissant.',
    tourImages: [
      unsplash('photo-1499856871958-5b9627545d1a'),
      unsplash('photo-1522093007474-d86e9bf7ba6f'),
      unsplash('photo-1502602898657-3e91760cbb34'),
    ],
  },
  {
    id: 'cinque-terre',
    name: 'Cinque Terre',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    rating: 4.8,
    reviews: 156,
    image: unsplash('photo-1516483638261-f4dbaf036963'),
    description:
      "Cinque Terre is a string of five pastel-hued fishing villages clinging to the rugged Ligurian coast. Linked by cliffside trails and terraced vineyards above the glittering sea, it is one of Italy's most enchanting corners, best explored on foot with a glass of local wine.",
    tourImages: [
      unsplash('photo-1533934248069-f89c1b291de1'),
      unsplash('photo-1512757776214-26d36777b513'),
      unsplash('photo-1516483638261-f4dbaf036963'),
    ],
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    country: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    rating: 4.6,
    reviews: 289,
    image: unsplash('photo-1501594907352-04cda38ebc29'),
    description:
      'San Francisco is a city of steep hills, rolling fog and the unmistakable red span of the Golden Gate Bridge. Ride the cable cars, wander Chinatown and the Mission, and watch the bay shimmer beyond a skyline that mixes Victorian charm with tech-age energy.',
    tourImages: [
      unsplash('photo-1521747116042-5a810fda9664'),
      unsplash('photo-1449034446853-66c86144b0ad'),
      unsplash('photo-1501594907352-04cda38ebc29'),
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    rating: 4.7,
    reviews: 512,
    image: unsplash('photo-1496442226666-8d4d0e62e6e9'),
    description:
      'New York City is the city that never sleeps, a dazzling collision of cultures across five boroughs. From the neon of Times Square and the calm of Central Park to Broadway stages and rooftop skylines, every street corner offers a new story.',
    tourImages: [
      unsplash('photo-1522083165195-3424ed129620'),
      unsplash('photo-1538970272646-f61fabb3a8a2'),
      unsplash('photo-1496442226666-8d4d0e62e6e9'),
    ],
  },
  {
    id: 'serengeti',
    name: 'Serengeti',
    country: 'Tanzania',
    flag: '🇹🇿',
    region: 'Africa',
    rating: 4.9,
    reviews: 134,
    image: unsplash('photo-1516426122078-c23e76319801'),
    description:
      'The Serengeti is Africa at its wildest, an endless golden plain hosting the greatest wildlife spectacle on Earth: the Great Migration of over a million wildebeest and zebra. Lions, elephants and cheetahs roam beneath acacia-dotted horizons and blazing sunsets.',
    tourImages: [
      unsplash('photo-1547970810-dc1eac37d174'),
      unsplash('photo-1534177616072-ef7dc120449d'),
      unsplash('photo-1516426122078-c23e76319801'),
    ],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Oceania',
    rating: 4.7,
    reviews: 231,
    image: unsplash('photo-1506973035872-a4ec16b8e8d9'),
    description:
      'Sydney sparkles around one of the finest harbours in the world, crowned by the sail-like Opera House and the great steel arch of the Harbour Bridge. Sun-soaked beaches like Bondi, leafy coastal walks and a buzzing food scene make it Australia at its most inviting.',
    tourImages: [
      unsplash('photo-1523482580672-f109ba8cb9be'),
      unsplash('photo-1524820197278-540916411e20'),
      unsplash('photo-1506973035872-a4ec16b8e8d9'),
    ],
  },
];

const TOUR_TEMPLATES = [
  { suffix: 'Iconic {name}', days: 8, priceFrom: 659, rating: 4.6, reviews: 56 },
  { suffix: 'Beaches & Coast', days: 6, priceFrom: 540, rating: 4.8, reviews: 41 },
  { suffix: 'Highlights Express', days: 4, priceFrom: 390, rating: 4.7, reviews: 33 },
];

function buildTours(base: BaseDestination): Tour[] {
  return TOUR_TEMPLATES.map((template, i) => ({
    id: `${base.id}-tour-${i}`,
    title:
      i === 0
        ? `Iconic ${base.country === 'United States' ? base.name : base.country}`
        : template.suffix,
    days: template.days,
    priceFrom: template.priceFrom,
    rating: template.rating,
    reviews: template.reviews,
    image: base.tourImages[i],
  }));
}

export const DESTINATIONS: Destination[] = RAW_DESTINATIONS.map((base) => {
  const { tourImages: _tourImages, ...rest } = base;
  return { ...rest, tours: buildTours(base) };
});

export const AVATAR_URI = unsplash('photo-1494790108377-be9c29b29330');

export type TripDay = {
  day: number;
  title: string;
  image: string;
  morning: string;
  afternoon: string;
  evening: string;
};

export type Trip = {
  title: string;
  dates: string;
  heading: string;
  days: TripDay[];
};

const PLANE_IMAGE = unsplash('photo-1436491865332-7a61a109cc05');
const DINNER_IMAGE = unsplash('photo-1414235077428-338989a2e8c0');

const RIO_DAY_TITLES = [
  'Arrival to Rio de Janeiro',
  'Rio de Janeiro Highlights',
  'Sugarloaf Mountain & Urca',
  'Christ the Redeemer & Santa Teresa',
  'Copacabana & Ipanema Beaches',
  'Tijuca Rainforest Adventure',
  'Day trip to Ilha Grande',
  'Departure day',
];

function genericDayTitles(name: string): string[] {
  return [
    `Arrival to ${name}`,
    `${name} Highlights`,
    'Old town walking tour',
    'Local food & markets',
    'Nature day trip',
    'Hidden gems & viewpoints',
    'Free day to explore',
    'Departure day',
  ];
}

const RIO_AERIAL_IMAGE = unsplash('photo-1483729558449-99ef09a8c325');

function buildDays(destination: Destination, titles: string[]): TripDay[] {
  const isRio = destination.id === 'rio-de-janeiro';
  const welcomeDinner = isRio
    ? 'Welcome dinner at a traditional Brazilian restaurant'
    : 'Welcome dinner at a traditional local restaurant';

  return titles.map((title, i) => ({
    day: i + 1,
    title,
    image:
      i === 0
        ? PLANE_IMAGE
        : i === titles.length - 1
          ? DINNER_IMAGE
          : isRio && i === 1
            ? RIO_AERIAL_IMAGE
            : destination.image,
    morning:
      i === 0
        ? `Arrive in ${destination.name} and transfer to your hotel`
        : `Guided morning around ${title.toLowerCase()}`,
    afternoon:
      i === 0
        ? 'Free time to relax or explore the nearby area'
        : 'Lunch at a local spot, then time at your own pace',
    evening: i === 0 ? welcomeDinner : 'Dinner and evening stroll with the group',
  }));
}

export function getTrip(destination: Destination): Trip {
  const country =
    destination.country === 'United States' ? 'USA' : destination.country;
  const titles =
    destination.id === 'rio-de-janeiro'
      ? RIO_DAY_TITLES
      : genericDayTitles(destination.name);

  return {
    title: `Iconic ${country}`,
    dates: 'Wed, Oct 21 – Sun, Nov 1',
    heading: `8-Days ${country} Adventure`,
    days: buildDays(destination, titles),
  };
}
