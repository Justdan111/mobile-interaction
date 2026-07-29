/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ember: {
          glow: '#F5A623',
          bright: '#ED8E2F',
          mid: '#C35312',
          deep: '#7A2E0C',
          shadow: '#2A1207',
          night: '#170B05',
          accent: '#FF6B00',
        },
        surface: {
          card: 'rgba(22, 8, 3, 0.45)',
          panel: 'rgba(20, 7, 3, 0.50)',
          chip: 'rgba(48, 20, 8, 0.45)',
        },
        content: {
          primary: '#FFF7F0',
          muted: 'rgba(255, 240, 228, 0.55)',
          faint: 'rgba(255, 240, 228, 0.35)',
        },
        hairline: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        inter: ['Inter'],
        'inter-medium': ['InterMedium'],
        'inter-semibold': ['InterSemiBold'],
        'inter-bold': ['InterBold'],
      },
    },
  },
  plugins: [],
};
