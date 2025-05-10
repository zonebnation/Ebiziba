/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDF9',
          100: '#CCFBEF',
          200: '#99F6E0',
          300: '#5CEDC4',
          400: '#2CD9AC',
          500: '#0AC5A0',
          600: '#0B9577',
          700: '#0C6B57',
          800: '#0D4237',
          900: '#072D25',
        },
        secondary: {
          50: '#FFF9EC',
          100: '#FFE4B0',
          200: '#FFD074',
          300: '#FFBC38',
          400: '#FFA800',
          500: '#E69500',
          600: '#CC7A00',
          700: '#B35E00',
          800: '#994200',
          900: '#802600',
        },
        surface: {
          50: '#F8FAFF',
          100: '#E6EDFF',
          200: '#D4E0FF',
          300: '#ADC3FF',
          400: '#85A5FF',
          500: '#5C88FF',
          600: '#3366FF',
          700: '#0A44FF',
          800: '#0033E6',
          900: '#0029B3',
        },
        accent: {
          50: '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFB8B8',
          300: '#FF9999',
          400: '#FF7A7A',
          500: '#FF5C5C',
          600: '#FF3D3D',
          700: '#FF1F1F',
          800: '#FF0000',
          900: '#E60000',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 24px -1px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
