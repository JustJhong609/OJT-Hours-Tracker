/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          page: '#f5efe0',
          card: '#ede4cc',
          surface: '#e8d9b8',
          border: '#c4a882',
          emphasis: '#a07840',
        },
        sepia: {
          950: '#2c1f10',
          900: '#3b2a14',
          700: '#7a5c38',
          500: '#a08050',
        },
        amber: '#b87333',
        sage: '#6b8e4e',
      },
      boxShadow: {
        paper: '0 16px 40px rgba(92, 61, 30, 0.16)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Courier Prime', 'IM Fell English', 'serif'],
      },
    },
  },
  plugins: [],
};