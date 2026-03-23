// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- FINAL MEDIUM SEA GREEN THEME ---
        'primary-950': '#0d3216',        // Extra Dark Forest Green
        'primary-900': '#155724',       // Dark Forest Green
        'primary-700': '#1e7b30',       // Darker Green for hover states
        'accent-400': '#3CB371',        // Medium Sea Green
        'accent-500': '#2E8B57',        // Darker Medium Sea Green
        'accent-600': '#246e44',        // Deep Sea Green
        'accent-700': '#1b5233',        // Darkest Sea Green
        'neutral-bg-light': '#ffffff',  // Pure White
        'neutral-bg-subtle': '#F4F7F9', // Very Light Gray
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.1)',
        'accent-glow': '0 35px 60px -15px rgba(46, 139, 87, 0.2)',
      },
    },
  },
  plugins: [],
}