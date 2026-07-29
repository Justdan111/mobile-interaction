import type { ImageSourcePropType } from 'react-native';

export type Car = {
  id: string;
  decade: string; // e.g. "1980S/"
  author: string; // may contain a newline for two-line names
  model: string; // e.g. "BMW M1 PROCAR"
  year: string; // e.g. "1970"
  tire: string; // size of tire
  code: string; // model code / number
  hero: ImageSourcePropType; // primary image (collection expand + details hero)
  detail: ImageSourcePropType; // secondary image on details screen
};

const porsche = require('@/assets/images/cars/porsche-side.png');
const mazdaFront = require('@/assets/images/cars/mazda-front.png');
const mazdaRear = require('@/assets/images/cars/mazda-rear.png');
const modulo = require('@/assets/images/cars/modulo-side.png');

export const CARS: Car[] = [
  {
    id: '1970s',
    decade: '1970S/',
    author: 'Onur Dursun',
    model: 'PORSCHE 917K',
    year: '1970',
    tire: '11.50-15',
    code: 'K‑917',
    hero: porsche,
    detail: porsche,
  },
  {
    id: '1980s',
    decade: '1980S/',
    author: 'David\nSchäfer',
    model: 'BMW M1 PROCAR',
    year: '1980',
    tire: '12.00-20',
    code: 'HY461',
    hero: mazdaFront,
    detail: mazdaRear,
  },
  {
    id: '1990s',
    decade: '1990S/',
    author: 'Toby Lee',
    model: 'MCLAREN F1 GTR',
    year: '1995',
    tire: '13.00-18',
    code: 'F1‑GTR',
    hero: modulo,
    detail: modulo,
  },
  {
    id: '2000s',
    decade: '2000S/',
    author: 'Hau Nguyen\nDinh',
    model: 'PENNZOIL NISSAN',
    year: '2003',
    tire: '13.50-19',
    code: 'R34‑PZ',
    hero: mazdaFront,
    detail: mazdaRear,
  },
];

export function getCar(id: string): Car | undefined {
  return CARS.find((c) => c.id === id);
}
