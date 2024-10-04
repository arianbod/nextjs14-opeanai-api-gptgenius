// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Modern font
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        glassLight: 'rgba(255, 255, 255, 0.2)',
        glassDark: 'rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwindcss-filters'),
  ],
  daisyui: {
    themes: ["winter", "dracula"],
  },
};
