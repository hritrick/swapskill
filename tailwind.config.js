/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EEE1",
        "paper-2": "#EAE3CF",
        ink: "#1B2B2A",
        teal: {
          DEFAULT: "#1F6F6B",
          dark: "#154F4C",
        },
        mustard: "#E8A33D",
        line: "#C9C0A4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
