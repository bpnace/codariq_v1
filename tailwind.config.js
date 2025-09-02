/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      sm: '390px', // Mobile optimized
      md: '768px', // Tablet optimized
      lg: '1024px', // Small desktop
      xl: '1440px', // Desktop optimized
      '2xl': '1536px', // Large desktop
    },
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1E3A8A', // Primary brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#fff5f0',
          100: '#ffe8e0',
          200: '#ffd0c2',
          300: '#ffaf94',
          400: '#ff8566',
          500: '#FF5F00', // Main accent color
          600: '#e6560a',
          700: '#cc4d00',
          800: '#b34300',
          900: '#993a00',
        },
      },
      fontFamily: {
        sans: ['Switzer Variable', 'system-ui', '-apple-system', 'sans-serif'], // All text
        serif: ['Switzer Variable', 'system-ui', '-apple-system', 'sans-serif'], // Headers use same font
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['2.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        h2: ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h3: ['1.875rem', { lineHeight: '1.3' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        // Animations temporarily disabled
        'fade-in': 'none',
        'slide-up': 'none',
        'fade-in-up': 'none',
        'slide-down': 'none',
        counter: 'counter 2s ease-out', // Keep counter for statistics
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        counter: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        medium:
          '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        strong:
          '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
