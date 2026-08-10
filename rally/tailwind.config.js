/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Sampled from the comps. Keep in sync with theme/colors.ts.
        ground: '#F1F1F1',
        surface: '#FFFFFF',
        inset: '#EAEAEA',
        teal: { DEFAULT: '#2B5561', deep: '#1E3D45', tint: '#E8EFF1' },
        ember: '#E8442C',
        ink: '#1A1A1A',
        muted: '#A0A0A0',
        dot: '#D4D4D4',
        star: '#F5C518',
      },
      fontFamily: {
        // Nunito ships one family per weight, so each registers separately.
        // The `nunito-` prefix keeps these clear of Tailwind's font-weight
        // utilities, which would otherwise collide on `font-bold`.
        nunito: ['Nunito_400Regular'],
        'nunito-semibold': ['Nunito_600SemiBold'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
