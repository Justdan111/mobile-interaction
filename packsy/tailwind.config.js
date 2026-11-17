/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--color-page) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        raised: 'rgb(var(--color-raised) / <alpha-value>)',
        bar: 'rgb(var(--color-bar) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        faint: 'rgb(var(--color-faint) / <alpha-value>)',
        pill: 'rgb(var(--color-pill) / <alpha-value>)',
        sun: 'rgb(var(--color-sun) / <alpha-value>)',
        iris: 'rgb(var(--color-iris) / <alpha-value>)',
        coral: 'rgb(var(--color-coral) / <alpha-value>)',
        go: 'rgb(var(--color-go) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
