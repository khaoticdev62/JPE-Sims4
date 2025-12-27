/** @type {import('tailwindcss').Config} */
import tokens from './src/design-system/tokens.json' assert { type: 'json' }

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors from tokens.json
        // Background colors
        'bg-primary': tokens.colors['background-primary'],
        'bg-secondary': tokens.colors['background-secondary'],
        'bg-tertiary': tokens.colors['background-tertiary'],
        // Text colors
        'text-primary': tokens.colors['text-primary'],
        'text-secondary': tokens.colors['text-secondary'],
        // Accent colors
        'accent-primary': tokens.colors['accent-primary'],
        'accent-focus': tokens.colors['accent-focus'],
        // Border colors
        'border-subtle': tokens.colors['border-subtle'],
        // State colors (PRD-compliant diagnostic colors)
        'state-error': tokens.colors['state-error'],
        'state-warning': tokens.colors['state-warning'],
        'state-info': tokens.colors['state-info'],
        'state-success': tokens.colors['state-success'],
        // Brand colors
        'brand-teal': tokens.colors['brand-teal'],
        'brand-navy': tokens.colors['brand-navy'],
        'brand-light': tokens.colors['brand-light'],
        // Neutral colors
        'neutral-900': tokens.colors['neutral-900'],
        'neutral-700': tokens.colors['neutral-700'],
        'neutral-500': tokens.colors['neutral-500'],
        'neutral-300': tokens.colors['neutral-300'],
        'neutral-100': tokens.colors['neutral-100'],
      },
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
      },
      spacing: {
        ...tokens.spacing,
      },
      fontSize: {
        ...tokens.typography.fontSize,
      },
      fontWeight: {
        ...tokens.typography.fontWeight,
      },
      boxShadow: {
        // Apple TV-style effects
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'apple-md': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'apple-lg': '0 12px 32px rgba(0, 0, 0, 0.6)',
        'focus-glow': `0 0 16px ${tokens.colors['accent-primary']}`,
        'focus-glow-lg': `0 0 24px ${tokens.colors['accent-primary']}`,
      },
    },
  },
  plugins: [],
}
