/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#213B2F',
        ivory: '#F0EFEA',
        olive: '#4C7061',
        warmgrey: '#69776E',
        borderline: 'rgba(33, 59, 47, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        'h1': 'clamp(2.5rem, 5vw + 1rem, 5rem)',
        'h2': 'clamp(2rem, 3vw + 0.5rem, 3.5rem)',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.01em',
        wide: '0.05em',
        wider: '0.1em',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '6px',
        md: '6px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      maxWidth: {
        content: '1180px',
      },
      spacing: {
        '21': '5.25rem',
      },
      transitionDuration: {
        smooth: '120ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(2px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '200% 0',
          },
          '100%': {
            backgroundPosition: '-200% 0',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
