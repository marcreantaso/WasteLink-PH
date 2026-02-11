// WasteLink PH — Design Tokens
// Low-literacy optimized: large touch targets, high contrast, icon-first

export const colors = {
    // Primary — Eco Green
    primary: '#0D9F61',
    primaryLight: '#4ECD8E',
    primaryDark: '#087A49',
    primaryBg: '#E8F8F0',

    // Secondary — Warm Orange (action/CTA)
    secondary: '#F7941D',
    secondaryLight: '#FFBE76',
    secondaryDark: '#D97706',

    // Accent — Ocean Blue (info/links)
    accent: '#2196F3',
    accentLight: '#90CAF9',

    // Neutrals
    white: '#FFFFFF',
    bg: '#F5F7FA',
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#1A202C',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',

    // Material colors (for recyclable badges)
    pet: '#2196F3',
    hdpe: '#9C27B0',
    metal: '#78909C',
    paper: '#8D6E63',
    organic: '#4CAF50',
    other: '#9E9E9E',
};

export const typography = {
    // Font sizes — larger for low-literacy users
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
    h2: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '700', lineHeight: 24, letterSpacing: 0.5 },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

// Minimum touch target for accessibility (48dp)
export const touchTarget = {
    minHeight: 52,
    minWidth: 52,
};

export default { colors, typography, spacing, borderRadius, shadows, touchTarget };
