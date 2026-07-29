/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Chompo brand world
        chompo: {
          red: "#E13B33", // the brand field
          redDark: "#C22B24", // pressed / depth
          cream: "#F5EDDF", // wordmark + copy on red
          ink: "#141210", // splash edges / dark chrome
          cheese: "#F4B400", // single warm accent
          char: "#3A2A18", // grill-char brown for texture text
        },
      },
      fontFamily: {
        // Tall condensed display — the CHOMPO wordmark
        display: ["Anton"],
        // Chunky nav + buttons
        black: ["Archivo_900Black"],
        bold: ["Archivo_700Bold"],
        semibold: ["Archivo_600SemiBold"],
        body: ["Archivo_400Regular"],
      },
      letterSpacing: {
        tightest: "-1.5px",
      },
    },
  },
  plugins: [],
};
