/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'site-black': '#1F1D2B',
        'dim-white': '#E2E2E2',
        'site-pink': '#E8006F',
        'site-dim': 'rgba(255, 255, 255, 0.02)',
        'site-dim2': 'rgba(255, 255, 255, 0.13)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(0, 0, 0, 0.07)',
      },
      backgroundImage: {
        'gradient-btn': 'linear-gradient(103.91deg, #9b51e0 21.01%, rgba(48, 129, 237, 0.8) 100%)',
        'gradient-border': 'linear-gradient(168.82deg, #fb37ff 1.7%, rgba(155, 111, 238, 0) 27.12%, rgba(123, 127, 234, 0) 61.28%, #1bb2de 99.52%)',
        'pink-glow': 'radial-gradient(circle at 0% 0%, #fb37ff, transparent 70%)',
        'blue-glow': 'radial-gradient(circle at 100% 100%, #18b2de, transparent 70%)',
      },
    },
  },
  plugins: [],
}