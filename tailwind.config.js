/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        yellow: {
          DEFAULT: '#fed94f',
        },
        blue: {
          DEFAULT: '#6956dc',
        },
        red: {
          DEFAULT: '#d6636b',
        },
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
