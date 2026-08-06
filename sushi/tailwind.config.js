/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Washi paper — the light screens.
        paper: {
          DEFAULT: '#E6DFD1',
          deep: '#DCD3C1',
          edge: '#CFC5B0',
        },
        // Sumi ink — type on paper, and the near-black CTA.
        ink: {
          DEFAULT: '#12100A',
          soft: '#7D7464',
          faint: '#A79C88',
        },
        // The dark menu screen.
        night: {
          DEFAULT: '#0B0C09',
          card: '#131410',
          raised: '#1B1C16',
          muted: '#A5A093',
        },
        // Vermilion — the sun, the stamp, every call to action.
        terracotta: {
          DEFAULT: '#A8502E',
          deep: '#8E3F22',
          ember: '#A64824',
          glow: '#D2703F',
        },
      },
      fontFamily: {
        // Lexend ships one family per weight, so each is registered separately.
        lex: ['Lexend_400Regular'],
        'lex-medium': ['Lexend_500Medium'],
        'lex-semibold': ['Lexend_600SemiBold'],
        'lex-bold': ['Lexend_700Bold'],
        'lex-black': ['Lexend_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
