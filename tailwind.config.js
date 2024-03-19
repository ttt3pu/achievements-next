/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      maxWidth: {
        'contents-with-p': 'calc(var(--contents-width) + 40px)',
        contents: 'var(--contents-width)',
      },
      fontFamily: {
        en: "'Poppins', sans-serif",
        jp: "'Noto Sans JP', sans-serif",
      },
      colors: {
        link: {
          DEFAULT: '#fff7d6',
          500: '#fffbef',
        },
        yellow: {
          DEFAULT: '#f1c039',
        },
        blue: {
          DEFAULT: '#6956dc',
        },
        red: {
          DEFAULT: '#ff3848',
        },
        white: {
          DEFAULT: '#eee',
        },
        orange: {
          DEFAULT: '#f87841',
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
