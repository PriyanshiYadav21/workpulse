/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff7e3',
          100: '#fff1ca',
          200: '#fde3a5',
          300: '#f9cb6f',
          400: '#e9a843',
          500: '#a86a24',
          600: '#7b4b18',
          700: '#5d3912',
          800: '#43290f',
          900: '#2d1d0c',
        },
        cream: '#fefae0',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(168,106,36,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,106,36,0.08) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(254,250,224,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(254,250,224,0.08) 1px, transparent 1px)',
        'aurora':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168,106,36,0.22), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 50%, rgba(254,250,224,0.16), transparent 60%), radial-gradient(ellipse 50% 50% at 10% 80%, rgba(255,211,142,0.18), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,106,36,0.25), 0 10px 40px -10px rgba(168,106,36,0.35)',
        'glow-amber': '0 0 0 1px rgba(255,211,142,0.25), 0 10px 40px -10px rgba(255,211,142,0.35)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
