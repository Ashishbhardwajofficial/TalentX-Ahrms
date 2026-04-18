/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // ── TalentX Brand Palette ──────────────────────────────────
                // Saffron  #FF6B00 → #FF9A3C
                saffron: {
                    50: '#FFF4E6',
                    100: '#FFE4C0',
                    200: '#FFCF96',
                    300: '#FFB566',
                    400: '#FF9A3C',
                    500: '#FF6B00',
                    600: '#E05A00',
                    700: '#B84A00',
                    800: '#8F3900',
                    900: '#662900',
                },
                // Yellow   #FFD700 → #FFC107
                yellow: {
                    50: '#FFFDE7',
                    100: '#FFF9C4',
                    200: '#FFF176',
                    300: '#FFE83A',
                    400: '#FFD700',
                    500: '#FFC107',
                    600: '#FFB300',
                    700: '#FF8F00',
                    800: '#FF6F00',
                    900: '#E65100',
                },
                // Blue     #1565C0 → #42A5F5
                blue: {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#2196F3',
                    600: '#1E88E5',
                    700: '#1976D2',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                // Violet   #7C3AED → #A78BFA
                violet: {
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                    700: '#6D28D9',
                    800: '#5B21B6',
                    900: '#4C1D95',
                },
                // White shades
                white: '#FFFFFF',
                // Primary = Violet (main brand)
                primary: {
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                    700: '#6D28D9',
                    800: '#5B21B6',
                    900: '#4C1D95',
                },
                // Secondary = neutral slate
                secondary: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                success: {
                    50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0',
                    300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E',
                    600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D',
                },
                danger: {
                    50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA',
                    300: '#FCA5A5', 400: '#F87171', 500: '#EF4444',
                    600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D',
                },
                warning: {
                    50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
                    300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
                    600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Lexend', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
                'soft-xl': '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
                'premium': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                'inner-pill': 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
                // Brand glows
                'glow-violet': '0 0 24px rgba(139,92,246,0.45)',
                'glow-saffron': '0 0 24px rgba(255,107,0,0.45)',
                'glow-blue': '0 0 24px rgba(33,150,243,0.45)',
                'glow-yellow': '0 0 24px rgba(255,215,0,0.45)',
                'glow': '0 0 20px rgba(139,92,246,0.35)',
                // 3-D logo shadow
                'logo-3d': '0 6px 0 rgba(76,29,149,0.6), 0 12px 20px rgba(0,0,0,0.4)',
            },
            backgroundImage: {
                // Brand gradients
                'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                'gradient-saffron': 'linear-gradient(135deg, #FF9A3C 0%, #FF6B00 100%)',
                'gradient-yellow': 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                'gradient-blue': 'linear-gradient(135deg, #42A5F5 0%, #1565C0 100%)',
                'gradient-violet': 'linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)',
                // Hero / sidebar gradient
                'gradient-brand': 'linear-gradient(160deg, #1565C0 0%, #7C3AED 40%, #FF6B00 100%)',
                'gradient-sidebar': 'linear-gradient(180deg, #0D1B3E 0%, #1A0A3E 50%, #2D0A00 100%)',
                // Radial
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                // Logo 3D face
                'logo-face': 'linear-gradient(135deg, #FFD700 0%, #FF9A3C 40%, #FF6B00 100%)',
                'logo-top': 'linear-gradient(135deg, #FFF176 0%, #FFD700 100%)',
                'logo-side': 'linear-gradient(135deg, #E05A00 0%, #8F3900 100%)',
            },
            backdropBlur: { xs: '2px' },
            animation: {
                'slide-in': 'slideIn 0.3s ease-out',
                'fade-in': 'fadeIn 0.2s ease-in',
                'scale-in': 'scaleIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                slideIn: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
                slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
                float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
                pulseGlow: { '0%,100%': { boxShadow: '0 0 12px rgba(139,92,246,0.4)' }, '50%': { boxShadow: '0 0 28px rgba(255,107,0,0.6)' } },
            },
        },
    },
    plugins: [],
}
