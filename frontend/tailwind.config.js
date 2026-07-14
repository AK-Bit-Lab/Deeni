/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        deeni: {
          light: "#ecfdf5",
          DEFAULT: "#10b981",
          dark: "#047857",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        arabic: ['"Scheherazade New"', '"Amiri"', "serif"],
        quran: ['"Amiri"', "serif"],
      },
    },
  },
  plugins: [],
};
