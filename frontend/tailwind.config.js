/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07060a',
          900: '#0d0c14',
          850: '#12101b',
          800: '#181524',
          750: '#1f1b2e',
          700: '#28233c',
          600: '#383254',
        },
        brand: {
          purple: '#8b5cf6',
          violet: '#7c3aed',
          fuchsia: '#c026d3',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(13, 12, 20, 0.95) 100%)',
        'card-glow': 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15), transparent 70%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-purple': '0 0 25px -5px rgba(139, 92, 246, 0.5)',
        'neon-blue': '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'glow': '0 0 40px -10px rgba(124, 58, 237, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

