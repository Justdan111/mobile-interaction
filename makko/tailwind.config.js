/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--color-page) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        faint: 'rgb(var(--color-faint) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        blue: 'rgb(var(--color-blue) / <alpha-value>)',
        mist: 'rgb(var(--color-mist) / <alpha-value>)',
        peach: 'rgb(var(--color-peach) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
