/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        uber: {
          black: '#121212',
          dark: '#1e1e1e',
          card: '#242424',
          accent: '#06c167',
          blue: '#276ef1',
        }
      },
      animation: {
        'pulse-radar': 'pulseRadar 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ring-bell': 'ringBell 1s ease-in-out infinite'
      },
      keyframes: {
        pulseRadar: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' }
        },
        ringBell: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%, 60%': { transform: 'rotate(15deg)' },
          '40%, 80%': { transform: 'rotate(-15deg)' }
        }
      }
    },
  },
  plugins: [],
}
