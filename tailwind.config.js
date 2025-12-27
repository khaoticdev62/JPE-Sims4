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
        'bg-primary': tokens.colors['background-primary'],
        'bg-secondary': tokens.colors['background-secondary'],
        'bg-tertiary': tokens.colors['background-tertiary'],
        'text-primary': tokens.colors['text-primary'],
        'text-secondary': tokens.colors['text-secondary'],
        'accent-primary': tokens.colors['accent-primary'],
        'accent-focus': tokens.colors['accent-focus'],
        'border-subtle': tokens.colors['border-subtle'],
        'state-error': tokens.colors['state-error'],
        'state-success': tokens.colors['state-success'],
        'state-warning': tokens.colors['state-warning'],
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
