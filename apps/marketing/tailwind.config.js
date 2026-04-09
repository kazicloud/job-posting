/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#DC842C',
          dark: '#77838F',
        },
        neutral: {
          bg: '#FFFFFF',
          secondary: '#F7F9FC',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cal)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
