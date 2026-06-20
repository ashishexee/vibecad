/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: { desktop: '936px' },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'adam-bg-dark': '#191A1A',
        'adam-bg-secondary-dark': '#212121',
        'adam-bg-light': '#E5E5E3',
        'adam-bg-secondary-light': '#ECECEB',
        'adam-blue': '#00A6FF',
        'adam-blue-dark': '#00A6FF',
        'adam-text-primary': '#E5E5E5',
        'adam-text-secondary': '#949494',
        'adam-text-tertiary': '#676767',
        'adam-neutral-100': '#D7D7D7',
        'adam-neutral-200': '#ADADAD',
        'adam-neutral-300': '#949494',
        'adam-neutral-400': '#676767',
        'adam-neutral-500': '#5A5A5A',
        'adam-neutral-700': '#3B3B3B',
        'adam-neutral-800': '#2D2D2D',
        'adam-neutral-900': '#171818',
        'adam-neutral-950': '#111111',
        'adam-neutral-0': '#F6F6F6',
        'adam-background-1': '#212121',
        'adam-background-2': '#191A1A',
        'sidebar-color': '#212121',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
