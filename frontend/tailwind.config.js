/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2430',
          soft: '#242F3D',
          faint: '#2E3A4A'
        },
        paper: {
          DEFAULT: '#F7F5F0',
          dim: '#EFECE4',
          card: '#FFFFFF'
        },
        moss: {
          DEFAULT: '#3F6752',
          light: '#5C8770',
          dark: '#2C4A3B'
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E0BE4F'
        },
        rust: {
          DEFAULT: '#B54834',
          light: '#D46B54'
        },
        slate: {
          DEFAULT: '#6B7280',
          light: '#9AA1AC'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 36, 48, 0.06), 0 1px 1px rgba(27, 36, 48, 0.04)'
      },
      borderRadius: {
        card: '10px'
      }
    }
  },
  plugins: []
}
