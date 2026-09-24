/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c5d9eb',
          300: '#99bcdd',
          400: '#679bcc',
          500: '#437dbb',
          600: '#3263a2',
          700: '#284e83',
          800: '#1e3a8a',
          900: '#0f2c59',
          950: '#0a1a36',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'xs': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'sm': '0 2px 6px -1px rgba(15, 23, 42, 0.07), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        DEFAULT: '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'md': '0 8px 20px -3px rgba(15, 23, 42, 0.09), 0 3px 8px -2px rgba(15, 23, 42, 0.04)',
        'lg': '0 14px 28px -4px rgba(15, 23, 42, 0.11), 0 6px 12px -3px rgba(15, 23, 42, 0.05)',
        'card': '0 2px 8px -1px rgba(15, 23, 42, 0.07), 0 1px 3px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 24px -3px rgba(15, 23, 42, 0.11), 0 4px 8px -2px rgba(15, 23, 42, 0.05)',
        'xl': '0 20px 32px -6px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        '2xl': '0 28px 48px -12px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
}
