/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          100: '#1c2135',
          200: '#202940',
          300: '#3f3c56',
          DEFAULT: '#675878',
          500: '#927699',
        },
      },
    },
  },
  plugins: [],
};
