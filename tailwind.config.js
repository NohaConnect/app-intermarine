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
          50: '#f5f3ef',
          100: '#e8e4db',
          200: '#d8d1c3',
          300: '#c8c0af',
          400: '#b0a794',
          500: '#97907d',
          600: '#75777b',
          700: '#4a4d52',
          800: '#1e2028',
          900: '#141720',
          950: '#0a0e1a'
        },
        accent: {
          teal: '#4ecdc4',
          blue: '#4da8da',
          purple: '#8b5cf6',
          gold: '#c8c0af',
          rose: '#e056a0',
          coral: '#e74c5e',
          orange: '#f0a35e',
          sky: '#3d7cf5',
          indigo: '#6366f1'
        },
        maritime: {
          deep: '#0a0e1a',
          navy: '#141720',
          wave: '#1a2332',
          shore: '#1e293b',
          foam: '#c8c0af'
        }
      },
      screens: {
        'landscape': { raw: '(orientation: landscape) and (max-height: 500px)' }
      },
      backgroundImage: {
        'maritime-gradient': 'linear-gradient(160deg, #0a0e1a 0%, #141720 40%, #0f1a2e 70%, #0a0e1a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c8c0af 0%, #a89e8c 100%)',
        'teal-gradient': 'linear-gradient(135deg, #4ecdc4 0%, #44b8b0 100%)',
        'violet-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      }
    }
  },
  plugins: []
}
