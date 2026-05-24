/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0f172a',
          darker: '#020617',
          blue: '#0ea5e9',
          neon: '#38bdf8',
          purple: '#8b5cf6',
          cyan: '#22d3ee',
          green: '#10b981',
          red: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
