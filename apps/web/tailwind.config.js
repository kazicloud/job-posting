/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/@repo/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#DC842C",
          dark: "#77838F",
        },
        neutral: {
          bg: "#FFFFFF",
          "bg-secondary": "#F7F9FC",
          surface: "#FFFFFF",
          text: "#0F172A",
          "text-secondary": "#475569",
          "text-muted": "#94A3B8",
          border: "#E2E8F0",
          hover: "#F1F5F9",
        },
      },
    },
  },
  plugins: [],
};
