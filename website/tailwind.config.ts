import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#0F172A',
                    gold: '#D4AF37',
                },
                stone: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A', // Navy base
                    950: '#020617',
                },
                amber: {
                    800: '#D4AF37', // Mapping old amber to Gold
                },
            },
        },
        fontFamily: {
            display: ['Outfit', 'sans-serif'],
            sans: ['Inter', 'sans-serif'],
        },
        animation: {
            'fade-in': 'fadeIn 0.5s ease-in-out',
            'slide-up': 'slideUp 0.6s ease-out',
            'scale-in': 'scaleIn 0.4s ease-out',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
            slideUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            scaleIn: {
                '0%': { opacity: '0', transform: 'scale(0.95)' },
                '100%': { opacity: '1', transform: 'scale(1)' },
            },
        },
    },
    plugins: [],
}

export default config
