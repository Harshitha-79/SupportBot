/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0b1020',
          blue: '#071033',
          'blue-600': '#0f172a',
          purple: '#7c3aed',
          'purple-600': '#6d28d9',
          green: '#10b981',
          slate: {
            50: '#0f172a'
          }
        },
        accent: {
          white: '#ffffff',
          soft: '#f8f7ff'
        }
      }
    }
  },
  plugins: [],
}

