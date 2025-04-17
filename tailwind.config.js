/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'healing-blue': '#E8F4FF',
        'healing-purple': '#F3E8FF',
        'healing-pink': '#FFF0F7',
        'healing-mint': '#E8FFF8',
      },
    },
  },
  plugins: [],
};