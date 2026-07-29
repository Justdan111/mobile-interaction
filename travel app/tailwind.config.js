/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F3F1',
        ink: '#191919',
        muted: '#8E8E93',
      },
    },
  },
  plugins: [],
};
