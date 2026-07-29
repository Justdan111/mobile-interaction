/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14',
        panel: '#10141C',
        ridge: '#161B25',
        pulse: '#2547F4',
        bone: '#F2F3F5',
        smoke: '#9AA0AB',
        // Light content screens (collection / details)
        paper: '#F1F0EC',
        graphite: '#14171C',
        haze: '#A7ADB6',
      },
      fontFamily: {
        display: ['Michroma_400Regular'],
        grotesk: ['SpaceGrotesk_400Regular'],
        groteskMedium: ['SpaceGrotesk_500Medium'],
        techno: ['ChakraPetch_400Regular'],
        technoMed: ['ChakraPetch_500Medium'],
        technoSemi: ['ChakraPetch_600SemiBold'],
        technoBold: ['ChakraPetch_700Bold'],
      },
    },
  },
  plugins: [],
};
