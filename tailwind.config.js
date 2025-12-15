/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js"],
  theme: {
    extend: {
      fontFamily: {
        // Using a Bengali-friendly font from Google Fonts (linked in HTML)
        bengali: ['"Noto Sans Bengali"', 'sans-serif'],
      },
      colors: {
        'fab-primary': '#0D9488', // Teal 600
        'fab-accent': '#FDE047', // Yellow 300
      },
      keyframes: {
        // Custom animation for the header text slider/marquee
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        // Custom animation for the winner reveal
        'glow-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 5px #FDE047, 0 0 10px #FDE047, 0 0 15px #FDE047, 0 0 20px #FDE047', 
            transform: 'scale(1)' 
          },
          '50%': { 
            textShadow: '0 0 15px #FDE047, 0 0 30px #FDE047, 0 0 45px #FDE047, 0 0 60px #FDE047',
            transform: 'scale(1.05)'
          },
        },
        // Keyframes for the Countdown animation (scale + fade)
        'countdown-scale': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '0', transform: 'scale(1.5)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'countdown-scale': 'countdown-scale 900ms ease-out', // Adjusted for 1 second per number
      }
    },
  },
  darkMode: 'class', // Enable dark mode
  plugins: [],
}