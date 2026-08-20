/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cf: {
          primary: '#F6821F',
          'primary-hover': '#DB6E0F',
          'bg-base': '#FFFFFF',
          'bg-subtle': '#F6F6F7',
          'surface-card': '#FFFFFF',
          border: '#E5E7EB',
          'border-focus': '#F6821F',
          text: '#0B0C0E',
          'text-secondary': '#6B7280',
          'text-muted': '#9CA3AF',
          success: '#0F9D58',
          warning: '#F6C000',
          danger: '#E5484D',
          info: '#2E7DD1',
        },
        status: {
          terjadwal: '#2E7DD1',
          berlangsung: '#F6C000',
          selesai: '#6B7280',
          batal: '#E5484D',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        pill: '999px',
      },
      boxShadow: {
        'cf-card': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'cf-dropdown': '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)',
        'cf-modal': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontSize: {
        'h1': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h2': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      }
    },
  },
  plugins: [],
}
