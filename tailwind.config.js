/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    },
    extend: {
      colors: {
        // App background (behind cards)
        app: {
          DEFAULT: '#C5CBD6',
          dark: '#B0B8C5',
          light: '#D4D9E2',
        },
        // Card surfaces
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#FAFBFC',
          nested: '#F5F7FA',
          active: '#EEF1F6',
        },
        // Input fields
        input: {
          DEFAULT: '#F3F5F8',
          focus: '#FFFFFF',
        },
        // Text hierarchy
        txt: {
          primary: '#1A1D23',
          secondary: '#5A6170',
          tertiary: '#8C919D',
          inverse: '#FFFFFF',
        },
        // Accent — Mikołaj (blue)
        accent: {
          DEFAULT: '#3B6FD4',
          light: '#EBF1FC',
          dark: '#2D5AB3',
        },
        // Accent — Emilka (purple)
        'accent-alt': {
          DEFAULT: '#8B5CF6',
          light: '#F1ECFE',
          dark: '#7040E0',
        },
        // Status colors
        status: {
          sent: '#8C919D',
          'sent-bg': '#F0F1F3',
          interview: '#3B6FD4',
          'interview-bg': '#EBF1FC',
          waiting: '#D4900A',
          'waiting-bg': '#FEF5E7',
          offer: '#1D8A56',
          'offer-bg': '#E8F7F0',
          rejected: '#C93B3B',
          'rejected-bg': '#FDECEC',
        },
        // Priority colors
        priority: {
          high: '#C93B3B',
          'high-bg': '#FDECEC',
          promising: '#1D8A56',
          'promising-bg': '#E8F7F0',
        },
        // Calendar event types
        cal: {
          interview: '#3B6FD4',
          preparation: '#D4900A',
          followup: '#1D8A56',
          deadline: '#C93B3B',
          other: '#8C919D',
        },
        // Borders
        border: {
          DEFAULT: '#E5E8ED',
          subtle: '#EEF0F4',
        },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],    // 13px
        'base': ['0.9375rem', { lineHeight: '1.5rem' }],   // 15px
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],    // 18px
        'xl': ['1.375rem', { lineHeight: '1.75rem' }],     // 22px
        '2xl': ['1.75rem', { lineHeight: '2.125rem' }],    // 28px
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],      // 36px
        '4xl': ['3rem', { lineHeight: '3.25rem' }],        // 48px
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04)',
        'modal': '0 16px 48px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'none': 'none',
      },
      spacing: {
        '4.5': '1.125rem',  // 18px
        '7': '1.75rem',     // 28px — card padding
        '18': '4.5rem',     // 72px — topbar height
        '65': '16.25rem',   // 260px — sidebar width
        '72': '4.5rem',     // sidebar collapsed
      },
      width: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'search': '320px',
        'command-palette': '560px',
      },
      height: {
        'topbar': '72px',
        'map-sm': '160px',
        'map-md': '200px',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
      },
    },
  },
  plugins: [],
}
