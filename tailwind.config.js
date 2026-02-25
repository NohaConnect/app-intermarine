/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#4c6ef5',
          600: '#3b5bdb',
          700: '#364fc7',
          800: '#1e3a5f',
          900: '#0f1729',
          950: '#080d18'
        },
        accent: {
          teal: '#4ecdc4',
          blue: '#4da8da',
          purple: '#818cf8',
          gold: '#c4a35a',
          rose: '#e056a0',
          coral: '#e74c5e',
          orange: '#f0a35e',
          sky: '#3d7cf5',
          indigo: '#6366f1'
        }
      },
      screens: {
        'landscape': { raw: '(orientation: landscape) and (max-height: 500px)' }
      }
    }
  },
  plugins: []
}
