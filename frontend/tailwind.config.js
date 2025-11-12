/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sal-blue': '#1a2a4f',
        'sal-gold': '#c4a75b',
        'sal-dark': '#0f172a',
        'sal-light': '#f1f5f9',
      },
    },
  },
  plugins: [],
};
