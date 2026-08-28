/**
 * The palette, in TS form, for the places NativeWind classes can't reach:
 * SVG gradients, LinearGradient stops, status bar, navigation background.
 * Keep in sync with tailwind.config.js.
 */
export const colors = {
  void: '#000000',

  // Range cards: a near-neutral charcoal at the top-left drifting violet at
  // the bottom-right, with a lit hairline along the top edge.
  cardTop: '#1A1A1C',
  cardMid: '#2F273D',
  cardEnd: '#362E44',
  cardEdge: '#66626B',

  // The graph panel is darker and colder than the range cards.
  panelTop: '#171029',
  panelMid: '#101010',
  panelEnd: '#111111',
  panelEdge: '#2C243C',

  chipActive: '#4C3C68',
  chip: '#0A0A0B',
  chipEdge: '#2A2A2C',

  violetCrest: '#A07FD4',
  violetCap: '#A693D7',
  violetMid: '#45365F',
  violetDeep: '#50406C',
  violetInk: '#2A1745',
  badge: '#D8B4F0',
  badgeInk: '#2A1245',

  clayCap: '#C8897E',
  clayMid: '#A67376',
  amberCap: '#CBAC7C',
  amberMid: '#8E7480',

  button: '#111111',
  buttonEdge: '#6B676F',
  menu: '#343434',

  chalk: '#FFFFFF',
  mist: '#C9C6CF',
  smoke: '#8A8792',
} as const;
