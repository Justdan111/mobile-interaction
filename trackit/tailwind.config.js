/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand green — the trackit accent
        brand: {
          50: '#E9F9EF',
          100: '#CFF2DC',
          200: '#A3E7BE',
          300: '#71D89C',
          400: '#48C97F',
          500: '#2EB86A', // primary
          600: '#22A15A',
          700: '#1B8049',
          800: '#166639',
          900: '#0F4C2B',
        },
        // Dark surfaces (splash, featured card, dark CTA)
        ink: {
          DEFAULT: '#131A1F',
          soft: '#1B2530',
          card: '#16211C', // green-tinted near-black used on the featured card
        },
        // Neutrals
        surface: '#F1F3F5', // light screen background
        line: '#EAECEF', // hairline dividers / borders
        muted: '#8A929C', // secondary text
        // Status accents
        amber: {
          soft: '#FCEBCB',
          DEFAULT: '#F0A028',
        },
      },
      fontFamily: {
        // DM Sans is loaded per weight, so each weight is its own family.
        dm: ['DMSans_400Regular'],
        'dm-medium': ['DMSans_500Medium'],
        'dm-semibold': ['DMSans_600SemiBold'],
        'dm-bold': ['DMSans_700Bold'],
      },
      borderRadius: {
        '4xl': '28px',
      },
    },
  },
  plugins: [],
};
