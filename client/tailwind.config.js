/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080B10',
          card: '#0F1622',
          border: '#1E293B',
          hover: '#1E293B',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          purple: '#A855F7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 12px 40px rgba(0, 0, 0, 0.06), 0 1px 5px rgba(0, 0, 0, 0.03)',
        'premium-dark': '0 8px 30px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)',
        'premium-dark-hover': '0 12px 40px rgba(0, 0, 0, 0.45), 0 1px 5px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.45)' },
        },
      },
    },
  },
  plugins: [],
};

