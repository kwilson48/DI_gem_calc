/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        secondary: '#ff9f40',
        accent: '#4ecdc4',
        purple: '#bb86fc',
        gold: '#ffd700',
        silver: '#c0c0c0',
        strife: '#ff4444',
        legendary: '#ff9f40',
        general: '#60a5fa',
        efficiency: '#34d399',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        'gradient-section': 'linear-gradient(145deg, #2a2a2a, #333333)',
        'gradient-scaling': 'linear-gradient(145deg, #2d2a3a, #363344)',
        'gradient-bucket': 'linear-gradient(145deg, #2a3a2d, #334436)',
      }
    },
  },
  plugins: [],
}
