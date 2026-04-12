/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode toggling via class on HTML tag
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Theme system requested
        darkbg: '#020617',
        darkglass: 'rgba(15,23,42,0.6)',
        darkaccent: '#38BDF8',
        lightbg: '#F8FAFC',
        lightglass: 'rgba(255,255,255,0.6)',
        lightaccent: '#2563EB',
        c_green: '#10B981',
        c_yellow: '#F59E0B',
        c_red: '#EF4444',
        c_blue: '#3B82F6'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'lightglass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'neon-blue': '0 0 15px rgba(56, 189, 248, 0.5)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.8)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.6)',
      }
    },
  },
  plugins: [],
}
