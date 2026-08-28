/**
 * Sampled rather than eyeballed — the paper,
 * the vermilion and the near-black are the whole identity of this app.
 */
export const colors = {
  paper: '#E6DFD1',
  paperDeep: '#DCD3C1',
  paperEdge: '#CFC5B0',

  ink: '#12100A',
  inkSoft: '#7D7464',
  inkFaint: '#A79C88',

  night: '#0B0C09',
  nightCard: '#131410',
  nightRaised: '#1B1C16',
  nightMuted: '#A5A093',

  terracotta: '#A8502E',
  terracottaDeep: '#8E3F22',
  ember: '#A64824',
  glow: '#D2703F',

  white: '#FFFFFF',
} as const;

/** Hairlines differ per surface — one on paper, one on the dark screen. */
export const hairline = {
  onPaper: 'rgba(18,16,10,0.16)',
  onNight: 'rgba(255,255,255,0.13)',
} as const;
