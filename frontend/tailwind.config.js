/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Netflix-inspired dark base
        background: '#0A0A0A',
        surface: '#141414',
        surfaceHigh: '#1A1A1A',
        surfaceTop: '#252525',
        border: '#2A2A2A',

        // Brand red (Netflix DNA)
        brand: '#E50914',
        brandHover: '#F40612',
        brandDim: 'rgba(229,9,20,0.15)',

        // Accent blue (premium data viz)
        accent: '#4F9EF8',
        accentDim: 'rgba(79,158,248,0.12)',

        // Status colors — muted, professional
        success: '#22C55E',
        successDim: 'rgba(34,197,94,0.12)',
        warning: '#F59E0B',
        warningDim: 'rgba(245,158,11,0.12)',
        danger: '#EF4444',
        dangerDim: 'rgba(239,68,68,0.12)',

        // Text hierarchy
        textPrimary: '#FFFFFF',
        textSecondary: '#B3B3B3',
        textMuted: '#6B7280',
        textDim: '#4B5563',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-up-delay': 'fadeUp 0.5s ease-out 0.15s forwards',
        'fade-up-delay2': 'fadeUp 0.5s ease-out 0.3s forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-brand': 'pulseBrand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'progress': 'progressFill 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'counter': 'counterFade 0.8s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        'number-rise': 'numberRise 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(229,9,20,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(229,9,20,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        numberRise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'brand': '0 0 20px rgba(229,9,20,0.3)',
        'brand-lg': '0 0 40px rgba(229,9,20,0.4)',
        'accent': '0 0 20px rgba(79,158,248,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.8)',
        'inset-border': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E50914 0%, #B91C1C 100%)',
        'surface-gradient': 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
