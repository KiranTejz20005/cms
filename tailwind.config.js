/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Educational & Professional Palette
                primary: {
                    DEFAULT: '#276EF1',
                    50: '#EBF3FE',
                    100: '#D6E7FD',
                    200: '#AECFFB',
                    300: '#85B7F9',
                    400: '#5D9FF7',
                    500: '#276EF1',
                    600: '#1F58C1',
                    700: '#174291',
                    800: '#0F2C61',
                    900: '#081630',
                },
                background: {
                    DEFAULT: '#F8FAFC',
                    secondary: '#F1F5F9',
                    tertiary: '#E2E8F0',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    elevated: '#FFFFFF',
                },
                text: {
                    primary: '#0F172A',
                    secondary: '#475569',
                    tertiary: '#94A3B8',
                    inverse: '#FFFFFF',
                },
                success: {
                    DEFAULT: '#10B981',
                    light: '#D1FAE5',
                    dark: '#047857',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    light: '#FEF3C7',
                    dark: '#D97706',
                },
                error: {
                    DEFAULT: '#EF4444',
                    light: '#FEE2E2',
                    dark: '#DC2626',
                },
                info: {
                    DEFAULT: '#3B82F6',
                    light: '#DBEAFE',
                    dark: '#1D4ED8',
                },
                border: {
                    DEFAULT: '#E2E8F0',
                    light: '#F1F5F9',
                    dark: '#CBD5E1',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                header: ['Manrope', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'monospace'],
            },
            fontSize: {
                // Fluid typography for better responsiveness
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'sm': '0.375rem',
                'DEFAULT': '0.5rem',
                'md': '0.625rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(39, 110, 241, 0.15)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
