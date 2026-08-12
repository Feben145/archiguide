import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          4: 'var(--bg-4)',
          5: 'var(--bg-5)',
        },

        border: {
          1: 'var(--border-1)',
          2: 'var(--border-2)',
          3: 'var(--border-3)',
          4: 'var(--border-4)',
        },

        text: {
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
          4: 'var(--text-4)',
        },
        accent: {
          DEFAULT: '#5b6ef5',
          2: '#8b5cf6',
          3: '#06b6d4',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
        pink:    '#ec4899',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        syne:  ['Syne', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
