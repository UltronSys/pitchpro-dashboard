/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A7C59',
          50: '#f4f7f5',
          100: '#e5ebe8',
          200: '#c8d7ce',
          300: '#9fb8aa',
          400: '#729381',
          500: '#4A7C59',
          600: '#3a6347',
          700: '#2f4f3a',
          800: '#274030',
          900: '#213527',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        card: {
          red: '#FEF2F2',
          green: '#F0FDF4', 
          blue: '#EFF6FF',
          purple: '#FAF5FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '208': '208px',
      },
      width: {
        'sidebar': '208px',
      },
      height: {
        'header': '64px',
      }
    },
  },
  plugins: [],
}