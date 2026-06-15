/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#3B5BDB',
          600: '#1E3A8A',
          700: '#172554',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#047857',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#065F46',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        surface: '#FFFFFF',
        border: '#E5E7EB',
        ring: '#1E3A8A',
        payment: {
          cash: '#047857',
          credit: '#2563EB',
          debit: '#8B5CF6',
          pix: '#06B6D4',
          fiado: '#F59E0B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: { DEFAULT: '0.5rem' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
