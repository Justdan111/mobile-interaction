/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // The app is dark-only and pins the scheme itself, so the runtime must own
  // the flag rather than defer to the `media` query.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // The screen is unlit OLED black — every surface floats on top of it.
        void: '#000000',
        card: { edge: '#66626B' },
        panel: { edge: '#2C243C' },
        chip: { DEFAULT: '#0A0A0B', active: '#4C3C68', edge: '#2A2A2C' },
        badge: { DEFAULT: '#D8B4F0', ink: '#2A1245' },
        button: { DEFAULT: '#111111', edge: '#6B676F' },
        menu: '#343434',
        // Type ramp on black.
        chalk: '#FFFFFF',
        mist: '#C9C6CF',
        smoke: '#8A8792',
        rule: '#FFFFFF',
      },
      fontFamily: {
        // Inter ships one family per weight, so each is registered separately.
        // The `inter-` prefix keeps these clear of Tailwind's font-weight
        // utilities, which would otherwise collide on `font-bold`.
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
