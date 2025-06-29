/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      container: {
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
};
